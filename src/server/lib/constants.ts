export const PRISMA_CONFIG = {
  LOG_LEVEL: process.env.PRISMA_LOG_LEVEL ?? 'error',
};

export const BETTERSTACK_INGEST_URL = 'https://s1372096.eu-nbg-2.betterstackdata.com';

// Añadimos la constante de la API SNPSAP
export const SNPSAP_API_BASE_URL = process.env.SNPSAP_API_BASE_URL ?? ''; 