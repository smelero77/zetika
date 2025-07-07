import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '~/server/db';
import { logger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';
const PAGE_SIZE = 200;

async function syncSanciones(jobName: string, runId: string) {
  const logMeta = { jobName, runId, catalogName: 'Sanciones' };
  logger.info('Iniciando sincronización de Sanciones', logMeta);
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

    const url = new URL(`${SNPSAP_API_BASE_URL}/sanciones/busqueda`);
    url.searchParams.append('vpd', PORTAL);
    url.searchParams.append('pageSize', String(PAGE_SIZE));
    url.searchParams.append('page', String(currentPage));
    url.searchParams.append('order', 'fechaSancion');
    url.searchParams.append('direccion', 'desc');

    let response;
    try {
      response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        totalErrors++;
        totalPagesFailed++;
        logger.warn('Fallo fetching página de sanciones', { ...pageMeta, status: response.status });
        metrics.increment('etl.pages.failed');
        break;
      }
    } catch (error: any) {
      totalErrors++;
      totalPagesFailed++;
      logger.error('Error de red al fetch sanciones', { ...pageMeta, error: error.message });
      metrics.increment('etl.pages.failed');
      break;
    }

    const data = await response.json();
    const items = data.content || [];
    isLastPage = data.last ?? true;

    logger.info('Página de sanciones recibida', { ...pageMeta, count: items.length });
    metrics.gauge('etl.pages.item_count', items.length);

    for (const item of items) {
      const itemMeta = { ...pageMeta, numeroConvocatoria: item.numeroConvocatoria, sancionado: item.sancionado };
      const startItem = Date.now();
      try {
        // Verificamos que la convocatoria asociada exista en nuestra BD
        const convocatoriaAsociada = await db.convocatoria.findUnique({
          where: { codigoBDNS: item.numeroConvocatoria },
        });

        if (!convocatoriaAsociada) {
          logger.warn('Saltando sanción: convocatoria no encontrada', { ...itemMeta, numeroConvocatoria: item.numeroConvocatoria });
          totalErrors++;
          metrics.increment('etl.items.errors');
          continue;
        }

        await db.sancion.upsert({
          where: {
            numeroConvocatoria_sancionado_fechaSancion: {
              numeroConvocatoria: item.numeroConvocatoria,
              sancionado: item.sancionado,
              fechaSancion: new Date(item.fechaSancion),
            },
          },
          update: {
            importeMulta: item.importeMulta,
            inicioInhabilitacion: item.inicioInhabilitacion ? new Date(item.inicioInhabilitacion) : null,
            finInhabilitacion: item.finInhabilitacion ? new Date(item.finInhabilitacion) : null,
          },
          create: {
            numeroConvocatoria: item.numeroConvocatoria,
            tituloConvocatoria: item.convocatoria,
            organoNivel1: item.nivel1,
            organoNivel2: item.nivel2,
            organoNivel3: item.nivel3,
            codigoINVENTE: item.codigoINVENTE,
            fechaConcesion: new Date(item.fechaConcesion),
            infraccion: item.infraccion,
            importe: item.importe,
            sancionado: item.sancionado,
            fechaSancion: new Date(item.fechaSancion),
            importeMulta: item.importeMulta,
            inicioInhabilitacion: item.inicioInhabilitacion ? new Date(item.inicioInhabilitacion) : null,
            finInhabilitacion: item.finInhabilitacion ? new Date(item.finInhabilitacion) : null,
          },
        });
        totalProcessed++;
        metrics.increment('etl.items.processed');
        const duration = Date.now() - startItem;
        metrics.histogram('etl.items.processed.duration_ms', duration);
        logger.info('Sanción procesada exitosamente', { ...itemMeta, durationMs: duration });
      } catch (e: any) {
        totalErrors++;
        metrics.increment('etl.items.errors');
        logger.error('Error procesando sanción', { ...itemMeta, error: e.message });
      }
    }

    currentPage++;
  }

  const totalDuration = Date.now() - startAll;
  logger.info('Sincronización de Sanciones finalizada', { jobName, runId, totalProcessed, totalErrors, totalPagesFailed, durationMs: totalDuration });
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

  const jobName = 'sync-sanciones';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Sanciones Invocado', { jobName, runId });

  try {
    const stats = await syncSanciones(jobName, runId);
    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Sanciones Completado', { jobName, runId, ...stats, durationMs });
    return NextResponse.json({ success: stats.errors === 0, stats });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    logger.error('Job Sanciones Falló Catastróficamente', { jobName, runId, error: error.message, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 