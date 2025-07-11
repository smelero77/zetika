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
import { validateAndSanitizeConvocatoriaDetalle, sanitizeString, type ConvocatoriaDetalle } from '~/schemas/convocatoria-detalle';
import { catalogResolver } from '~/server/services/catalog-resolver';

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
function parseDate(dateStr: string | null | undefined): Date {
    if (!dateStr) throw new Error('Fecha requerida pero no proporcionada');
    return new Date(dateStr);
}

function parseDateOptional(dateStr: string | null | undefined): Date | null {
    return dateStr ? new Date(dateStr) : null;
}

function parseBoolean(value: string | boolean | null | undefined): boolean | null {
    if (value === undefined || value === null) return null;
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
    
    // --- PASO 1: VALIDAR Y SANITIZAR DATOS ---
    let validatedDetalle;
    try {
        validatedDetalle = validateAndSanitizeConvocatoriaDetalle(detalle);
    } catch (error) {
        logger.error(`Error validando convocatoria ${detalle.id}:`, error as Error, logMeta);
        throw new Error(`Datos de convocatoria ${detalle.id} no válidos: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Calcular hash con datos sanitizados
    const newHash = computeContentHash(validatedDetalle as unknown as Record<string, unknown>);
    
    // --- PASO 2: RESOLVER CATÁLOGOS POR DESCRIPCIÓN ---
    const [
        tiposBeneficiariosResult,
        instrumentosResult,
        sectoresResult,
        regionesResult,
        fondosResult,
        objetivosResult,
        sectoresProductosResult,
        reglamentoResult,
        organoResult,
    ] = await Promise.all([
        catalogResolver.resolveTiposBeneficiarios(validatedDetalle.tiposBeneficiarios || []),
        catalogResolver.resolveInstrumentos(validatedDetalle.instrumentos || []),
        catalogResolver.resolveSectores(validatedDetalle.sectores || []),
        catalogResolver.resolveRegiones(validatedDetalle.regiones || []),
        catalogResolver.resolveFondos(validatedDetalle.fondos || []),
        catalogResolver.resolveObjetivos(validatedDetalle.objetivos || []),
        catalogResolver.resolveSectoresProductos(validatedDetalle.sectoresProductos || []),
        catalogResolver.resolveReglamentoUE(validatedDetalle.reglamento),
        catalogResolver.resolveOrgano(validatedDetalle.organo),
    ]);
    
    // --- PASO 3: DETERMINAR SI NECESITA REVISIÓN MANUAL ---
    const allSummaries = [
        tiposBeneficiariosResult.summary,
        instrumentosResult.summary,
        sectoresResult.summary,
        regionesResult.summary,
        fondosResult.summary,
        objetivosResult.summary,
        sectoresProductosResult.summary,
    ];
    
    const needsManualReview = allSummaries.some(s => s.needsManualReview) || 
                             reglamentoResult.summary.needsManualReview || 
                             organoResult.summary.needsManualReview;
    
    const missingCatalogs = allSummaries.flatMap(s => s.missingCatalogs);
    missingCatalogs.push(...reglamentoResult.summary.missingCatalogs);
    missingCatalogs.push(...organoResult.summary.missingCatalogs);
    
    if (missingCatalogs.length > 0) {
        logger.warn(`Convocatoria ${detalle.id} tiene catálogos faltantes:`, { 
            ...logMeta, 
            missingCatalogs,
            needsManualReview 
        });
    }

    // --- PASO 4: UPSERT PRINCIPAL CON RELACIONES M-M ANIDADAS ---
    const convocatoria = await dbETL.convocatoria.upsert({
        where: { idOficial: validatedDetalle.id },
        create: {
            idOficial: validatedDetalle.id,
            codigoBDNS: validatedDetalle.codigoBDNS,
            numeroConvocatoria: validatedDetalle.numeroConvocatoria || null,
            titulo: validatedDetalle.descripcion || '',
            tituloCooficial: validatedDetalle.descripcionLeng,
            descripcion: validatedDetalle.descripcionBasesReguladoras,
            presupuestoTotal: validatedDetalle.presupuestoTotal,
            urlBasesReguladoras: validatedDetalle.urlBasesReguladoras,
            sedeElectronica: validatedDetalle.sedeElectronica,
            fechaRecepcion: parseDateOptional(validatedDetalle.fechaRecepcion),
            fechaPublicacion: parseDate(validatedDetalle.fechaPublicacion ?? validatedDetalle.fechaRecepcion),
            fechaInicioSolicitud: parseDateOptional(validatedDetalle.fechaInicioSolicitud),
            fechaFinSolicitud: parseDateOptional(validatedDetalle.fechaFinSolicitud),
            plazoAbierto: parseBoolean(validatedDetalle.abierto),
            mrr: parseBoolean(validatedDetalle.mrr),
            tipoConvocatoria: validatedDetalle.tipoConvocatoria,
            descripcionBasesReguladoras: validatedDetalle.descripcionBasesReguladoras,
            sePublicaDiarioOficial: validatedDetalle.sePublicaDiarioOficial,
            textInicioSolicitud: validatedDetalle.textInicio,
            textFinSolicitud: validatedDetalle.textFin,
            ayudaEstadoSANumber: validatedDetalle.ayudaEstado,
            ayudaEstadoUrl: validatedDetalle.urlAyudaEstado,
            advertencia: validatedDetalle.advertencia,
            estado: validatedDetalle.estado,
            indInactiva: validatedDetalle.indInactiva,
            needsManualReview,
            // Campos del órgano
            nivel1: validatedDetalle.organo?.nivel1,
            nivel2: validatedDetalle.organo?.nivel2,
            nivel3: validatedDetalle.organo?.nivel3,
            // Relaciones M-M con catálogos resueltos
            tiposBeneficiario: { connect: tiposBeneficiariosResult.ids.map(id => ({ id })) },
            instrumentosAyuda: { connect: instrumentosResult.ids.map(id => ({ id })) },
            regionesDeImpacto: { connect: regionesResult.ids.map(id => ({ id })) },
            fondosEuropeos: { connect: fondosResult.ids.map(id => ({ id })) },
            sectoresEconomicos: { connect: sectoresResult.ids.map(id => ({ id })) },
            sectoresDeProducto: { connect: sectoresProductosResult.ids.map(id => ({ id })) },
            objetivos: { connect: objetivosResult.ids.map(id => ({ id })) },
        },
        update: {
            titulo: validatedDetalle.descripcion || '',
            tituloCooficial: validatedDetalle.descripcionLeng,
            descripcion: validatedDetalle.descripcionBasesReguladoras,
            presupuestoTotal: validatedDetalle.presupuestoTotal,
            urlBasesReguladoras: validatedDetalle.urlBasesReguladoras,
            sedeElectronica: validatedDetalle.sedeElectronica,
            fechaRecepcion: parseDateOptional(validatedDetalle.fechaRecepcion),
            fechaPublicacion: parseDate(validatedDetalle.fechaPublicacion ?? validatedDetalle.fechaRecepcion),
            fechaInicioSolicitud: parseDateOptional(validatedDetalle.fechaInicioSolicitud),
            fechaFinSolicitud: parseDateOptional(validatedDetalle.fechaFinSolicitud),
            plazoAbierto: parseBoolean(validatedDetalle.abierto),
            mrr: parseBoolean(validatedDetalle.mrr),
            tipoConvocatoria: validatedDetalle.tipoConvocatoria,
            descripcionBasesReguladoras: validatedDetalle.descripcionBasesReguladoras,
            sePublicaDiarioOficial: validatedDetalle.sePublicaDiarioOficial,
            textInicioSolicitud: validatedDetalle.textInicio,
            textFinSolicitud: validatedDetalle.textFin,
            ayudaEstadoSANumber: validatedDetalle.ayudaEstado,
            ayudaEstadoUrl: validatedDetalle.urlAyudaEstado,
            advertencia: validatedDetalle.advertencia,
            estado: validatedDetalle.estado,
            indInactiva: validatedDetalle.indInactiva,
            needsManualReview,
            // Campos del órgano
            nivel1: validatedDetalle.organo?.nivel1,
            nivel2: validatedDetalle.organo?.nivel2,
            nivel3: validatedDetalle.organo?.nivel3,
            // Relaciones M-M con catálogos resueltos
            tiposBeneficiario: { set: tiposBeneficiariosResult.ids.map(id => ({ id })) },
            instrumentosAyuda: { set: instrumentosResult.ids.map(id => ({ id })) },
            regionesDeImpacto: { set: regionesResult.ids.map(id => ({ id })) },
            fondosEuropeos: { set: fondosResult.ids.map(id => ({ id })) },
            sectoresEconomicos: { set: sectoresResult.ids.map(id => ({ id })) },
            sectoresDeProducto: { set: sectoresProductosResult.ids.map(id => ({ id })) },
            objetivos: { set: objetivosResult.ids.map(id => ({ id })) },
        },
    });

    // --- PASO 3: SINCRONIZAR RELACIONES 1-N EN PARALELO ---
    const syncTasks: Promise<unknown>[] = [];
    const syncTaskNames: string[] = [];

    if (validatedDetalle.documentos && validatedDetalle.documentos.length > 0) {
        syncTaskNames.push('documentos');
        syncTasks.push(dbETL.$transaction([
            dbETL.documento.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            dbETL.documento.createMany({
                data: validatedDetalle.documentos.map((doc) => ({
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
    
    if (validatedDetalle.anuncios && validatedDetalle.anuncios.length > 0) {
        syncTaskNames.push('anuncios');
        syncTasks.push(dbETL.$transaction([
            dbETL.anuncio.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            dbETL.anuncio.createMany({
                data: validatedDetalle.anuncios.map((an) => ({
                    numAnuncio: parseNumber(an.numAnuncio),
                    titulo: an.titulo || '',
                    tituloLeng: an.tituloLeng || null,
                    texto: an.texto || '',
                    url: an.url || null,
                    cve: an.cve || null,
                    desDiarioOficial: an.desDiarioOficial || null,
                    fechaPublicacion: an.datPublicacion ? new Date(an.datPublicacion) : null,
                    convocatoriaId: convocatoria.id,
                })),
                skipDuplicates: true,
            })
        ]));
    }

    // Los objetivos ya se manejan en la relación M-M con catálogos
    // if (validatedDetalle.objetivos && validatedDetalle.objetivos.length > 0) {
    //     syncTaskNames.push('objetivos');
    //     syncTasks.push(dbETL.$transaction([
    //         dbETL.objetivo.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
    //         dbETL.objetivo.createMany({
    //             data: validatedDetalle.objetivos.map((obj) => ({
    //                 descripcion: obj.descripcion,
    //                 convocatoriaId: convocatoria.id,
    //             })),
    //             skipDuplicates: true,
    //         })
    //     ]));
    // }
    
    const syncResults = await Promise.allSettled(syncTasks);
    const documentosProcesados = validatedDetalle.documentos || [];

    const failedTasks: { name: string, reason: unknown }[] = [];
    syncResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            const taskName = syncTaskNames[index] ?? 'unknown_task';
            failedTasks.push({ name: taskName, reason: result.reason });
        }
    });

    if (failedTasks.length > 0) {
        const failedTaskNames = failedTasks.map(f => f.name).join(', ');
        const error = new Error(`Fallaron sub-tareas de sincronización para convocatoria ${validatedDetalle.id}: ${failedTaskNames}`);
        logger.error(`Fallaron sub-tareas de sincronización para convocatoria ${validatedDetalle.id}: ${failedTaskNames}. Inngest reintentará el step.`, error, logMeta);
        throw error;
    }

    // Actualizar hash y fecha de sincronización
    await dbETL.convocatoria.update({
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
    // ELIMINADOS: Los parámetros order y direccion causan error 400 en la API
    // url.searchParams.append("order", "fechaPublicacion");
    // url.searchParams.append("direccion", "desc");
    
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
    
    // ELIMINADOS: Parámetros adicionales que pueden causar error 400
    // url.searchParams.append("estado", "todas");
    // url.searchParams.append("includeInactivas", "true");
    // url.searchParams.append("format", "json");
    // url.searchParams.append("detalleMinimo", "false");

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
            // Retornar estructura vacía válida en lugar de lanzar error
            return { 
                content: [], 
                last: true, 
                totalElements: 0, 
                totalPages: 0, 
                number: page 
            };
        }
        
        const data = await response.json();
        
        // Validación defensiva: asegurar que data tiene la estructura esperada
        if (!data || typeof data !== 'object') {
            logger.warn(`Respuesta inválida de la API para página ${page}`, { ...logMeta, receivedData: data });
            return { 
                content: [], 
                last: true, 
                totalElements: 0, 
                totalPages: 0, 
                number: page 
            };
        }
        
        // Asegurar que content sea un array
        if (!Array.isArray(data.content)) {
            data.content = [];
        }
        
        logger.info(`Página ${page} de convocatorias recibida`, { ...logMeta, count: data.content?.length || 0 });
        metrics.gauge('etl.pages.item_count', data.content?.length || 0);
        
        return data;

    } catch (error: unknown) {
        logger.error(`Excepción de red al obtener página ${page} de convocatorias`, error as Error, logMeta);
        metrics.increment('etl.pages.failed');
        // Retornar estructura vacía válida en lugar de lanzar error
        return { 
            content: [], 
            last: true, 
            totalElements: 0, 
            totalPages: 0, 
            number: page 
        };
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