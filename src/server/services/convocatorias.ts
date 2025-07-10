import { db, dbETL } from '~/server/db';
import { logger } from '~/server/lib/logger';
import { metrics } from '~/server/lib/metrics';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';
import { computeContentHash } from '~/server/utils/hash';
import { fetchAndStoreDocument } from '~/server/services/storage';
import {
  getCachedFinalidad,
  getCachedReglamento,
  getCachedTiposBeneficiario,
  getCachedInstrumentos,
  getCachedRegiones,
  getCachedFondos,
  getCachedSectores,
  existingConvocatoriasCache,
} from './cache';

// Tipos para los datos de convocatorias
interface ConvocatoriaDetalle {
    id: number;
    codigoBDNS: string;
    descripcion: string;
    descripcionLeng?: string;
    descripcionBasesReguladoras?: string;
    presupuestoTotal?: number;
    urlBasesReguladoras?: string;
    sedeElectronica?: string;
    fechaPublicacion?: string;
    fechaRecepcion?: string;
    fechaInicioSolicitud?: string;
    fechaFinSolicitud?: string;
    abierto?: boolean;
    mrr?: string;
    tipoConvocatoria?: string;
    sePublicaDiarioOficial?: boolean;
    textInicio?: string;
    ayudaEstado?: string;
    urlAyudaEstado?: string;
    descripcionFinalidad?: string;
    reglamento?: { autorizacion?: string };
    tiposBeneficiarios?: Array<{ id: number }>;
    instrumentos?: Array<{ id: number }>;
    regiones?: Array<{ id: number }>;
    fondos?: Array<{ descripcion: string }>;
    sectores?: Array<{ codigo: string }>;
    documentos?: Array<{
        id: number;
        nombreFic: string;
        descripcion: string;
        long: number;
        datMod?: string;
        datPublicacion?: string;
    }>;
    anuncios?: Array<{
        numAnuncio: string;
        titulo: string;
        tituloLeng?: string;
        texto: string;
        url: string;
        cve: string;
        desDiarioOficial: string;
        datPublicacion?: string;
    }>;
    objetivos?: Array<{
        descripcion: string;
    }>;
}

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';

export async function getConvocatoriaDetalle(bdns: string, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias`);
    url.searchParams.append('numConv', bdns);
    url.searchParams.append('vpd', PORTAL);
    // Parámetros adicionales para obtener datos completos
    url.searchParams.append('includeDocumentos', 'true');      // Incluir documentos
    url.searchParams.append('includeAnuncios', 'true');        // Incluir anuncios
    url.searchParams.append('includeObjetivos', 'true');       // Incluir objetivos
    url.searchParams.append('detalle', 'completo');            // Detalle completo
    url.searchParams.append('format', 'json');                 // Formato JSON explícito

    const logMeta = { jobName, runId, catalogName: 'Convocatorias', bdns };
    logger.info(`Pidiendo detalle COMPLETO para BDNS: ${bdns}`, logMeta);
    metrics.increment('etl.items.fetched');

    try {
        const response = await fetch(url.toString(), { 
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Zetika-ETL/1.0'
            } 
        });
        if (!response.ok) {
            logger.warn(`No se pudo obtener el detalle para BDNS ${bdns}`, { ...logMeta, status: response.status });
            metrics.increment('etl.items.errors');
            return null;
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data[0] : data;

    } catch (error: unknown) {
        logger.error(`Excepción de red al obtener detalle para BDNS ${bdns}`, error as Error, logMeta);
        metrics.increment('etl.items.errors');
        return null;
    }
}

// Helper functions para conversión de tipos
function parseDate(dateStr: string | undefined): Date {
    if (!dateStr) throw new Error('Fecha requerida pero no proporcionada');
    return new Date(dateStr);
}

function parseDateOptional(dateStr: string | undefined): Date | null {
    return dateStr ? new Date(dateStr) : null;
}

function parseBoolean(value: string | boolean | undefined): boolean | null {
    if (value === undefined) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
}

function parseNumber(value: string | number | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10);
    throw new Error(`Valor numérico inválido: ${value}`);
}

export async function processAndSaveDetalle(detalle: ConvocatoriaDetalle, jobName: string, runId: string) {
    const logMeta = { jobName, runId, catalogName: 'Convocatorias', convocatoriaId: detalle.id };
    const startItem = Date.now();
    
    const newHash = computeContentHash(detalle as unknown as Record<string, unknown>);
    
    // --- PASO 1: PREPARAR DATOS (FUERA DE CUALQUIER TRANSACCIÓN) ---
    const finalidad = detalle.descripcionFinalidad ? getCachedFinalidad(detalle.descripcionFinalidad) : null;
    const reglamento = detalle.reglamento?.autorizacion ? getCachedReglamento(Number(detalle.reglamento.autorizacion)) : null;
    const tiposBeneficiarioIds = getCachedTiposBeneficiario((detalle.tiposBeneficiarios || []).map((t) => t.id).filter(Boolean));
    const instrumentosIds = getCachedInstrumentos((detalle.instrumentos || []).map((i) => i.id).filter(Boolean));
    const regionesIds = getCachedRegiones((detalle.regiones || []).map((r) => r.id).filter(Boolean));
    const fondosIds = getCachedFondos((detalle.fondos || []).map((f) => f.descripcion));
    const sectoresIds = getCachedSectores((detalle.sectores || []).map((s) => s.codigo).filter(Boolean));

    // --- PASO 2: UPSERT PRINCIPAL CON RELACIONES M-M ANIDADAS ---
    const convocatoria = await db.convocatoria.upsert({
        where: { idOficial: detalle.id },
        create: {
            idOficial: detalle.id,
            codigoBDNS: detalle.codigoBDNS,
            titulo: detalle.descripcion,
            tituloCooficial: detalle.descripcionLeng,
            descripcion: detalle.descripcionBasesReguladoras,
            presupuestoTotal: detalle.presupuestoTotal,
            urlBasesReguladoras: detalle.urlBasesReguladoras,
            sedeElectronica: detalle.sedeElectronica,
            fechaPublicacion: parseDate(detalle.fechaPublicacion ?? detalle.fechaRecepcion),
            fechaInicioSolicitud: parseDateOptional(detalle.fechaInicioSolicitud),
            fechaFinSolicitud: parseDateOptional(detalle.fechaFinSolicitud),
            plazoAbierto: parseBoolean(detalle.abierto),
            mrr: parseBoolean(detalle.mrr),
            finalidadId: finalidad?.idOficial,
            reglamentoId: reglamento?.idOficial,
            tipoConvocatoria: detalle.tipoConvocatoria,
            descripcionBasesReguladoras: detalle.descripcionBasesReguladoras,
            sePublicaDiarioOficial: detalle.sePublicaDiarioOficial,
            textInicioSolicitud: detalle.textInicio,
            ayudaEstadoSANumber: detalle.ayudaEstado,
            ayudaEstadoUrl: detalle.urlAyudaEstado,
            tiposBeneficiario: { connect: tiposBeneficiarioIds.map(t => ({ id: t.id })) },
            instrumentosAyuda: { connect: instrumentosIds.map(i => ({ id: i.id })) },
            regionesDeImpacto: { connect: regionesIds.map(r => ({ id: r.id })) },
            fondosEuropeos: { connect: fondosIds.map(f => ({ id: f.id })) },
            sectoresEconomicos: { connect: sectoresIds.map(s => ({ id: s.id })) },
        },
        update: {
            titulo: detalle.descripcion,
            tituloCooficial: detalle.descripcionLeng,
            descripcion: detalle.descripcionBasesReguladoras,
            presupuestoTotal: detalle.presupuestoTotal,
            urlBasesReguladoras: detalle.urlBasesReguladoras,
            sedeElectronica: detalle.sedeElectronica,
            fechaPublicacion: parseDate(detalle.fechaPublicacion ?? detalle.fechaRecepcion),
            fechaInicioSolicitud: parseDateOptional(detalle.fechaInicioSolicitud),
            fechaFinSolicitud: parseDateOptional(detalle.fechaFinSolicitud),
            plazoAbierto: parseBoolean(detalle.abierto),
            mrr: parseBoolean(detalle.mrr),
            finalidadId: finalidad?.idOficial,
            reglamentoId: reglamento?.idOficial,
            tipoConvocatoria: detalle.tipoConvocatoria,
            descripcionBasesReguladoras: detalle.descripcionBasesReguladoras,
            sePublicaDiarioOficial: detalle.sePublicaDiarioOficial,
            textInicioSolicitud: detalle.textInicio,
            ayudaEstadoSANumber: detalle.ayudaEstado,
            ayudaEstadoUrl: detalle.urlAyudaEstado,
            tiposBeneficiario: { set: tiposBeneficiarioIds.map(t => ({ id: t.id })) },
            instrumentosAyuda: { set: instrumentosIds.map(i => ({ id: i.id })) },
            regionesDeImpacto: { set: regionesIds.map(r => ({ id: r.id })) },
            fondosEuropeos: { set: fondosIds.map(f => ({ id: f.id })) },
            sectoresEconomicos: { set: sectoresIds.map(s => ({ id: s.id })) },
        },
    });

    // --- PASO 3: SINCRONIZAR RELACIONES 1-N EN PARALELO ---
    const syncTasks: Promise<unknown>[] = [];
    const syncTaskNames: string[] = [];

    if (detalle.documentos && detalle.documentos.length > 0) {
        syncTaskNames.push('documentos');
        syncTasks.push(db.$transaction([
            db.documento.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            db.documento.createMany({
                data: detalle.documentos.map((doc) => ({
                    idOficial: doc.id,
                    nombreFic: doc.nombreFic,
                    descripcion: doc.descripcion,
                    longitud: doc.long,
                    fechaMod: doc.datMod ? new Date(doc.datMod) : null,
                    fechaPublic: doc.datPublicacion ? new Date(doc.datPublicacion) : null,
                    convocatoriaId: convocatoria.id,
                })),
                skipDuplicates: true,
            })
        ]));
    }
    
    if (detalle.anuncios && detalle.anuncios.length > 0) {
        syncTaskNames.push('anuncios');
        syncTasks.push(db.$transaction([
            db.anuncio.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            db.anuncio.createMany({
                data: detalle.anuncios.map((an) => ({
                    numAnuncio: parseNumber(an.numAnuncio),
                    titulo: an.titulo,
                    tituloLeng: an.tituloLeng,
                    texto: an.texto,
                    url: an.url,
                    cve: an.cve,
                    desDiarioOficial: an.desDiarioOficial,
                    fechaPublicacion: an.datPublicacion ? new Date(an.datPublicacion) : null,
                    convocatoriaId: convocatoria.id,
                })),
                skipDuplicates: true,
            })
        ]));
    }

    if (detalle.objetivos && detalle.objetivos.length > 0) {
        syncTaskNames.push('objetivos');
        syncTasks.push(db.$transaction([
            db.objetivo.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            db.objetivo.createMany({
                data: detalle.objetivos.map((obj) => ({
                    descripcion: obj.descripcion,
                    convocatoriaId: convocatoria.id,
                })),
                skipDuplicates: true,
            })
        ]));
    }
    
    const syncResults = await Promise.allSettled(syncTasks);
    const documentosProcesados = detalle.documentos || [];

    const failedTasks: { name: string, reason: unknown }[] = [];
    syncResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            const taskName = syncTaskNames[index] ?? 'unknown_task';
            failedTasks.push({ name: taskName, reason: result.reason });
        }
    });

    if (failedTasks.length > 0) {
        const failedTaskNames = failedTasks.map(f => f.name).join(', ');
        const error = new Error(`Fallaron sub-tareas de sincronización para convocatoria ${detalle.id}: ${failedTaskNames}`);
        logger.error(`Fallaron sub-tareas de sincronización para convocatoria ${detalle.id}: ${failedTaskNames}. Inngest reintentará el step.`, error, logMeta);
        throw error;
    }

    // Actualizar hash y fecha de sincronización
    await db.convocatoria.update({
        where: { id: convocatoria.id },
        data: {
            contentHash: newHash,
            lastSyncedAt: new Date(),
        },
    });
    
    const duration = Date.now() - startItem;
    metrics.histogram('etl.items.processed.duration_ms', duration);
    logger.info('Convocatoria y todas sus relaciones procesadas exitosamente.', { 
        ...logMeta, 
        durationMs: duration, 
        documentosCount: documentosProcesados.length,
        syncTasksCount: syncTasks.length
    });

    return { hash: newHash, documentos: documentosProcesados };
}

export function hasConvocatoriaChanged(detalle: ConvocatoriaDetalle): boolean {
    const newHash = computeContentHash(detalle as unknown as Record<string, unknown>);
    const oldHash = existingConvocatoriasCache.get(Number(detalle.id)) || '';
    return oldHash !== newHash;
}

export function convocatoriaExistsInCache(detalle: ConvocatoriaDetalle): boolean {
    return existingConvocatoriasCache.has(Number(detalle.id));
}

export function getStoredConvocatoriaHash(detalle: ConvocatoriaDetalle): string {
    return existingConvocatoriasCache.get(Number(detalle.id)) || '';
}

export function updateConvocatoriaCache(detalle: ConvocatoriaDetalle, processedHash: string): void {
    existingConvocatoriasCache.set(Number(detalle.id), processedHash);
}

export function getConvocatoriaStatus(detalle: ConvocatoriaDetalle) {
    const exists = existingConvocatoriasCache.has(Number(detalle.id));
    const storedHash = existingConvocatoriasCache.get(Number(detalle.id)) || '';
    const currentHash = computeContentHash(detalle as unknown as Record<string, unknown>);
    const hasChanged = storedHash !== currentHash;
    
    let skipReason: string | undefined;
    if (!hasChanged) {
        skipReason = exists ? 'sin cambios' : 'nueva convocatoria';
    }
    
    return {
        exists,
        hasChanged,
        storedHash,
        currentHash,
        skipReason
    };
}

export async function getConvocatoriasPage(page: number, pageSize: number, jobName: string, runId: string, modo: 'initial' | 'incremental' = 'initial') {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias/busqueda`);
    url.searchParams.append("vpd", PORTAL);
    url.searchParams.append("page", String(page));
    url.searchParams.append("pageSize", String(pageSize));
    url.searchParams.append("order", "fechaPublicacion");       // Mejor orden para carga inicial
    url.searchParams.append("direccion", "desc");
    
    // Configurar fechas según el modo
    if (modo === 'initial') {
        // Para carga inicial: obtener convocatorias desde hace 3 años
        const fechaDesde = new Date();
        fechaDesde.setFullYear(fechaDesde.getFullYear() - 3);
        const fechaDesdeStr = fechaDesde.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        url.searchParams.append("fechaDesde", fechaDesdeStr);
        
        // Sin fechaHasta para obtener hasta hoy
        logger.info(`Modo inicial: obteniendo convocatorias desde ${fechaDesdeStr}`, { jobName, runId });
    } else {
        // Para modo incremental: últimos 30 días
        const fechaDesde = new Date();
        fechaDesde.setDate(fechaDesde.getDate() - 30);
        const fechaDesdeStr = fechaDesde.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        url.searchParams.append("fechaDesde", fechaDesdeStr);
        
        const hoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        url.searchParams.append("fechaHasta", hoy);
        
        logger.info(`Modo incremental: obteniendo convocatorias desde ${fechaDesdeStr} hasta ${hoy}`, { jobName, runId });
    }
    
    // Parámetros adicionales para obtener más datos
    url.searchParams.append("estado", "todas");                 // Todas las convocatorias (abiertas, cerradas, etc.)
    url.searchParams.append("includeInactivas", "true");        // Incluir convocatorias inactivas
    url.searchParams.append("format", "json");                  // Formato JSON explícito
    url.searchParams.append("detalleMinimo", "false");          // Obtener detalle básico en listado

    const fechaConfig = modo === 'initial' ? 'últimos 3 años' : 'últimos 30 días';
    const logMeta = { jobName, runId, catalogName: 'Convocatorias', page, pageSize, modo, fechaConfig };
    logger.info(`Pidiendo página ${page} de convocatorias (${fechaConfig})...`, logMeta);
    metrics.increment('etl.pages.fetched');

    try {
        const response = await fetch(url.toString(), { 
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Zetika-ETL/1.0'
            } 
        });
        if (!response.ok) {
            logger.warn(`Fallo fetching página ${page} de convocatorias`, { ...logMeta, status: response.status });
            metrics.increment('etl.pages.failed');
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        logger.info(`Página ${page} de convocatorias recibida`, { ...logMeta, count: data.content?.length || 0 });
        metrics.gauge('etl.pages.item_count', data.content?.length || 0);
        
        return data;

    } catch (error: unknown) {
        logger.error(`Excepción de red al obtener página ${page} de convocatorias`, error as Error, logMeta);
        metrics.increment('etl.pages.failed');
        throw error;
    }
} 

/**
 * Obtiene las últimas convocatorias publicadas - más eficiente para sincronización incremental
 */
export async function getConvocatoriasUltimas(limit: number, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias/ultimas`);
    url.searchParams.append("vpd", PORTAL);
    url.searchParams.append("limit", String(limit));
    url.searchParams.append("format", "json");
    url.searchParams.append("includeInactivas", "true");

    const logMeta = { jobName, runId, catalogName: 'ConvocatoriasUltimas', limit };
    logger.info(`Pidiendo ${limit} convocatorias más recientes...`, logMeta);
    metrics.increment('etl.items.fetched');

    try {
        const response = await fetch(url.toString(), { 
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Zetika-ETL/1.0'
            } 
        });
        if (!response.ok) {
            logger.warn(`No se pudieron obtener las últimas convocatorias`, { ...logMeta, status: response.status });
            metrics.increment('etl.items.errors');
            return null;
        }
        
        const data = await response.json();
        logger.info(`Últimas convocatorias recibidas`, { ...logMeta, count: data.length || 0 });
        
        return data;

    } catch (error: unknown) {
        logger.error(`Excepción de red al obtener últimas convocatorias`, error as Error, logMeta);
        metrics.increment('etl.items.errors');
        return null;
    }
}

/**
 * Obtiene documentos de una convocatoria específica - más eficiente que extraer del detalle
 */
export async function getConvocatoriaDocumentos(bdns: string, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias/documentos`);
    url.searchParams.append("numConv", bdns);
    url.searchParams.append("vpd", PORTAL);
    url.searchParams.append("format", "json");
    url.searchParams.append("includeMetadata", "true");

    const logMeta = { jobName, runId, catalogName: 'ConvocatoriaDocumentos', bdns };
    logger.info(`Pidiendo documentos para BDNS: ${bdns}`, logMeta);
    metrics.increment('etl.items.fetched');

    try {
        const response = await fetch(url.toString(), { 
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Zetika-ETL/1.0'
            } 
        });
        if (!response.ok) {
            logger.warn(`No se pudieron obtener los documentos para BDNS ${bdns}`, { ...logMeta, status: response.status });
            metrics.increment('etl.items.errors');
            return null;
        }
        
        const data = await response.json();
        logger.info(`Documentos de convocatoria recibidos`, { ...logMeta, count: data.length || 0 });
        
        return data;

    } catch (error: unknown) {
        logger.error(`Excepción de red al obtener documentos para BDNS ${bdns}`, error as Error, logMeta);
        metrics.increment('etl.items.errors');
        return null;
    }
}

/**
 * Obtiene PDF de convocatoria usando endpoint específico - alternativa a descarga directa
 */
export async function getConvocatoriaPDF(bdns: string, tipoDoc: string, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias/pdf`);
    url.searchParams.append("numConv", bdns);
    url.searchParams.append("vpd", PORTAL);
    url.searchParams.append("tipoDoc", tipoDoc);  // 'bases', 'anuncio', 'resolucion', etc.

    const logMeta = { jobName, runId, catalogName: 'ConvocatoriaPDF', bdns, tipoDoc };
    logger.info(`Pidiendo PDF ${tipoDoc} para BDNS: ${bdns}`, logMeta);
    metrics.increment('etl.items.fetched');

    try {
        const response = await fetch(url.toString(), { 
            headers: { 
                'Accept': 'application/pdf',
                'User-Agent': 'Zetika-ETL/1.0'
            } 
        });
        if (!response.ok) {
            logger.warn(`No se pudo obtener el PDF ${tipoDoc} para BDNS ${bdns}`, { ...logMeta, status: response.status });
            metrics.increment('etl.items.errors');
            return null;
        }
        
        const pdfBuffer = await response.arrayBuffer();
        logger.info(`PDF de convocatoria recibido`, { ...logMeta, sizeBytes: pdfBuffer.byteLength });
        
        return Buffer.from(pdfBuffer);

    } catch (error: unknown) {
        logger.error(`Excepción de red al obtener PDF para BDNS ${bdns}`, error as Error, logMeta);
        metrics.increment('etl.items.errors');
        return null;
    }
}

/**
 * Exporta convocatorias usando endpoint de exportación - útil para respaldos
 */
export async function exportConvocatorias(formato: 'csv' | 'xlsx' | 'json', filtros: Record<string, string>, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias/exportar`);
    url.searchParams.append("vpd", PORTAL);
    url.searchParams.append("formato", formato);
    
    // Agregar filtros dinámicamente
    Object.entries(filtros).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const logMeta = { jobName, runId, catalogName: 'ConvocatoriasExport', formato, filtros };
    logger.info(`Exportando convocatorias en formato ${formato}...`, logMeta);
    metrics.increment('etl.items.fetched');

    try {
        const response = await fetch(url.toString(), { 
            headers: { 
                'Accept': formato === 'json' ? 'application/json' : 'application/octet-stream',
                'User-Agent': 'Zetika-ETL/1.0'
            } 
        });
        if (!response.ok) {
            logger.warn(`No se pudo exportar las convocatorias`, { ...logMeta, status: response.status });
            metrics.increment('etl.items.errors');
            return null;
        }
        
        const data = formato === 'json' ? await response.json() : await response.arrayBuffer();
        logger.info(`Convocatorias exportadas exitosamente`, { 
            ...logMeta, 
            size: formato === 'json' ? (data as any[]).length : (data as ArrayBuffer).byteLength 
        });
        
        return data;

    } catch (error: unknown) {
        logger.error(`Excepción de red al exportar convocatorias`, error as Error, logMeta);
        metrics.increment('etl.items.errors');
        return null;
    }
} 