import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '~/server/db';
import { logger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';
const PAGE_SIZE = 200;  // igual que antes

/**
 * Sincroniza Ayudas de Estado desde la API del SNPSAP
 */
async function syncAyudasDeEstado(jobName: string, runId: string) {
  const logMeta = { jobName, runId, catalogName: 'AyudasDeEstado' };
  logger.info('Iniciando sincronización de Ayudas de Estado', logMeta);
  metrics.increment('etl.jobs.started', { job: jobName, runId });

  let totalProcessed = 0;
  let totalErrors = 0;
  let currentPage = 0;
  let isLastPage = false;
  let totalPagesFailed = 0;

  const startAll = Date.now();

  while (!isLastPage) {
    const pageMeta = { ...logMeta, page: currentPage };
    logger.info(`Pidiendo página ${currentPage}...`, pageMeta);
    metrics.increment('etl.pages.fetched', { job: jobName, runId, page: currentPage });

    // Ruta original funcional: /ayudasestado/busqueda
    const url = new URL(`${SNPSAP_API_BASE_URL}/ayudasestado/busqueda`);
    url.searchParams.append('vpd', PORTAL);
    url.searchParams.append('pageSize', String(PAGE_SIZE));
    url.searchParams.append('page', String(currentPage));
    url.searchParams.append('order', 'fechaConcesion');
    url.searchParams.append('direccion', 'desc');

    let response;
    try {
      response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        totalErrors++;
        totalPagesFailed++;
        logger.warn('Fallo fetching página', { ...pageMeta, status: response.status });
        metrics.increment('etl.pages.failed', { job: jobName, runId, page: currentPage, status: response.status });
        break;
      }
    } catch (error: any) {
      totalErrors++;
      totalPagesFailed++;
      logger.error('Error de red al fetch Ayudas de Estado', { ...pageMeta, err: error });
      metrics.increment('etl.pages.failed', { job: jobName, runId, page: currentPage, status: 'network' });
      break;
    }

    const data = await response.json();
    const items = data.content || [];
    isLastPage = data.last ?? true;

    logger.info('Página recibida', { ...pageMeta, count: items.length });
    metrics.gauge('etl.pages.item_count', items.length, { job: jobName, runId, page: currentPage });

    for (const item of items) {
      const itemMeta = { ...pageMeta, idAyuda: item.id };
      const startItem = Date.now();
      try {
        // Verificamos que existan en BD local
        const [convExists, benExists] = await Promise.all([
          db.convocatoria.findUnique({ where: { idOficial: item.idConvocatoria } }),
          db.beneficiario.findUnique({ where: { idOficial: item.idPersona } }),
        ]);
        if (!convExists || !benExists) {
          logger.warn('Saltando Ayuda de Estado: falta convocatoria o beneficiario', { ...itemMeta });
          totalErrors++;
          metrics.increment('etl.items.errors', { job: jobName, runId, type: 'ayudas-estado', reason: 'missing_fk' });
          continue;
        }

        await db.ayudaDeEstado.upsert({
          where: { idOficial: item.id },
          update: {
            importe: item.importe,
            ayudaEquivalente: item.ayudaE,
            fechaConcesion: new Date(item.fechaConcesion),
          },
          create: {
            idOficial: item.id,
            tituloConvocatoria: item.convocatoria,
            beneficiarioNombre: item.beneficiario,
            importe: item.importe,
            ayudaEquivalente: item.ayudaE,
            fechaConcesion: new Date(item.fechaConcesion),
            convocatoriaId: item.idConvocatoria,
            beneficiarioId: item.idPersona,
            instrumentoId: item.idInstrumento,
          },
        });
        totalProcessed++;
        metrics.increment('etl.items.processed', { job: jobName, runId, type: 'ayudas-estado' });
        const duration = Date.now() - startItem;
        metrics.histogram('etl.items.processed.duration_ms', duration, { job: jobName, runId, type: 'ayudas-estado' });
        logger.info('Ayuda procesada exitosamente', { ...itemMeta, durationMs: duration });
      } catch (error: any) {
        totalErrors++;
        metrics.increment('etl.items.errors', { job: jobName, runId, type: 'ayudas-estado' });
        logger.error('Error procesando Ayuda de Estado', { ...itemMeta, err: error });
      }
    }

    currentPage++;
  }

  const totalDuration = Date.now() - startAll;
  logger.info('Sincronización de Ayudas de Estado finalizada', { jobName, runId, totalProcessed, totalErrors, totalPagesFailed, durationMs: totalDuration });
  metrics.increment('etl.jobs.completed', { job: jobName, runId });
  metrics.increment('etl.pages.failed', totalPagesFailed, { job: jobName, runId });
  metrics.increment('etl.items.processed', totalProcessed, { job: jobName, runId, type: 'ayudas-estado' });
  metrics.increment('etl.items.errors', totalErrors, { job: jobName, runId, type: 'ayudas-estado' });
  metrics.histogram('etl.jobs.duration_ms', totalDuration, { job: jobName, runId });

  return { processed: totalProcessed, errors: totalErrors };
}

export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = 'sync-ayudas-estado';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked', { job: jobName, runId });
  const startTime = Date.now();
  logger.info('Job AyudasDeEstado Invocado', { jobName, runId });

  try {
    const stats = await syncAyudasDeEstado(jobName, runId);
    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs, { job: jobName, runId });
    logger.info('Job AyudasDeEstado Completado', { jobName, runId, ...stats, durationMs });
    return NextResponse.json({ success: stats.errors === 0, stats });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors', { job: jobName, runId });
    logger.error('Job AyudasDeEstado Falló Catastróficamente', { jobName, runId, err: error, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 