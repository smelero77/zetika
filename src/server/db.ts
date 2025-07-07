import { PrismaClient } from "@prisma/client";

import { env } from "~/env";
import { PRISMA_CONFIG } from "~/server/lib/constants";

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
        url: env.DATABASE_URL,
      },
    },
  });

// Cliente específico para ETL con logging mínimo y configuración optimizada
const createETLPrismaClient = () =>
  new PrismaClient({
    log: ["error"], // Solo errores para procesos ETL
    datasources: {
      db: {
        url: env.DATABASE_URL,
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

// Cliente ETL separado para procesos de sincronización
export const dbETL = globalForPrisma.prismaETL ?? initializeETLPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaETL = dbETL;
}

// Manejo de cierre limpio en desarrollo
if (env.NODE_ENV === "development") {
  process.on('beforeExit', () => {
    void Promise.all([
      db.$disconnect(),
      dbETL.$disconnect()
    ]).catch(() => {
      // Ignorar errores de desconexión al cerrar
    });
  });
} 