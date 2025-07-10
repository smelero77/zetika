import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '~/server/db';
import { logger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';
const PAGE_SIZE = 200;

/**
 * Función helper para hacer upsert con retry para errores de prepared statements
 */
async function upsertWithRetry(model: any, params: any, maxRetries = 3): Promise<any> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await model.upsert(params);
    } catch (error: any) {
      lastError = error;
      
      // Verificar si es el error específico de prepared statements
      if (error.message?.includes('prepared statement') && (error.message?.includes('does not exist') || error.message?.includes('already exists'))) {
        logger.warn(`Prepared statement error, intento ${attempt}/${maxRetries}`, { 
          error: error.message,
          attempt 
        });
        
        // Esperar un poco antes del siguiente intento
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
      }
      
      // Si no es el error de prepared statements o se agotaron los intentos, relanzar
      throw error;
    }
  }
  
  throw lastError;
}

async function syncPartidosPoliticos(jobName: string, runId: string) {
  const logMeta = { jobName, runId, catalogName: 'ConcesionesPartidosPoliticos' };
  logger.info('Iniciando sincronización de Concesiones a Partidos Políticos', logMeta);
  metrics.increment('etl.jobs.started');

  let totalProcessed = 0;
  let totalErrors = 0;
  let currentPage = 0;
  let isLastPage = false;
  let totalPagesFailed = 0;

  const startAll = Date.now();

  while (!isLastPage) {
    const pageMeta = { ...logMeta, page: currentPage };
    logger.info(`Pidiendo página ${currentPage}...`, pageMeta);
    metrics.increment('etl.pages.fetched');

    const url = new URL(`${SNPSAP_API_BASE_URL}/partidospoliticos/busqueda`);
    url.searchParams.append('vpd', PORTAL);
    url.searchParams.append('pageSize', String(PAGE_SIZE));
    url.searchParams.append('page', String(currentPage));
    url.searchParams.append('order', 'fechaConcesion');
    url.searchParams.append('direccion', 'desc');

    let response;
    try {
      response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        totalErrors++;
        totalPagesFailed++;
        logger.warn('Fallo fetching página de partidos políticos', { ...pageMeta, status: response.status });
        metrics.increment('etl.pages.failed');
        break;
      }
    } catch (error: any) {
      totalErrors++;
      totalPagesFailed++;
      logger.error('Error de red al fetch partidos políticos', { ...pageMeta, error: error.message });
      metrics.increment('etl.pages.failed');
      break;
    }

    const data = await response.json();
    const items = data.content || [];
    isLastPage = data.last ?? true;

    logger.info('Página de partidos políticos recibida', { ...pageMeta, count: items.length });
    metrics.gauge('etl.pages.item_count', items.length);

    for (const item of items) {
      const itemMeta = { ...pageMeta, idConcesion: item.id };
      const startItem = Date.now();
      try {
        // Verificamos que la convocatoria asociada exista en nuestra BD
        const convocatoriaAsociada = await db.convocatoria.findUnique({
          where: { idOficial: item.idConvocatoria },
        });

        if (!convocatoriaAsociada) {
          logger.warn('Saltando concesión a partido político: convocatoria no encontrada', { ...itemMeta, idConvocatoria: item.idConvocatoria });
          totalErrors++;
          metrics.increment('etl.items.errors');
          continue;
        }

        await upsertWithRetry(db.concesionPartidoPolitico, {
          where: { idOficial: item.id },
          update: {
            importe: item.importe,
            ayudaEquivalente: item.ayudaEquivalente,
          },
          create: {
            idOficial: item.id,
            numeroConvocatoria: item.numeroConvocatoria,
            tituloConvocatoria: item.convocatoria,
            urlBasesReguladoras: item.urlBR,
            codConcesion: item.codConcesion,
            beneficiario: item.beneficiario,
            instrumento: item.instrumento,
            importe: item.importe,
            ayudaEquivalente: item.ayudaEquivalente,
            tieneProyecto: item.tieneProyecto,
            fechaConcesion: new Date(item.fechaConcesion),
            convocatoriaId: item.idConvocatoria,
          },
        });
        totalProcessed++;
        metrics.increment('etl.items.processed');
        const duration = Date.now() - startItem;
        metrics.histogram('etl.items.processed.duration_ms', duration);
        logger.info('Concesión a partido político procesada exitosamente', { ...itemMeta, durationMs: duration });
      } catch (e: any) {
        totalErrors++;
        metrics.increment('etl.items.errors');
        logger.error('Error procesando concesión a partido político', { ...itemMeta, error: e.message });
      }
    }

    currentPage++;
  }

  const totalDuration = Date.now() - startAll;
  logger.info('Sincronización de Concesiones a Partidos Políticos finalizada', { jobName, runId, totalProcessed, totalErrors, totalPagesFailed, durationMs: totalDuration });
  metrics.increment('etl.jobs.completed');
  metrics.increment('etl.pages.failed', totalPagesFailed);
  metrics.increment('etl.items.processed', totalProcessed);
  metrics.increment('etl.items.errors', totalErrors);
  metrics.histogram('etl.jobs.duration_ms', totalDuration);

  return { processed: totalProcessed, errors: totalErrors };
}

export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = 'sync-partidos-politicos';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Partidos Políticos Invocado', { jobName, runId });

  try {
    const stats = await syncPartidosPoliticos(jobName, runId);
    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Partidos Políticos Completado', { jobName, runId, ...stats, durationMs });
    return NextResponse.json({ success: stats.errors === 0, stats });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    logger.error('Job Partidos Políticos Falló Catastróficamente', { jobName, runId, error: error.message, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 