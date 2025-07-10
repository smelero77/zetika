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
 * Sincroniza el catálogo de Órganos, que es jerárquico y requiere una llamada por tipo de administración.
 */
async function syncOrganos(jobName: string, runId: string) {
  const catalogName = 'Organos';
  const endpoint = '/organos';
  const tiposAdmin: Array<'C' | 'A' | 'L' | 'O'> = ['C', 'A', 'L', 'O'];
  const logMeta = { jobName, runId, catalogName, endpoint };
  logger.info(`Iniciando sincronización: ${catalogName}`, logMeta);
  metrics.increment('etl.jobs.started');

  let processed = 0;
  let errors = 0;
  const startAll = Date.now();

  // Función recursiva para procesar un nodo y todos sus hijos
  async function processNode(node: { id: number; descripcion: string; children?: any[] }, tipoAdmin: string) {
    const idStr = String(node.id);
    const itemMeta = { ...logMeta, tipoAdmin, itemId: idStr };
    const startItem = Date.now();
    try {
      await upsertWithRetry(db.organo, {
        where: { idOficial: idStr },
        update: {
          nombre: node.descripcion,
          tipoAdministracion: tipoAdmin,
        },
        create: {
          idOficial: idStr,
          nombre: node.descripcion,
          tipoAdministracion: tipoAdmin,
        },
      });
      processed++;
      metrics.increment('etl.items.processed');
      const duration = Date.now() - startItem;
      metrics.histogram('etl.items.processed.duration_ms', duration);
      logger.info(`Órgano procesado (tipo ${tipoAdmin})`, { ...itemMeta, durationMs: duration });
      if (node.children) {
        for (const child of node.children) {
          await processNode(child, tipoAdmin);
        }
      }
    } catch (e: unknown) {
      errors++;
      metrics.increment('etl.items.errors');
      const errorMessage = e instanceof Error ? e.message : String(e);
      const error = e instanceof Error ? e : new Error(errorMessage);
      logger.error(`Error procesando órgano (tipo ${tipoAdmin})`, error, itemMeta);
    }
  }

  try {
    // Hacemos una llamada por cada tipo de órgano (Estatal, Autonómico, etc.)
    for (const tipoAdmin of tiposAdmin) {
      const url = `${SNPSAP_API_BASE_URL}${endpoint}?vpd=${encodeURIComponent(PORTAL)}&idAdmon=${tipoAdmin}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const items: Array<{ id: number; descripcion: string; children?: any[] }> =
        response.status === 204 ? [] : await response.json();

      for (const root of items) {
        await processNode(root, tipoAdmin);
      }
    }

    const totalDuration = Date.now() - startAll;
    logger.info(`Sincronización de '${catalogName}' finalizada`, { ...logMeta, processed, errors, durationMs: totalDuration });
    metrics.increment('etl.jobs.completed');
    metrics.increment('etl.items.processed', processed);
    metrics.increment('etl.items.errors', errors);
    metrics.histogram('etl.jobs.duration_ms', totalDuration);
  } catch (error: unknown) {
    errors++;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error(`Fallo crítico en la sincronización de '${catalogName}'`, errorObj, logMeta);
  }

  return { processed, errors };
}

export async function POST(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobName = 'sync-organos';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Órganos Invocado', { jobName, runId });

  try {
    const stats = await syncOrganos(jobName, runId);

    const durationMs = Date.now() - startTime;
    metrics.histogram('etl.jobs.total_duration_ms', durationMs);
    logger.info('Job Órganos Completado', { jobName, runId, stats, durationMs });
    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    metrics.increment('etl.jobs.fatal_errors');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Job Órganos Falló Catástroficamente', errorObj, { jobName, runId, durationMs });
    return NextResponse.json({ success: false, error: 'Job failed' }, { status: 500 });
  }
} 