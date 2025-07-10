import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '~/server/db';
import { logger } from '~/server/lib/logger';
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
 * Sincroniza el catálogo jerárquico de Regiones.
 */
async function syncRegiones(jobName: string, runId: string) {
    const logMeta = { jobName, runId, catalogName: 'Regiones' };
    logger.info("Iniciando sincronización: Regiones", logMeta);
    metrics.increment('etl.jobs.started');

    let processed = 0;
    let errors = 0;
    const startAll = Date.now();

    type ApiRegionNode = { id: number; descripcion: string; children?: ApiRegionNode[]; };

    async function processNode(node: ApiRegionNode) {
        const itemMeta = { ...logMeta, regionId: node.id };
        const startItem = Date.now();
        try {
            await upsertWithRetry(db.region, {
                where: { idOficial: node.id },
                update: { nombre: node.descripcion },
                create: { idOficial: node.id, nombre: node.descripcion },
            });
            processed++;
            metrics.increment('etl.items.processed');
            const duration = Date.now() - startItem;
            metrics.histogram('etl.items.processed.duration_ms', duration);
            logger.info('Región procesada', { ...itemMeta, durationMs: duration });
            if (node.children) {
                for (const child of node.children) {
                    await processNode(child);
                }
            }
        } catch (e: unknown) {
            errors++;
            metrics.increment('etl.items.errors');
            const errorMessage = e instanceof Error ? e.message : String(e);
            const error = e instanceof Error ? e : new Error(errorMessage);
            logger.error('Error procesando región', error, itemMeta);
        }
    }

    try {
        const url = `${SNPSAP_API_BASE_URL}/regiones?vpd=${encodeURIComponent(PORTAL)}`;
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const regionTree: ApiRegionNode[] = response.status === 204 ? [] : await response.json();
        for (const rootNode of regionTree) {
            await processNode(rootNode);
        }
        const totalDuration = Date.now() - startAll;
        logger.info(`Sincronización de 'Regiones' finalizada`, { ...logMeta, processed, errors, durationMs: totalDuration });
        metrics.increment('etl.jobs.completed');
        metrics.increment('etl.items.processed', processed);
        metrics.increment('etl.items.errors', errors);
        metrics.histogram('etl.jobs.duration_ms', totalDuration);
    } catch (error: unknown) {
        errors++;
        metrics.increment('etl.jobs.fatal_errors');
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorObj = error instanceof Error ? error : new Error(errorMessage);
        logger.error(`Fallo crítico en la sincronización de 'Regiones'`, errorObj, logMeta);
    }
    return { processed, errors };
}

export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = 'sync-regiones';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Regiones Invocado', { jobName, runId });

  try {
    const stats = await syncRegiones(jobName, runId);

    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Regiones Completado', { jobName, runId, stats, durationMs });
    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Job Regiones Falló Catástroficamente', errorObj, { jobName, runId, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 