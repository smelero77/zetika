import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbETL as db } from '~/server/db';
import { logger, batchLogger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';

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

/**
 * Sincroniza un catálogo simple (id + descripcion).
 */
async function syncSimpleCatalog(jobName: string, runId: string, catalogName: string, endpoint: string, model: { upsert: (params: { where: { idOficial: number }; update: { descripcion: string }; create: { idOficial: number; descripcion: string } }) => Promise<unknown> }) {
  const logMeta = { jobName, runId, catalogName, endpoint };
  const batchJobName = `${jobName}-${catalogName}`;
  
  batchLogger.start(batchJobName, logMeta);
  metrics.increment('etl.jobs.started');

  let processed = 0;
  let errors = 0;
  const startAll = Date.now();

  try {
    const url = `${SNPSAP_API_BASE_URL}${endpoint}?vpd=${encodeURIComponent(PORTAL)}`;
    logger.info(`Haciendo petición a: ${url}`, logMeta);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    logger.info(`Respuesta de API para ${catalogName}:`, { 
      ...logMeta, 
      status: response.status, 
      statusText: response.statusText,
      url: url 
    });

    if (!response.ok) {
      const errorText = await response.text();
      batchLogger.error(batchJobName, `Error en respuesta de API para ${catalogName}`, new Error(`API responded with status ${response.status}: ${errorText}`), { 
        ...logMeta, 
        status: response.status, 
        statusText: response.statusText,
        errorText: errorText,
        url: url 
      });
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const items: { id: number; descripcion: string }[] =
      response.status === 204 ? [] : await response.json();

    logger.info(`Datos recibidos para ${catalogName}:`, { 
      ...logMeta, 
      itemCount: items.length,
      sampleItems: items.slice(0, 3) // Primeros 3 items como muestra
    });

    for (const item of items) {
      const itemMeta = { ...logMeta, itemId: item.id };
      const startItem = Date.now();
      try {
        await upsertWithRetry(model, {
          where: { idOficial: item.id },
          update: { descripcion: item.descripcion },
          create: { idOficial: item.id, descripcion: item.descripcion },
        });
        processed++;
        metrics.increment('etl.items.processed');
        const duration = Date.now() - startItem;
        metrics.histogram('etl.items.processed.duration_ms', duration);
        
        // Solo mostrar progreso cada 50 registros
        batchLogger.progress(batchJobName, `Procesando ${catalogName}`, { 
          ...itemMeta, 
          itemData: { id: item.id, descripcion: item.descripcion },
          durationMs: duration 
        }, 50);
      } catch (e: unknown) {
        errors++;
        metrics.increment('etl.items.errors');
        const errorMessage = e instanceof Error ? e.message : String(e);
        const error = e instanceof Error ? e : new Error(errorMessage);
        batchLogger.error(batchJobName, `Error procesando item en '${catalogName}'`, error, { 
          ...itemMeta, 
          itemData: { id: item.id, descripcion: item.descripcion },
          errorDetails: errorMessage 
        });
      }
    }
    const totalDuration = Date.now() - startAll;
    batchLogger.complete(batchJobName, { ...logMeta, processed, errors, durationMs: totalDuration });
    metrics.increment('etl.jobs.completed');
    metrics.increment('etl.items.processed', processed);
    metrics.increment('etl.items.errors', errors);
    metrics.histogram('etl.jobs.duration_ms', totalDuration);
  } catch (error: unknown) {
    errors++;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    batchLogger.error(batchJobName, `Fallo crítico en la sincronización de '${catalogName}'`, errorObj, { 
      ...logMeta, 
      errorDetails: errorMessage,
      url: `${SNPSAP_API_BASE_URL}${endpoint}?vpd=${encodeURIComponent(PORTAL)}`
    });
  }
  return { processed, errors };
}

export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = 'sync-catalogos-basicos';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Catálogos Básicos Invocado', { jobName, runId });

  const finalStats = { totalProcessed: 0, totalErrors: 0 };

  try {
    const syncTasks = [
      syncSimpleCatalog(jobName, runId, 'Finalidades', '/finalidades', db.finalidad),
      syncSimpleCatalog(jobName, runId, 'Instrumentos de Ayuda', '/instrumentos', db.instrumentoAyuda),
      syncSimpleCatalog(jobName, runId, 'Tipos de Beneficiario', '/beneficiarios', db.tipoBeneficiario),
      syncSimpleCatalog(jobName, runId, 'Actividades (Sectores)', '/actividades', db.actividad),
      syncSimpleCatalog(jobName, runId, 'Reglamentos UE', '/reglamentos', db.reglamentoUE),
      syncSimpleCatalog(jobName, runId, 'Sectores de Productos', '/sectores', db.sectorProducto),
      syncSimpleCatalog(jobName, runId, 'Catalogo de Objetivos', '/objetivos', db.catalogoObjetivo),
    ];

    const results = await Promise.all(syncTasks);

    for (const stats of results) {
        finalStats.totalProcessed += stats.processed;
        finalStats.totalErrors += stats.errors;
    }

    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Catálogos Básicos Completado', { jobName, runId, stats: finalStats, durationMs });
    return NextResponse.json({ success: true, stats: finalStats });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Job Catálogos Básicos Falló Catástroficamente', errorObj, { jobName, runId, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 