import { PrismaClient } from "@prisma/client";

import { env } from "~/env";
import { PRISMA_CONFIG } from "~/server/lib/constants";

// Configuración específica para evitar prepared statements en entornos serverless
const getConnectionUrl = (baseUrl: string, disablePreparedStatements = false) => {
  const url = new URL(baseUrl);
  
  if (disablePreparedStatements) {
    // Parámetros clave para evitar problemas de prepared statements en serverless
    url.searchParams.set('prepared_statements', 'false');
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
    url.searchParams.set('pool_timeout', '20');
    url.searchParams.set('connect_timeout', '10');
  }
  
  // Configuración básica de SSL para producción
  url.searchParams.set('sslmode', 'require');
  
  return url.toString();
};

const createPrismaClient = () =>
  new PrismaClient({
    log: PRISMA_CONFIG.LOG_LEVEL === 'query' 
      ? ["query", "error", "warn"] 
      : PRISMA_CONFIG.LOG_LEVEL === 'info'
      ? ["info", "error", "warn"]
      : PRISMA_CONFIG.LOG_LEVEL === 'warn'
      ? ["error", "warn"]
      : ["error"], // Solo errores por defecto
    datasources: {
      db: {
        url: getConnectionUrl(env.DATABASE_URL),
      },
    },
  });

// Cliente específico para ETL con prepared statements deshabilitados
const createETLPrismaClient = () =>
  new PrismaClient({
    log: ["error"], // Solo errores para procesos ETL
    datasources: {
      db: {
        url: getConnectionUrl(
          env.DATABASE_URL_BATCH ?? env.DATABASE_URL, 
          true // Desactivar prepared statements para ETL
        ),
      },
    },
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  prismaETL: ReturnType<typeof createETLPrismaClient> | undefined;
};

// Función para cerrar conexiones previas en desarrollo
const initializePrismaClient = () => {
  if (env.NODE_ENV === "development" && globalForPrisma.prisma) {
    // En desarrollo, cerrar conexiones previas antes de crear nuevas
    globalForPrisma.prisma.$disconnect().catch(() => {
      // Ignorar errores de desconexión
    });
  }
  return createPrismaClient();
};

const initializeETLPrismaClient = () => {
  if (env.NODE_ENV === "development" && globalForPrisma.prismaETL) {
    // En desarrollo, cerrar conexiones previas antes de crear nuevas
    globalForPrisma.prismaETL.$disconnect().catch(() => {
      // Ignorar errores de desconexión
    });
  }
  return createETLPrismaClient();
};

export const db = globalForPrisma.prisma ?? initializePrismaClient();

// Cliente ETL separado para procesos de sincronización con prepared statements deshabilitados
export const dbETL = globalForPrisma.prismaETL ?? initializeETLPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaETL = dbETL;
}

// Manejo de cierre limpio
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    void Promise.all([
      db.$disconnect(),
      dbETL.$disconnect()
    ]).catch(() => {
      // Ignorar errores de desconexión al cerrar
    });
  });
} 