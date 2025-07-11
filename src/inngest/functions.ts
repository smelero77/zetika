import { inngest } from "./client";
import { dbETL } from "~/server/db";
import { loadCatalogCache, loadExistingConvocatoriasCache, updateConvocatoriaCache } from "~/server/services/cache";
import {
  getConvocatoriaDetalle,
  processAndSaveDetalle,
  getConvocatoriaStatus,
  getConvocatoriasPage,
} from "~/server/services/convocatorias";
import { fetchAndStoreDocument, getDocumentStats } from "~/server/services/storage";

// Interfaz mínima para verificación de convocatorias en listas paginadas
interface ConvocatoriaListItem {
  id: number;
  codigoBDNS: string;
  descripcion: string;
  fechaPublicacion?: string;
}

const PAGE_SIZE = 200;

function chunk<T>(array: T[], size: number): T[][] {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return [];
  }
  if (size <= 0) {
    return [array];
  }
  const head = array.slice(0, size);
  const tail = array.slice(size);
  return [head, ...chunk(tail, size)];
}

export const createConvocatoriaJobs = inngest.createFunction(
  {
    id: "create-convocatoria-jobs",
    name: "Crear Lotes de Jobs de Convocatorias",
  },
  { event: "app/convocatorias.sync.requested" },
  async ({ step, logger, event }) => {
    logger.info("🚀 Iniciando sincronización de convocatorias...");

    await step.run("load-caches", async () => {
      await loadCatalogCache();
      await loadExistingConvocatoriasCache();
    });

    const allItemsToProcess: { bdns: string; titulo: string }[] = [];
    let currentPage = 0;
    let isLastPage = false;

    while (!isLastPage) {
      const data = await step.run(`fetch-page-${currentPage}`, async () => {
        // Usar modo 'initial' para carga completa o 'incremental' para actualizaciones
        const modo = event.data?.modo || 'initial';
        return await getConvocatoriasPage(currentPage, PAGE_SIZE, 'inngest-create-jobs', event.id || 'unknown', modo);
      });

      // Validación defensiva: asegurar que data existe y tiene la estructura esperada
      if (!data || typeof data !== 'object') {
        logger.warn(`Datos inválidos recibidos para página ${currentPage}`, { data });
        isLastPage = true;
        break;
      }

      const items = Array.isArray(data.content) ? data.content : [];
      for (const _item of items) {
        const item = _item as { numeroConvocatoria?: string; id?: string; descripcion?: string };
        if (!item || !item.numeroConvocatoria || !item.id) continue;
        
        // Crear un objeto mínimo compatible con getConvocatoriaStatus
        const mockDetalle = {
          id: parseInt(item.id),
          codigoBDNS: item.numeroConvocatoria,
          descripcion: item.descripcion || '',
          // Campos mínimos requeridos
          fechaPublicacion: new Date().toISOString(),
        } as ConvocatoriaListItem;
        
        const { hasChanged } = getConvocatoriaStatus(mockDetalle);
        if (hasChanged) {
          allItemsToProcess.push({
            bdns: item.numeroConvocatoria!,
            titulo: item.descripcion || '',
          });
        }
      }
      isLastPage = data.last ?? true;
      currentPage++;
      
      // Protección contra bucles infinitos
      if (currentPage > 1000) {
        logger.warn("Deteniendo bucle de páginas por seguridad", { currentPage });
        break;
      }
    }

    if (allItemsToProcess.length === 0) {
      logger.info("✅ No se encontraron convocatorias nuevas para procesar.");
      return { message: "No new items to process." };
    }

    const BATCH_SIZE = 20;
    const batches = chunk(allItemsToProcess, BATCH_SIZE);
    const batchEvents = batches.map((batch, batchIndex) => {
        const convocatoriasWithMetadata = batch.map((convo, itemIndex) => ({
            ...convo,
            run_index: (batchIndex * BATCH_SIZE) + itemIndex + 1,
        }));
        return {
            name: "app/convocatoria.process.batch",
            data: {
                batch_index: batchIndex + 1,
                total_batches: batches.length,
                total_convocatorias: allItemsToProcess.length,
                convocatorias: convocatoriasWithMetadata,
            },
        };
    });

    logger.info(`📊 Sincronización configurada: ${batchEvents.length} lotes, ${allItemsToProcess.length} convocatorias`);
    if (batchEvents.length > 0) {
        await step.sendEvent("fan-out-convocatoria-batches", batchEvents);
    }
    return { totalConvocatorias: allItemsToProcess.length, totalLotes: batchEvents.length };
  }
);

export const processConvocatoriaBatch = inngest.createFunction(
  {
    id: "process-convocatoria-batch",
    name: "Procesar Lote de Convocatorias",
    concurrency: {
      limit: 1, // Reducir a 1 para evitar conflictos de prepared statements
    },
    retries: 3,
  },
  { event: "app/convocatoria.process.batch" },
  async ({ event, step, logger }) => {
    // Pequeña pausa para evitar conflictos de prepared statements
    await step.run("connection-stabilization", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.info("Pausa de estabilización completada");
    });

    // Validación defensiva de los datos del evento
    // Si por alguna razón el evento llega sin datos de convocatorias, registramos el incidente y finalizamos sin lanzar excepción.
    if (!event.data || !event.data.convocatorias) {
      logger.warn("Evento recibido sin datos de convocatorias; se omite el procesamiento", {
        eventId: event.id,
        eventData: event.data,
      });
      return {
        processedCount: 0,
        documentsEnqueued: 0,
        documentsFound: 0,
        globalStats: null,
        skipped: true,
        reason: "Evento sin datos de convocatorias",
      };
    }

    const { convocatorias, batch_index, total_batches } = event.data;
    
    // Asegurar que convocatorias es un array
    if (!Array.isArray(convocatorias)) {
      logger.error("convocatorias no es un array", { convocatorias, type: typeof convocatorias });
      throw new Error("convocatorias debe ser un array");
    }

    logger.info(`📦 Procesando lote ${batch_index}/${total_batches} (${convocatorias.length} convocatorias)`);
    
    const allDocEvents: Array<{
      name: string;
      data: {
        bdns: string;
        docId: number;
      };
    }> = [];
    
    let totalDocumentosEncontrados = 0;
    
    for (const convo of convocatorias) {
      // Validación de cada convocatoria
      if (!convo || !convo.bdns) {
        logger.warn("Convocatoria inválida encontrada", { convo });
        continue;
      }

      const result = await step.run(`process-item-${convo.bdns}`, async () => {
        if (!convo.bdns) {
          throw new Error(`BDNS no válido para convocatoria: ${convo.titulo}`);
        }
        const detalle = await getConvocatoriaDetalle(convo.bdns, 'inngest-batch', event.id || 'unknown');
        if (!detalle) {
          return { documentos: [], bdns: convo.bdns };
        }
        const { hash, documentos } = await processAndSaveDetalle(detalle, 'inngest-batch', event.id || 'unknown');
        updateConvocatoriaCache(detalle, hash);
        
        // Asegurar que documentos es un array
        const docArray = Array.isArray(documentos) ? documentos : [];
        
        // Log información de documentos encontrados
        if (docArray.length > 0) {
          logger.info(`📄 Convocatoria ${convo.bdns} tiene ${docArray.length} documentos para descargar`);
        }
        
        return { documentos: docArray, bdns: (detalle as { codigoBDNS?: string }).codigoBDNS || convo.bdns };
      });
      
      if (result && Array.isArray(result.documentos) && result.documentos.length > 0) {
        totalDocumentosEncontrados += result.documentos.length;
        const docEvents = result.documentos.map((doc: { id: number }) => ({
          name: "app/document.process.storage",
          data: {
            bdns: result.bdns,
            docId: doc.id,
          },
        }));
        allDocEvents.push(...docEvents);
      }
    }
    
    // Enviar eventos de documentos si los hay
    if (allDocEvents.length > 0) {
      await step.sendEvent("fan-out-all-documents-for-batch", allDocEvents);
      logger.info(`📋 ${allDocEvents.length} documentos encolados para descarga asíncrona`, {
        batch_index,
        total_batches,
        documentosEncontrados: totalDocumentosEncontrados,
        documentosEncolados: allDocEvents.length
      });
    } else {
      logger.info(`📋 No se encontraron documentos para descargar en este lote`, {
        batch_index,
        total_batches
      });
    }
    
    // Obtener estadísticas generales de documentos al final
    const stats = await step.run("get-document-stats", async () => {
      return await getDocumentStats();
    });
    
    logger.info(`✅ Lote ${batch_index}/${total_batches} completado`, {
      convocatoriasProcesadas: convocatorias.length,
      documentosEncontrados: totalDocumentosEncontrados,
      documentosEncolados: allDocEvents.length,
      estadisticasGlobales: {
        totalDocumentos: stats.total,
        documentosAlmacenados: stats.conStorage,
        documentosPendientes: stats.sinStorage,
        porcentajeCompletado: `${stats.porcentajeCompletado}%`
      }
    });
    
    // Pausa final para estabilizar conexiones
    await step.run("final-stabilization", async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      logger.info("Estabilización final completada");
    });
    
    return { 
      processedCount: convocatorias.length, 
      documentsEnqueued: allDocEvents.length,
      documentsFound: totalDocumentosEncontrados,
      globalStats: stats
    };
  }
);

export const processDocumentStorage = inngest.createFunction(
  { 
    id: "process-document-storage", 
    name: "Almacenar Documento PDF", 
    retries: 4, 
    concurrency: { limit: 5 } 
  },
  { event: "app/document.process.storage" },
  async ({ event, step, logger }) => {
    const { bdns, docId } = event.data;
    if (!bdns || !docId) {
        throw new Error("BDNS o docId no proporcionados en el evento");
    }
    
    const bdnsString = String(bdns);
    logger.info(`📥 Iniciando procesamiento de documento ${docId} para convocatoria ${bdnsString}`);
    
    // Verificar si ya existe en storage
    const existingDoc = await step.run("check-existing-storage", async () => {
      return await dbETL.documento.findUnique({
        where: { idOficial: Number(docId) },
        select: { storagePath: true, storageUrl: true, nombreFic: true }
      });
    });
    
    if (existingDoc?.storagePath && existingDoc?.storageUrl) {
      logger.info(`📄 Documento ${docId} ya existe en storage, saltando descarga`, {
        bdns: bdnsString,
        docId,
        nombreArchivo: existingDoc.nombreFic,
        storagePath: existingDoc.storagePath
      });
      return { docId, storagePath: existingDoc.storagePath, skipped: true };
    }
    
    const { storagePath, publicUrl } = await step.run("fetch-and-store", () => 
        fetchAndStoreDocument(bdnsString, Number(docId))
    );
    
    await step.run("update-db-record", () => 
        dbETL.documento.updateMany({
            where: { idOficial: Number(docId) },
            data: { storagePath, storageUrl: publicUrl },
        })
    );
    
    logger.info(`✅ Documento ${docId} procesado y almacenado exitosamente`, {
      bdns: bdnsString,
      docId,
      storagePath,
      publicUrl
    });
    
    return { docId, storagePath, skipped: false };
  }
);

/**
 * FUNCIÓN 4: Sincronización de Catálogos Básicos
 * Sincroniza los catálogos básicos usando los endpoints batch existentes
 */
export const syncCatalogosBasicos = inngest.createFunction(
  {
    id: "sync-catalogos-basicos",
    name: "Sincronizar Catálogos Básicos",
    retries: 3,
  },
  { event: "app/catalogos.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de catálogos básicos...");

    try {
      // Llamar al endpoint de catálogos básicos
      const response = await step.run("call-catalogos-basicos-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-catalogos-basicos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de catálogos básicos completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de catálogos básicos", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 5: Sincronización de Regiones
 * Sincroniza las regiones usando el endpoint batch existente
 */
export const syncRegiones = inngest.createFunction(
  {
    id: "sync-regiones",
    name: "Sincronizar Regiones",
    retries: 3,
  },
  { event: "app/regiones.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de regiones...");

    try {
      // Llamar al endpoint de regiones
      const response = await step.run("call-regiones-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-regiones`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de regiones completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de regiones", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 6: Sincronización de Grandes Beneficiarios
 * Sincroniza los grandes beneficiarios usando el endpoint batch existente
 */
export const syncGrandesBeneficiarios = inngest.createFunction(
  {
    id: "sync-grandes-beneficiarios",
    name: "Sincronizar Grandes Beneficiarios",
    retries: 3,
  },
  { event: "app/grandes-beneficiarios.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de grandes beneficiarios...");

    try {
      const response = await step.run("call-grandes-beneficiarios-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-grandes-beneficiarios`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de grandes beneficiarios completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de grandes beneficiarios", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 7: Sincronización de Ayudas de Estado
 * Sincroniza las ayudas de estado usando el endpoint batch existente
 */
export const syncAyudasDeEstado = inngest.createFunction(
  {
    id: "sync-ayudas-estado",
    name: "Sincronizar Ayudas de Estado",
    retries: 3,
    // Timeout extendido debido al procesamiento paginado
    timeouts: {
      start: "10m",
    },
  },
  { event: "app/ayudas-estado.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de ayudas de estado...");

    try {
      const response = await step.run("call-ayudas-estado-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-ayudas-estado`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de ayudas de estado completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de ayudas de estado", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 8: Sincronización de Partidos Políticos
 * Sincroniza los partidos políticos usando el endpoint batch existente
 */
export const syncPartidosPoliticos = inngest.createFunction(
  {
    id: "sync-partidos-politicos",
    name: "Sincronizar Partidos Políticos",
    retries: 3,
    // Timeout extendido debido al procesamiento paginado
    timeouts: {
      start: "10m",
    },
  },
  { event: "app/partidos-politicos.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de partidos políticos...");

    try {
      const response = await step.run("call-partidos-politicos-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-partidos-politicos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de partidos políticos completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de partidos políticos", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 9: Sincronización de Concesiones
 * Sincroniza las concesiones usando el endpoint batch existente
 */
export const syncConcesiones = inngest.createFunction(
  {
    id: "sync-concesiones",
    name: "Sincronizar Concesiones",
    retries: 3,
    // Timeout extendido debido al procesamiento paginado y verificaciones de dependencias
    timeouts: {
      start: "15m",
    },
  },
  { event: "app/concesiones.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de concesiones...");

    try {
      const response = await step.run("call-concesiones-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-concesiones`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de concesiones completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de concesiones", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 10: Sincronización de Sanciones
 * Sincroniza las sanciones usando el endpoint batch existente
 */
export const syncSanciones = inngest.createFunction(
  {
    id: "sync-sanciones",
    name: "Sincronizar Sanciones",
    retries: 3,
    // Timeout extendido debido al procesamiento paginado
    timeouts: {
      start: "10m",
    },
  },
  { event: "app/sanciones.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de sanciones...");

    try {
      const response = await step.run("call-sanciones-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-sanciones`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de sanciones completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de sanciones", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 11: Sincronización de Órganos
 * Sincroniza los órganos dividiendo el trabajo en steps por tipo de administración
 * OPTIMIZADO: Para plan gratuito de Vercel (60 segundos máximo por step)
 */
export const syncOrganos = inngest.createFunction(
  {
    id: "sync-organos",
    name: "Sincronizar Órganos",
    retries: 3,
    // Sin timeout extendido - cada step debe completarse en < 60 segundos
  },
  { event: "app/organos.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de órganos (dividida en steps)...");

    const tiposAdmin = [
      { codigo: 'C', nombre: 'Central' },
      { codigo: 'A', nombre: 'Autonómica' },
      { codigo: 'L', nombre: 'Local' },
      { codigo: 'O', nombre: 'Otros' }
    ];

    const resultados = [];

    try {
      // Step 1: Procesar Administración Central
      const resultadoCentral = await step.run("sync-organos-central", async () => {
        logger.info("🏛️ Procesando Administración Central...");
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-organos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tipoAdmin: 'C' }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        logger.info("✅ Administración Central completada", { processed: resultado.stats?.processed });
        return resultado;
      });
      resultados.push({ tipo: 'Central', ...resultadoCentral });

      // Step 2: Procesar Administración Autonómica
      const resultadoAutonomica = await step.run("sync-organos-autonomica", async () => {
        logger.info("🏛️ Procesando Administración Autonómica...");
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-organos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tipoAdmin: 'A' }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        logger.info("✅ Administración Autonómica completada", { processed: resultado.stats?.processed });
        return resultado;
      });
      resultados.push({ tipo: 'Autonómica', ...resultadoAutonomica });

      // Step 3: Procesar Administración Local
      const resultadoLocal = await step.run("sync-organos-local", async () => {
        logger.info("🏛️ Procesando Administración Local...");
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-organos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tipoAdmin: 'L' }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        logger.info("✅ Administración Local completada", { processed: resultado.stats?.processed });
        return resultado;
      });
      resultados.push({ tipo: 'Local', ...resultadoLocal });

      // Step 4: Procesar Otros Órganos
      const resultadoOtros = await step.run("sync-organos-otros", async () => {
        logger.info("🏛️ Procesando Otros Órganos...");
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-organos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tipoAdmin: 'O' }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const resultado = await response.json();
        logger.info("✅ Otros Órganos completados", { processed: resultado.stats?.processed });
        return resultado;
      });
      resultados.push({ tipo: 'Otros', ...resultadoOtros });

      // Calcular totales
      const totalProcessed = resultados.reduce((total, resultado) => total + (resultado.stats?.processed || 0), 0);
      const totalErrors = resultados.reduce((total, resultado) => total + (resultado.stats?.errors || 0), 0);

      logger.info("✅ Sincronización de órganos completada (todos los tipos)", { 
        totalProcessed, 
        totalErrors,
        detalles: resultados.map(r => ({ tipo: r.tipo, processed: r.stats?.processed || 0, errors: r.stats?.errors || 0 }))
      });

      return { 
        success: true, 
        totalProcessed, 
        totalErrors,
        resultados: resultados.map(r => ({ tipo: r.tipo, stats: r.stats }))
      };
    } catch (error) {
      logger.error("❌ Error en sincronización de órganos", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 12: Sincronización de Minimis
 * Sincroniza los minimis usando el endpoint batch existente
 */
export const syncMinimis = inngest.createFunction(
  {
    id: "sync-minimis",
    name: "Sincronizar Minimis",
    retries: 3,
    // Timeout extendido debido al procesamiento paginado y verificaciones de dependencias
    timeouts: {
      start: "15m",
    },
  },
  { event: "app/minimis.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de minimis...");

    try {
      const response = await step.run("call-minimis-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-minimis`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de minimis completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de minimis", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 13: Sincronización de Planes Estratégicos
 * Sincroniza los planes estratégicos usando el endpoint batch existente
 */
export const syncPlanesEstrategicos = inngest.createFunction(
  {
    id: "sync-planes-estrategicos",
    name: "Sincronizar Planes Estratégicos",
    retries: 3,
    // Timeout extendido debido al procesamiento paginado
    timeouts: {
      start: "10m",
    },
  },
  { event: "app/planes-estrategicos.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de planes estratégicos...");

    try {
      const response = await step.run("call-planes-estrategicos-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-planes-estrategicos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de planes estratégicos completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de planes estratégicos", error);
      throw error;
    }
  }
);

/**
 * FUNCIÓN 14: Sincronización Completa
 * Ejecuta todos los procesos de sincronización en orden
 */
export const syncAll = inngest.createFunction(
  {
    id: "sync-all",
    name: "Sincronización Completa",
    retries: 2,
  },
  { event: "app/sync.all.requested" },
  async ({ step, logger, event }) => {
    logger.info("🚀 Iniciando sincronización completa de todos los datos...");

    try {
      // Ejecutar en orden de dependencias
      await step.run("sync-catalogos-basicos", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-catalogos-basicos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-regiones", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-regiones`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-organos", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-organos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-grandes-beneficiarios", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-grandes-beneficiarios`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-ayudas-estado", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-ayudas-estado`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-partidos-politicos", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-partidos-politicos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-concesiones", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-concesiones`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-sanciones", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-sanciones`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-minimis", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-minimis`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      await step.run("sync-planes-estrategicos", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-planes-estrategicos`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok ? await response.json() : null;
      });

      logger.info("✅ Sincronización completa finalizada exitosamente");
      return { success: true, message: "Sincronización completa completada" };
    } catch (error) {
      logger.error("❌ Error en sincronización completa", error);
      throw error;
    }
  }
); 

export const retryPendingDocuments = inngest.createFunction(
  {
    id: "retry-pending-documents",
    name: "Reintentar Documentos Pendientes",
    retries: 2,
  },
  { event: "app/documents.retry.pending" },
  async ({ step, logger, event }) => {
    logger.info("🔄 Iniciando reintento de documentos pendientes...");

    const limit = event.data?.limit || 100;
    const bdns = event.data?.bdns; // Opcional: solo para una convocatoria específica

    // Obtener documentos pendientes
    const pendingDocs = await step.run("get-pending-documents", async () => {
      const { getPendingDocuments } = await import("~/server/services/storage");
      return await getPendingDocuments(limit);
    });

    if (pendingDocs.length === 0) {
      logger.info("✅ No hay documentos pendientes para procesar");
      return { message: "No pending documents found", processed: 0 };
    }

    // Filtrar por BDNS si se especifica
    const filteredDocs = bdns 
      ? pendingDocs.filter(doc => doc.convocatoria.codigoBDNS === bdns)
      : pendingDocs;

    logger.info(`📋 Encontrados ${filteredDocs.length} documentos pendientes`, {
      totalPendientes: pendingDocs.length,
      filtradosPorBDNS: bdns ? filteredDocs.length : null,
      bdnsFiltro: bdns
    });

    // Crear eventos para procesar cada documento
    const docEvents = filteredDocs.map(doc => ({
      name: "app/document.process.storage",
      data: {
        bdns: doc.convocatoria.codigoBDNS,
        docId: doc.idOficial,
      },
    }));

    // Enviar eventos en lotes para evitar sobrecarga
    const BATCH_SIZE = 50;
    const batches = [];
    for (let i = 0; i < docEvents.length; i += BATCH_SIZE) {
      batches.push(docEvents.slice(i, i + BATCH_SIZE));
    }

    let totalEnqueued = 0;
    for (const [index, batch] of batches.entries()) {
      await step.sendEvent(`retry-documents-batch-${index + 1}`, batch);
      totalEnqueued += batch.length;
      
      logger.info(`📤 Lote ${index + 1}/${batches.length} enviado`, {
        documentosEnLote: batch.length,
        totalEnviados: totalEnqueued
      });
    }

    logger.info(`✅ Reintento de documentos completado`, {
      documentosEncontrados: filteredDocs.length,
      documentosEncolados: totalEnqueued,
      lotes: batches.length,
      filtro: bdns || 'todos'
    });

    return { 
      processed: totalEnqueued,
      found: filteredDocs.length,
      batches: batches.length,
      filter: bdns
    };
  }
); 