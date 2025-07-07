import { db } from '~/server/db';
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

const PORTAL = process.env.SNPSAP_PORTAL ?? 'GE';

export async function getConvocatoriaDetalle(bdns: string, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias`);
    url.searchParams.append('numConv', bdns);
    url.searchParams.append('vpd', PORTAL);

    const logMeta = { jobName, runId, catalogName: 'Convocatorias', bdns };
    logger.info(`Pidiendo detalle para BDNS: ${bdns}`, logMeta);
    metrics.increment('etl.items.fetched');

    try {
        const response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
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

export async function processAndSaveDetalle(detalle: any, jobName: string, runId: string) {
    const logMeta = { jobName, runId, catalogName: 'Convocatorias', convocatoriaId: detalle.id };
    const startItem = Date.now();
    
    const newHash = computeContentHash(detalle);
    
    // --- PASO 1: PREPARAR DATOS (FUERA DE CUALQUIER TRANSACCIÓN) ---
    const finalidad = detalle.descripcionFinalidad ? getCachedFinalidad(detalle.descripcionFinalidad) : null;
    const reglamento = detalle.reglamento?.autorizacion ? getCachedReglamento(detalle.reglamento.autorizacion) : null;
    const tiposBeneficiarioIds = getCachedTiposBeneficiario((detalle.tiposBeneficiarios || []).map((t: any) => t.id).filter(Boolean));
    const instrumentosIds = getCachedInstrumentos((detalle.instrumentos || []).map((i: any) => i.id).filter(Boolean));
    const regionesIds = getCachedRegiones((detalle.regiones || []).map((r: any) => r.id).filter(Boolean));
    const fondosIds = getCachedFondos((detalle.fondos || []).map((f: any) => f.descripcion));
    const sectoresIds = getCachedSectores((detalle.sectores || []).map((s: any) => s.codigo).filter(Boolean));

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
            fechaPublicacion: new Date(detalle.fechaPublicacion ?? detalle.fechaRecepcion),
            fechaInicioSolicitud: detalle.fechaInicioSolicitud ? new Date(detalle.fechaInicioSolicitud) : null,
            fechaFinSolicitud: detalle.fechaFinSolicitud ? new Date(detalle.fechaFinSolicitud) : null,
            plazoAbierto: detalle.abierto,
            mrr: detalle.mrr,
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
            fechaPublicacion: new Date(detalle.fechaPublicacion ?? detalle.fechaRecepcion),
            fechaInicioSolicitud: detalle.fechaInicioSolicitud ? new Date(detalle.fechaInicioSolicitud) : null,
            fechaFinSolicitud: detalle.fechaFinSolicitud ? new Date(detalle.fechaFinSolicitud) : null,
            plazoAbierto: detalle.abierto,
            mrr: detalle.mrr,
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
    const syncTasks: Promise<any>[] = [];
    const syncTaskNames: string[] = [];

    if (detalle.documentos?.length > 0) {
        syncTaskNames.push('documentos');
        syncTasks.push(db.$transaction([
            db.documento.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            db.documento.createMany({
                data: detalle.documentos.map((doc: any) => ({
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
    
    if (detalle.anuncios?.length > 0) {
        syncTaskNames.push('anuncios');
        syncTasks.push(db.$transaction([
            db.anuncio.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            db.anuncio.createMany({
                data: detalle.anuncios.map((an: any) => ({
                    numAnuncio: an.numAnuncio,
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

    if (detalle.objetivos?.length > 0) {
        syncTaskNames.push('objetivos');
        syncTasks.push(db.$transaction([
            db.objetivo.deleteMany({ where: { convocatoriaId: convocatoria.id } }),
            db.objetivo.createMany({
                data: detalle.objetivos.map((obj: any) => ({
                    descripcion: obj.descripcion,
                    convocatoriaId: convocatoria.id,
                })),
                skipDuplicates: true,
            })
        ]));
    }
    
    const syncResults = await Promise.allSettled(syncTasks);
    const documentosProcesados = detalle.documentos || [];

    const failedTasks: { name: string, reason: any }[] = [];
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

export function hasConvocatoriaChanged(detalle: any): boolean {
    const newHash = computeContentHash(detalle);
    const oldHash = existingConvocatoriasCache.get(Number(detalle.id)) || '';
    return oldHash !== newHash;
}

export function convocatoriaExistsInCache(detalle: any): boolean {
    return existingConvocatoriasCache.has(Number(detalle.id));
}

export function getStoredConvocatoriaHash(detalle: any): string {
    return existingConvocatoriasCache.get(Number(detalle.id)) || '';
}

export function updateConvocatoriaCache(detalle: any, processedHash: string): void {
    existingConvocatoriasCache.set(Number(detalle.id), processedHash);
}

export function getConvocatoriaStatus(detalle: any) {
    const exists = existingConvocatoriasCache.has(Number(detalle.id));
    const storedHash = existingConvocatoriasCache.get(Number(detalle.id)) || '';
    const currentHash = computeContentHash(detalle);
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

export async function getConvocatoriasPage(page: number, pageSize: number, jobName: string, runId: string) {
    const url = new URL(`${SNPSAP_API_BASE_URL}/convocatorias/busqueda`);
    url.searchParams.append("vpd", PORTAL);
    url.searchParams.append("page", String(page));
    url.searchParams.append("pageSize", String(pageSize));
    url.searchParams.append("order", "fechaRecepcion");
    url.searchParams.append("direccion", "desc");
    url.searchParams.append("fechaDesde", "01/06/2025");

    const logMeta = { jobName, runId, catalogName: 'Convocatorias', page, pageSize, fechaDesde: "01/06/2025" };
    logger.info(`Pidiendo página ${page} de convocatorias (desde 01/06/2025)...`, logMeta);
    metrics.increment('etl.pages.fetched');

    try {
        const response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
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