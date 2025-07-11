import { serve } from "inngest/next";
import { inngest } from "~/inngest";
import {
  createConvocatoriaJobs,
  processConvocatoriaBatch,
  processDocumentStorage,
  retryPendingDocuments,
  syncCatalogosBasicos,
  syncRegiones,
  syncGrandesBeneficiarios,
  syncAyudasDeEstado,
  syncPartidosPoliticos,
  syncConcesiones,
  syncSanciones,
  syncOrganos,
  syncMinimis,
  syncPlanesEstrategicos,
  syncAll,
} from "~/inngest/functions";

// Configurar timeout máximo para funciones de Inngest (300 segundos en plan Hobby)
export const maxDuration = 300;

// Crear el handler de Inngest con todas las funciones
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    createConvocatoriaJobs,
    processConvocatoriaBatch,
    processDocumentStorage,
    retryPendingDocuments,
    syncCatalogosBasicos,
    syncRegiones,
    syncGrandesBeneficiarios,
    syncAyudasDeEstado,
    syncPartidosPoliticos,
    syncConcesiones,
    syncSanciones,
    syncOrganos,
    syncMinimis,
    syncPlanesEstrategicos,
    syncAll,
  ],
});

export const runtime = "nodejs"; 