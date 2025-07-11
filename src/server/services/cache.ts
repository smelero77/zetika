import { dbETL as db } from '~/server/db';
import { logger } from '~/server/lib/logger';

// Tipos para el cache
type CachedFinalidad = { id: number; idOficial: number; descripcion: string };
type CachedReglamento = { id: number; idOficial: number; descripcion: string };
type CachedTipoBeneficiario = { id: number; idOficial: number; descripcion: string };
type CachedInstrumento = { id: number; idOficial: number; descripcion: string };
type CachedRegion = { id: number; idOficial: number; nombre: string };
type CachedFondo = { id: number; nombre: string };
type CachedSector = { id: number; idOficial: number; codigo: string | null; descripcion: string };

// Cache global para catálogos
export const catalogCache = {
  finalidades: new Map<string, CachedFinalidad>(),
  reglamentos: new Map<number, CachedReglamento>(),
  tiposBeneficiario: new Map<number, CachedTipoBeneficiario>(),
  instrumentos: new Map<number, CachedInstrumento>(),
  regiones: new Map<number, CachedRegion>(),
  fondos: new Map<string, CachedFondo>(),
  sectores: new Map<string, CachedSector>(),
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
  sectores.forEach(s => {
    if (s.codigo) catalogCache.sectores.set(s.codigo, s);
  });
  
  logger.info(`Cache cargado: ${finalidades.length} finalidades, ${reglamentos.length} reglamentos, ${tiposBeneficiario.length} tipos beneficiario, ${instrumentos.length} instrumentos, ${regiones.length} regiones, ${fondos.length} fondos, ${sectores.length} sectores`);
}

// Función para cargar cache de convocatorias existentes
export async function loadExistingConvocatoriasCache() {
  logger.info('Cargando cache de convocatorias existentes...');
  
  const rows = await db.convocatoria.findMany({
    select: { idOficial: true, contentHash: true }
  });
  
  rows.forEach(r => existingConvocatoriasCache.set(r.idOficial, r.contentHash || ''));
  
  logger.info(`Cache cargado: ${existingConvocatoriasCache.size} convocatorias existentes`);
}

// Funciones para obtener del cache con tipos corregidos
export function getCachedFinalidad(descripcion: string | null): CachedFinalidad | null {
  return descripcion ? catalogCache.finalidades.get(descripcion) || null : null;
}

export function getCachedReglamento(idOficial: number): CachedReglamento | null {
  return catalogCache.reglamentos.get(idOficial) || null;
}

export function getCachedTiposBeneficiario(ids: number[]): CachedTipoBeneficiario[] {
  return ids.map(id => catalogCache.tiposBeneficiario.get(id)).filter((item): item is CachedTipoBeneficiario => item !== undefined);
}

export function getCachedInstrumentos(ids: number[]): CachedInstrumento[] {
  return ids.map(id => catalogCache.instrumentos.get(id)).filter((item): item is CachedInstrumento => item !== undefined);
}

export function getCachedRegiones(ids: number[]): CachedRegion[] {
  return ids.map(id => catalogCache.regiones.get(id)).filter((item): item is CachedRegion => item !== undefined);
}

export function getCachedFondos(nombres: string[]): CachedFondo[] {
  return nombres.map(nombre => catalogCache.fondos.get(nombre)).filter((item): item is CachedFondo => item !== undefined);
}

export function getCachedSectores(codigos: string[]): CachedSector[] {
  return codigos.map(codigo => catalogCache.sectores.get(codigo)).filter((item): item is CachedSector => item !== undefined);
}

// Verificar si convocatoria existe sin consultar BD
export function convocatoriaExists(idOficial: number): boolean {
  return existingConvocatoriasCache.has(idOficial);
}

// Actualizar cache de convocatorias
export function updateConvocatoriaCache(detalle: { idOficial?: number; id?: number }, hash: string) {
  const id = detalle.idOficial || detalle.id;
  if (id) {
    existingConvocatoriasCache.set(id, hash);
  }
} 