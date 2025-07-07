import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '~/server/db';
import { logger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';
const PAGE_SIZE = 200;

async function syncMinimis(jobName: string, runId: string, mode: 'initial' | 'daily' = 'initial') {
  const logMeta = { jobName, runId, catalogName: 'Minimis', mode };
  logger.info(`Iniciando sincronización de Minimis en modo: ${mode}`, logMeta);
  metrics.increment('etl.jobs.started');

  let totalProcessed = 0;
  let totalErrors = 0;
  let currentPage = 0;
  let isLastPage = false;
  let totalPagesFailed = 0;

  const startAll = Date.now();

  const url = new URL(`${SNPSAP_API_BASE_URL}/minimis/busqueda`);
  url.searchParams.append('vpd', PORTAL);
  url.searchParams.append('pageSize', String(PAGE_SIZE));
  url.searchParams.append('order', 'fechaRegistro');
  url.searchParams.append('direccion', 'asc');

  // Si el modo es 'daily', añadimos el filtro de fecha
  if (mode === 'daily') {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Formato DD/MM/YYYY que espera la API
    const formattedDate = yesterday.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    url.searchParams.append('fechaDesde', formattedDate);
    url.searchParams.append('fechaHasta', formattedDate);
    logger.info(`Ejecutando en modo diario para la fecha: ${formattedDate}`, logMeta);
  }

  while (!isLastPage) {
    const pageMeta = { ...logMeta, page: currentPage };
    logger.info(`Pidiendo página ${currentPage}...`, pageMeta);
    metrics.increment('etl.pages.fetched');

    url.searchParams.set('page', String(currentPage));
    
    let response;
    try {
      response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        totalErrors++;
        totalPagesFailed++;
        logger.warn('Fallo fetching página de minimis', { ...pageMeta, status: response.status });
        metrics.increment('etl.pages.failed');
        break;
      }
    } catch (error: unknown) {
      totalErrors++;
      totalPagesFailed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error de red al fetch minimis', { ...pageMeta, errorMessage });
      metrics.increment('etl.pages.failed');
      break;
    }

    const data = await response.json();
    const items = data.content || [];
    isLastPage = data.last ?? true;

    logger.info('Página de minimis recibida', { ...pageMeta, count: items.length });
    metrics.gauge('etl.pages.item_count', items.length);

    for (const item of items) {
      const itemMeta = { ...pageMeta, idConcesion: item.idConcesion };
      const startItem = Date.now();
      try {
        // Aseguramos que el beneficiario y la convocatoria existan antes de crear el registro de minimis
        // NOTA: Esto asume que las convocatorias y beneficiarios ya están sincronizados.
        const beneficiarioExists = await db.beneficiario.findUnique({ where: { idOficial: item.idPersona } });
        const convocatoriaExists = await db.convocatoria.findUnique({ where: { idOficial: item.idConvocatoria } });

        if (!beneficiarioExists || !convocatoriaExists) {
            logger.warn('Saltando minimis: falta convocatoria o beneficiario', { ...itemMeta, idConvocatoria: item.idConvocatoria, idPersona: item.idPersona });
            totalErrors++;
            metrics.increment('etl.items.errors');
            continue;
        }

        await db.minimis.upsert({
          where: { idConcesion: item.idConcesion },
          update: {
            fechaConcesion: new Date(item.fechaConcesion),
            fechaRegistro: new Date(item.fechaRegistro),
            ayudaEquivalente: item.ayudaEquivalente,
            // ... otros campos que podrían actualizarse
          },
          create: {
            idConcesion: item.idConcesion,
            codigoConcesion: item.codigoConcesion,
            fechaConcesion: new Date(item.fechaConcesion),
            fechaRegistro: new Date(item.fechaRegistro),
            ayudaEquivalente: item.ayudaEquivalente,
            convocante: item.convocante,
            reglamento: item.reglamento,
            instrumento: item.instrumento,
            sectorActividad: item.sectorActividad,
            sectorProducto: item.sectorProducto,
            convocatoriaId: item.idConvocatoria,
            beneficiarioId: item.idPersona,
          },
        });
        totalProcessed++;
        metrics.increment('etl.items.processed');
        const duration = Date.now() - startItem;
        metrics.histogram('etl.items.processed.duration_ms', duration);
        logger.info('Minimis procesado exitosamente', { ...itemMeta, durationMs: duration });
      } catch (e: unknown) {
        totalErrors++;
        metrics.increment('etl.items.errors');
        const errorMessage = e instanceof Error ? e.message : String(e);
        logger.error('Error procesando minimis', { ...itemMeta, errorMessage });
      }
    }

    currentPage++;
  }

  const totalDuration = Date.now() - startAll;
  logger.info('Sincronización de Minimis finalizada', { jobName, runId, totalProcessed, totalErrors, totalPagesFailed, durationMs: totalDuration });
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

  // Leemos el modo del cuerpo de la petición. Por defecto, 'initial'.
  let body: { mode?: 'initial' | 'daily' } = {};
  try {
      body = await req.json();
  } catch (e) {
      // Ignoramos el error si no hay cuerpo, se usará el modo por defecto.
  }
  const mode = body.mode || 'initial';

  const jobName = `sync-minimis-${mode}`;
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Minimis Invocado', { jobName, runId });

  try {
    const stats = await syncMinimis(jobName, runId, mode);
    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Minimis Completado', { jobName, runId, ...stats, durationMs });
    return NextResponse.json({ success: stats.errors === 0, stats });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Job Minimis Falló Catastróficamente', { jobName, runId, errorMessage, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 