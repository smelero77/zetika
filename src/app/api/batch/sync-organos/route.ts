import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbETL as db } from '~/server/db';
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
 * Función recursiva para procesar un nodo y todos sus hijos
 * Ahora maneja la estructura jerárquica con nivel1, nivel2, nivel3
 */
async function processNode(
  node: { id: number; descripcion: string; children?: any[] }, 
  tipoAdmin: string, 
  parentId?: number,
  nivel1?: string,
  nivel2?: string
) {
  const itemMeta = { tipoAdmin, itemId: node.id, parentId, nivel1, nivel2 };
  const startItem = Date.now();
  
  try {
    // Determinar los niveles jerárquicos
    let currentNivel1 = nivel1;
    let currentNivel2 = nivel2;
    let currentNivel3: string | undefined;
    
    // Para el tipo Local (L), la estructura es: Provincia -> Municipio -> Ayuntamiento
    if (tipoAdmin === 'L') {
      if (!nivel1) {
        // Es una provincia (nivel1)
        currentNivel1 = node.descripcion;
      } else if (!nivel2) {
        // Es un municipio (nivel2)
        currentNivel2 = node.descripcion;
      } else {
        // Es un ayuntamiento (nivel3)
        currentNivel3 = node.descripcion;
      }
    } else {
      // Para otros tipos, el primer nivel es nivel1, el segundo nivel2
      if (!nivel1) {
        currentNivel1 = node.descripcion;
      } else if (!nivel2) {
        currentNivel2 = node.descripcion;
      } else {
        currentNivel3 = node.descripcion;
      }
    }

    // Buscar el órgano padre si existe
    let organoPadreId: number | undefined;
    if (parentId) {
      const organoPadre = await db.organo.findFirst({
        where: { idOficial: parentId }
      });
      organoPadreId = organoPadre?.id;
    }

    await upsertWithRetry(db.organo, {
      where: { idOficial: node.id },
      update: {
        descripcion: node.descripcion,
        nivel1: currentNivel1,
        nivel2: currentNivel2,
        nivel3: currentNivel3,
        tipoAdministracion: tipoAdmin,
        organoPadreId: organoPadreId,
      },
      create: {
        idOficial: node.id,
        descripcion: node.descripcion,
        nivel1: currentNivel1,
        nivel2: currentNivel2,
        nivel3: currentNivel3,
        tipoAdministracion: tipoAdmin,
        organoPadreId: organoPadreId,
      },
    });

    const duration = Date.now() - startItem;
    metrics.histogram('etl.items.processed.duration_ms', duration);
    
    // Procesar hijos recursivamente
    if (node.children) {
      for (const child of node.children) {
        await processNode(child, tipoAdmin, node.id, currentNivel1, currentNivel2);
      }
    }
  } catch (e: unknown) {
    metrics.increment('etl.items.errors');
    const errorMessage = e instanceof Error ? e.message : String(e);
    const error = e instanceof Error ? e : new Error(errorMessage);
    logger.error(`Error procesando órgano (tipo ${tipoAdmin})`, error, itemMeta);
    throw error;
  }
}

/**
 * Sincroniza el catálogo de Órganos, que es jerárquico y requiere una llamada por tipo de administración.
 * @param tipoAdminFilter - Si se especifica, solo procesa ese tipo de administración
 */
async function syncOrganos(jobName: string, runId: string, tipoAdminFilter?: string | null) {
  const catalogName = 'Organos';
  const endpoint = '/organos';
  const tiposAdmin: Array<'C' | 'A' | 'L' | 'O'> = tipoAdminFilter ? [tipoAdminFilter as 'C' | 'A' | 'L' | 'O'] : ['C', 'A', 'L', 'O'];
  const logMeta = { jobName, runId, catalogName, endpoint, tipoAdminFilter };
  logger.info(`Iniciando sincronización: ${catalogName}${tipoAdminFilter ? ` (solo tipo ${tipoAdminFilter})` : ''}`, logMeta);
  metrics.increment('etl.jobs.started');

  let processed = 0;
  let errors = 0;
  const startAll = Date.now();

  try {
    // Hacemos una llamada por cada tipo de órgano (Estatal, Autonómico, etc.)
    for (let i = 0; i < tiposAdmin.length; i++) {
      const tipoAdmin = tiposAdmin[i];
      const tipoName = tipoAdmin === 'C' ? 'Central' : tipoAdmin === 'A' ? 'Autonómica' : tipoAdmin === 'L' ? 'Local' : 'Otros';
      
      logger.info(`🔄 Procesando administración ${tipoName} (${i + 1}/${tiposAdmin.length})`, { ...logMeta, tipoAdmin, tipoName });
      
      const url = `${SNPSAP_API_BASE_URL}${endpoint}?vpd=${encodeURIComponent(PORTAL)}&idAdmon=${tipoAdmin}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        logger.error(`Error fetching datos para administración ${tipoName}`, new Error(`HTTP ${response.status}`), { ...logMeta, tipoAdmin, status: response.status });
        continue;
      }
      
      const items: Array<{ id: number; descripcion: string; children?: any[] }> =
        response.status === 204 ? [] : await response.json();
      
      logger.info(`📄 Obtenidos ${items.length} órganos raíz para administración ${tipoName}`, { ...logMeta, tipoAdmin, count: items.length });

      for (const root of items) {
        try {
          await processNode(root, tipoAdmin);
          processed++;
          metrics.increment('etl.items.processed');
          
          // Solo logueamos cada 50 registros para reducir el ruido en los logs
          if (processed % 50 === 0) {
            logger.info(`Órganos procesados: ${processed} (tipo ${tipoAdmin})`, { ...logMeta, processed });
          }
        } catch (e) {
          errors++;
          logger.error(`Error procesando órgano raíz ${root.id}`, e, { ...logMeta, tipoAdmin, organoId: root.id });
        }
      }
      
      logger.info(`✅ Completada administración ${tipoName}`, { ...logMeta, tipoAdmin, processed });
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

  // Obtener parámetros del body o query string
  const url = new URL(req.url);
  const tipoAdmin = url.searchParams.get('tipoAdmin');
  
  let bodyParams = {};
  try {
    const body = await req.text();
    if (body) {
      bodyParams = JSON.parse(body);
    }
  } catch (e) {
    // Body vacío o no JSON, usar valores por defecto
  }
  
  const tipoAdminFilter = tipoAdmin || (bodyParams as any).tipoAdmin || undefined;

  const jobName = 'sync-organos';
  const runId = crypto.randomUUID();
  metrics.increment('etl.jobs.invoked');
  const startTime = Date.now();
  logger.info('Job Órganos Invocado', { jobName, runId, tipoAdminFilter });

  try {
    const stats = await syncOrganos(jobName, runId, tipoAdminFilter ? tipoAdminFilter : undefined);

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