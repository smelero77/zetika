/**
 * Configuración de Inngest para Zetika
 * 
 * Este archivo contiene todas las configuraciones necesarias para que Inngest
 * funcione correctamente con todos los procesos batch del proyecto.
 */

export const INNGEST_CONFIG = {
  // ID único de la aplicación en Inngest
  APP_ID: "zetika",
  
  // URL base de la aplicación
  BASE_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  
  // Secret para autenticación de endpoints batch
  CRON_SECRET: process.env.CRON_SECRET || "default-secret",
  
  // Configuración de logging
  LOG_LEVEL: process.env.INNGEST_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'warn'),
  
  // Configuración de concurrencia para diferentes tipos de funciones
  CONCURRENCY: {
    // Procesamiento de documentos (más concurrencia porque son operaciones I/O)
    DOCUMENT_STORAGE: 5,
    
    // Procesamiento de lotes de convocatorias (menos concurrencia para evitar sobrecarga)
    CONVOCATORIA_BATCH: 2,
    
    // Sincronización de datos (concurrencia moderada)
    DATA_SYNC: 3,
  },
  
  // Configuración de reintentos
  RETRIES: {
    // Funciones críticas (más reintentos)
    CRITICAL: 4,
    
    // Funciones normales
    NORMAL: 3,
    
    // Funciones simples (menos reintentos)
    SIMPLE: 2,
  },
  
  // Endpoints de los procesos batch
  BATCH_ENDPOINTS: {
    CATALOGOS_BASICOS: "/api/batch/sync-catalogos-basicos",
    REGIONES: "/api/batch/sync-regiones",
    GRANDES_BENEFICIARIOS: "/api/batch/sync-grandes-beneficiarios",
    AYUDAS_ESTADO: "/api/batch/sync-ayudas-estado",
    PARTIDOS_POLITICOS: "/api/batch/sync-partidos-politicos",
    CONCESIONES: "/api/batch/sync-concesiones",
    SANCIONES: "/api/batch/sync-sanciones",
    ORGANOS: "/api/batch/sync-organos",
    MINIMIS: "/api/batch/sync-minimis",
    PLANES_ESTRATEGICOS: "/api/batch/sync-planes-estrategicos",
  },
  
  // Eventos de Inngest
  EVENTS: {
    // Eventos de sincronización individual
    CATALOGOS_SYNC: "app/catalogos.sync.requested",
    REGIONES_SYNC: "app/regiones.sync.requested",
    GRANDES_BENEFICIARIOS_SYNC: "app/grandes-beneficiarios.sync.requested",
    AYUDAS_ESTADO_SYNC: "app/ayudas-estado.sync.requested",
    PARTIDOS_POLITICOS_SYNC: "app/partidos-politicos.sync.requested",
    CONCESIONES_SYNC: "app/concesiones.sync.requested",
    SANCIONES_SYNC: "app/sanciones.sync.requested",
    ORGANOS_SYNC: "app/organos.sync.requested",
    MINIMIS_SYNC: "app/minimis.sync.requested",
    PLANES_ESTRATEGICOS_SYNC: "app/planes-estrategicos.sync.requested",
    
    // Eventos de sincronización completa
    SYNC_ALL: "app/sync.all.requested",
    
    // Eventos de convocatorias
    CONVOCATORIAS_SYNC: "app/convocatorias.sync.requested",
    CONVOCATORIA_BATCH: "app/convocatoria.process.batch",
    
    // Eventos de documentos
    DOCUMENT_STORAGE: "app/document.process.storage",
  },
  
  // Orden de ejecución para sincronización completa
  SYNC_ORDER: [
    "CATALOGOS_BASICOS",
    "REGIONES", 
    "ORGANOS",
    "GRANDES_BENEFICIARIOS",
    "AYUDAS_ESTADO",
    "PARTIDOS_POLITICOS",
    "CONCESIONES",
    "SANCIONES",
    "MINIMIS",
    "PLANES_ESTRATEGICOS",
  ],
};

/**
 * Función helper para obtener la URL completa de un endpoint batch
 */
export function getBatchEndpoint(endpoint: string): string {
  return `${INNGEST_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Función helper para obtener los headers de autenticación
 */
export function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${INNGEST_CONFIG.CRON_SECRET}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Función helper para validar que todas las variables de entorno estén configuradas
 */
export function validateInngestConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!INNGEST_CONFIG.CRON_SECRET || INNGEST_CONFIG.CRON_SECRET === "default-secret") {
    errors.push("CRON_SECRET no está configurado en las variables de entorno");
  }
  
  if (!INNGEST_CONFIG.BASE_URL) {
    errors.push("NEXTAUTH_URL no está configurado en las variables de entorno");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
} 