import { inngest } from "./client";
import { db } from "~/server/db";
import { loadCatalogCache, loadExistingConvocatoriasCache, updateConvocatoriaCache } from "~/server/services/cache";
import {
  getConvocatoriaDetalle,
  processAndSaveDetalle,
  getConvocatoriaStatus,
  getConvocatoriasPage,
} from "~/server/services/convocatorias";
import { fetchAndStoreDocument } from "~/server/services/storage";
const PAGE_SIZE = 200;

function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return [];
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
        return await getConvocatoriasPage(currentPage, PAGE_SIZE, 'inngest-create-jobs', event.id || 'unknown');
      });

      const items = data.content || [];
      for (const _item of items) {
        const item = _item as { numeroConvocatoria?: string; id?: string; descripcion?: string };
        if (!item || !item.numeroConvocatoria || !item.id) continue;
        const { hasChanged } = getConvocatoriaStatus(item);
        if (hasChanged) {
          allItemsToProcess.push({
            bdns: item.numeroConvocatoria!,
            titulo: item.descripcion || '',
          });
        }
      }
      isLastPage = data.last ?? true;
      currentPage++;
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
      limit: 2,
    },
    retries: 3,
  },
  { event: "app/convocatoria.process.batch" },
  async ({ event, step, logger }) => {
    const { convocatorias, batch_index, total_batches } = event.data;
    logger.info(`📦 Procesando lote ${batch_index}/${total_batches} (${convocatorias.length} convocatorias)`);
    const allDocEvents: Array<{
      name: string;
      data: {
        bdns: string;
        docId: number;
      };
    }> = [];
    for (const convo of convocatorias) {
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
        return { documentos, bdns: (detalle as { codigoBDNS?: string }).codigoBDNS || convo.bdns };
      });
      if (result && result.documentos.length > 0) {
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
    if (allDocEvents.length > 0) {
      await step.sendEvent("fan-out-all-documents-for-batch", allDocEvents);
    }
    logger.info(`✅ Lote ${batch_index}/${total_batches} completado`);
    return { processedCount: convocatorias.length, documentsEnqueued: allDocEvents.length };
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
    const { storagePath, publicUrl } = await step.run("fetch-and-store", () => 
        fetchAndStoreDocument(bdnsString, Number(docId))
    );
    await step.run("update-db-record", () => 
        db.documento.updateMany({
            where: { idOficial: Number(docId) },
            data: { storagePath, storageUrl: publicUrl },
        })
    );
    logger.info(`📄 Documento ${docId} almacenado`);
    return { docId, storagePath };
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
 * Sincroniza los órganos usando el endpoint batch existente
 * NOTA: Incluye timeout extendido debido a la naturaleza jerárquica y recursiva del procesamiento
 */
export const syncOrganos = inngest.createFunction(
  {
    id: "sync-organos",
    name: "Sincronizar Órganos",
    retries: 3,
    // Extender timeout a 15 minutos debido a la naturaleza jerárquica y recursiva del procesamiento
    timeouts: {
      start: "15m",
    },
  },
  { event: "app/organos.sync.requested" },
  async ({ step, logger }) => {
    logger.info("🔄 Iniciando sincronización de órganos...");

    try {
      const response = await step.run("call-organos-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-organos`;
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

      logger.info("✅ Sincronización de órganos completada", response);
      return response;
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