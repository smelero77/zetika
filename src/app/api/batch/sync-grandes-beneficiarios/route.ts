import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '~/server/db';
import { logger, batchLogger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

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
      if (error.message?.includes('prepared statement') && error.message?.includes('does not exist')) {
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

/**
 * Sincroniza los Grandes Beneficiarios.
 */
async function syncGrandesBeneficiarios(jobName: string, runId: string) {
    const catalogName = 'GrandesBeneficiarios';
    const logMeta = { jobName, runId, catalogName };
    const batchJobName = `${jobName}-${catalogName}`;
    
    batchLogger.start(batchJobName, logMeta);
    metrics.increment('etl.jobs.started');
  
    let totalProcessed = 0;
    let totalErrors = 0;
    const startAll = Date.now();
  
    try {
      const aniosResponse = await fetch(`${SNPSAP_API_BASE_URL}/grandesbeneficiarios/anios`, { headers: { 'Accept': 'application/json' } });
      if (!aniosResponse.ok) throw new Error('No se pudieron obtener los años de los grandes beneficiarios');
      const anios: { id: number }[] = await aniosResponse.json();
  
      for (const anio of anios) {
        logger.info(`Sincronizando grandes beneficiarios para el año ${anio.id}`, logMeta);
        let currentPage = 0;
        let isLastPage = false;
        
        while (!isLastPage) {
          const pageMeta = { ...logMeta, anio: anio.id, page: currentPage };
          logger.info(`Pidiendo página ${currentPage} para año ${anio.id}...`, pageMeta);
          metrics.increment('etl.pages.fetched');

          const url = new URL(`${SNPSAP_API_BASE_URL}/grandesbeneficiarios/busqueda`);
          url.searchParams.append('page', String(currentPage));
          url.searchParams.append('pageSize', '200');
          url.searchParams.append('anios', String(anio.id));
  
          let response;
          try {
            response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
            if (!response.ok) {
              totalErrors++;
              logger.warn('Fallo fetching página de grandes beneficiarios', { ...pageMeta, status: response.status });
              metrics.increment('etl.pages.failed');
              break;
            }
          } catch (error: unknown) {
            totalErrors++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorObj = error instanceof Error ? error : new Error(errorMessage);
            logger.error('Error de red al fetch grandes beneficiarios', errorObj, pageMeta);
            metrics.increment('etl.pages.failed');
            break;
          }

          const data = await response.json();
          const items = data.content || [];
          isLastPage = data.last ?? true;

          logger.info('Página de grandes beneficiarios recibida', { ...pageMeta, count: items.length });
          metrics.gauge('etl.pages.item_count', items.length);
  
          for (const item of items) {
            const itemMeta = { ...pageMeta, itemId: item.idPersona };
            const startItem = Date.now();
            try {
              const nifMatch = item.beneficiario.match(/^([A-Z0-9]+)\s/);
              const nifCif = nifMatch ? nifMatch[1] : null;
              const nombre = nifCif ? item.beneficiario.substring(nifCif.length).trim() : item.beneficiario;
  
              await upsertWithRetry(db.beneficiario, {
                where: { idOficial: item.idPersona },
                update: { nombre, nifCif },
                create: { idOficial: item.idPersona, nombre, nifCif },
              });
              
              await upsertWithRetry(db.granBeneficiario, {
                where: { beneficiarioId_ejercicio: { beneficiarioId: item.idPersona, ejercicio: item.ejercicio } },
                update: { ayudaTotal: item.ayudaETotal },
                create: {
                  ejercicio: item.ejercicio,
                  ayudaTotal: item.ayudaETotal,
                  beneficiarioId: item.idPersona,
                },
              });
              totalProcessed++;
              metrics.increment('etl.items.processed');
              const duration = Date.now() - startItem;
              metrics.histogram('etl.items.processed.duration_ms', duration);
              
              // Solo mostrar progreso cada 25 registros
              batchLogger.progress(batchJobName, `Procesando gran beneficiario`, { 
                ...itemMeta, 
                beneficiario: item.beneficiario,
                durationMs: duration 
              }, 25);
            } catch (e: unknown) {
              totalErrors++;
              metrics.increment('etl.items.errors');
              const errorMessage = e instanceof Error ? e.message : String(e);
              const error = e instanceof Error ? e : new Error(errorMessage);
              batchLogger.error(batchJobName, 'Error procesando gran beneficiario item', error, itemMeta);
            }
          }
  
          isLastPage = data.last ?? true;
          currentPage++;
        }
      }
      const totalDuration = Date.now() - startAll;
      batchLogger.complete(batchJobName, { ...logMeta, processed: totalProcessed, errors: totalErrors, durationMs: totalDuration });
      metrics.increment('etl.jobs.completed');
      metrics.increment('etl.items.processed', totalProcessed);
      metrics.increment('etl.items.errors', totalErrors);
      metrics.histogram('etl.jobs.duration_ms', totalDuration);
    } catch(error: unknown) {
      totalErrors++;
      metrics.increment('etl.jobs.fatal_errors');
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorObj = error instanceof Error ? error : new Error(errorMessage);
      batchLogger.error(batchJobName, `Fallo crítico en la sincronización de '${catalogName}'`, errorObj, logMeta);
    }
  
    return { processed: totalProcessed, errors: totalErrors };
}

export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = 'sync-grandes-beneficiarios';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Grandes Beneficiarios Invocado', { jobName, runId });

  try {
    const stats = await syncGrandesBeneficiarios(jobName, runId);

    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Grandes Beneficiarios Completado', { jobName, runId, stats, durationMs });
    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Job Grandes Beneficiarios Falló Catastroficamente', errorObj, { jobName, runId, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 