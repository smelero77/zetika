import { db } from '~/server/db';
import { logger } from '~/server/lib/logger';

// Cache global para catálogos
export const catalogCache = {
  finalidades: new Map<string, any>(),
  reglamentos: new Map<number, any>(),
  tiposBeneficiario: new Map<number, any>(),
  instrumentos: new Map<number, any>(),
  regiones: new Map<number, any>(),
  fondos: new Map<string, any>(),
  sectores: new Map<string, any>(),
};

// Cache de convocatorias existentes
export const existingConvocatoriasCache = new Map<number, string>();

// Función para cargar cache de catálogos
export async function loadCatalogCache() {
  logger.info('Cargando cache de catálogos...');
  
  // Cargar finalidades
  const finalidades = await db.finalidad.findMany();
  finalidades.forEach(f => catalogCache.finalidades.set(f.descripcion, f));
  
  // Cargar reglamentos
  const reglamentos = await db.reglamentoUE.findMany();
  reglamentos.forEach(r => catalogCache.reglamentos.set(r.idOficial, r));
  
  // Cargar tipos de beneficiario
  const tiposBeneficiario = await db.tipoBeneficiario.findMany();
  tiposBeneficiario.forEach(t => catalogCache.tiposBeneficiario.set(t.idOficial, t));
  
  // Cargar instrumentos de ayuda
  const instrumentos = await db.instrumentoAyuda.findMany();
  instrumentos.forEach(i => catalogCache.instrumentos.set(i.idOficial, i));
  
  // Cargar regiones
  const regiones = await db.region.findMany();
  regiones.forEach(r => catalogCache.regiones.set(r.idOficial, r));
  
  // Cargar fondos
  const fondos = await db.fondo.findMany();
  fondos.forEach(f => catalogCache.fondos.set(f.nombre, f));
  
  // Cargar sectores/actividades
  const sectores = await db.actividad.findMany();
  sectores.forEach(s => catalogCache.sectores.set(s.codigo, s));
  
  logger.info(`Cache cargado: ${finalidades.length} finalidades, ${reglamentos.length} reglamentos, ${tiposBeneficiario.length} tipos beneficiario, ${instrumentos.length} instrumentos, ${regiones.length} regiones, ${fondos.length} fondos, ${sectores.length} sectores`);
}

// Función para cargar cache de convocatorias existentes
export async function loadExistingConvocatoriasCache() {
  logger.info('Cargando cache de convocatorias existentes...');
  
  const rows = await db.convocatoria.findMany({
    select: { idOficial: true, contentHash: true }
  });
  
  rows.forEach(r => existingConvocatoriasCache.set(r.idOficial, r.contentHash !== null ? r.contentHash : ''));
  
  logger.info(`Cache cargado: ${existingConvocatoriasCache.size} convocatorias existentes`);
}

// Funciones para obtener del cache
export function getCachedFinalidad(descripcion: string | null) {
  return descripcion ? catalogCache.finalidades.get(descripcion) : null;
}

export function getCachedReglamento(idOficial: number) {
  return catalogCache.reglamentos.get(idOficial);
}

export function getCachedTiposBeneficiario(ids: number[]) {
  return ids.map(id => catalogCache.tiposBeneficiario.get(id)).filter(Boolean);
}

export function getCachedInstrumentos(ids: number[]) {
  return ids.map(id => catalogCache.instrumentos.get(id)).filter(Boolean);
}

export function getCachedRegiones(ids: number[]) {
  return ids.map(id => catalogCache.regiones.get(id)).filter(Boolean);
}

export function getCachedFondos(nombres: string[]) {
  return nombres.map(nombre => catalogCache.fondos.get(nombre)).filter(Boolean);
}

export function getCachedSectores(codigos: string[]) {
  return codigos.map(codigo => catalogCache.sectores.get(codigo)).filter(Boolean);
}

// Verificar si convocatoria existe sin consultar BD
export function convocatoriaExists(idOficial: number): boolean {
  return existingConvocatoriasCache.has(idOficial);
}

// Actualizar cache de convocatorias
export function updateConvocatoriaCache(detalle: any, hash: string) {
  if (detalle && detalle.idOficial) {
    existingConvocatoriasCache.set(detalle.idOficial, hash);
  }
} 