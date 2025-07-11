import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dbETL as db } from '~/server/db';
import { supabaseAdmin } from '~/server/lib/supabase';
import { logger } from '~/server/lib/logger';

export async function fetchAndStoreDocument(
  bdns: string,
  docId: number
): Promise<{ storagePath: string; publicUrl: string }> {
  const remoteUrl = `https://www.infosubvenciones.es/bdnstrans/GE/es/convocatoria/${bdns}/document/${docId}`;
  
  // Log inicial con información del documento
  const docInfo = await db.documento.findUnique({
    where: { idOficial: docId },
    select: { nombreFic: true, descripcion: true, longitud: true }
  });
  
  logger.info('📥 Iniciando descarga de documento', { 
    bdns, 
    docId, 
    remoteUrl,
    nombreArchivo: docInfo?.nombreFic,
    descripcion: docInfo?.descripcion,
    tamanoBytes: docInfo?.longitud ? Number(docInfo.longitud) : undefined
  });

  const startTime = Date.now();

  try {
    // Crear AbortController para timeout de 30 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const res = await fetch(remoteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Zetika-Document-Fetcher/1.0',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const httpError = new Error(`HTTP ${res.status}: ${res.statusText} al descargar ${remoteUrl}`);
      logger.error('❌ Error HTTP al descargar documento', httpError, { 
        bdns, 
        docId, 
        status: res.status, 
        statusText: res.statusText,
        remoteUrl,
        nombreArchivo: docInfo?.nombreFic
      });
      throw httpError;
    }

    const buffer = await res.arrayBuffer();
    const downloadDuration = Date.now() - startTime;
    const actualSize = buffer.byteLength;
    
    logger.info('📦 Documento descargado exitosamente', {
      bdns,
      docId,
      tamanoDescargado: actualSize,
      tamanoEsperado: docInfo?.longitud ? Number(docInfo.longitud) : undefined,
      tiempoDescarga: downloadDuration,
      nombreArchivo: docInfo?.nombreFic
    });

    // Verificar tamaño si está disponible
    if (docInfo?.longitud && Math.abs(actualSize - Number(docInfo.longitud)) > 1024) {
      logger.warn('⚠️ Discrepancia en tamaño de archivo', {
        bdns,
        docId,
        tamanoEsperado: Number(docInfo.longitud),
        tamanoDescargado: actualSize,
        diferencia: actualSize - Number(docInfo.longitud)
      });
    }

    const path = `${bdns}/${docId}.pdf`;
    const uploadStart = Date.now();

    const { error } = await supabaseAdmin
      .storage
      .from('docs')
      .upload(path, Buffer.from(buffer), {
        contentType: 'application/pdf',
        upsert: true,
      });
      
    if (error) {
      const uploadError = new Error(error.message);
      logger.error('❌ Error al subir documento a Supabase', uploadError, {
        bdns,
        docId,
        path,
        nombreArchivo: docInfo?.nombreFic
      });
      throw uploadError;
    }

    const uploadDuration = Date.now() - uploadStart;
    const totalDuration = Date.now() - startTime;

    const { data } = supabaseAdmin
      .storage
      .from('docs')
      .getPublicUrl(path);

    logger.info('☁️ Documento almacenado exitosamente', { 
      bdns,
      docId,
      path, 
      publicUrl: data.publicUrl,
      tamanoBytes: actualSize,
      tiempoTotal: totalDuration,
      tiempoDescarga: downloadDuration,
      tiempoSubida: uploadDuration,
      nombreArchivo: docInfo?.nombreFic
    });
    
    return { storagePath: path, publicUrl: data.publicUrl };
    
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    
    logger.error('❌ Error completo al procesar documento', error as Error, {
      bdns,
      docId,
      tiempoTranscurrido: totalDuration,
      remoteUrl,
      nombreArchivo: docInfo?.nombreFic
    });
    
    throw error;
  }
}

/**
 * Obtiene estadísticas de documentos pendientes de descarga
 */
export async function getDocumentStats(bdns?: string) {
  const whereClause = bdns ? { convocatoria: { codigoBDNS: bdns } } : {};
  
  const [total, conStorage, sinStorage] = await Promise.all([
    db.documento.count({ where: whereClause }),
    db.documento.count({ 
      where: { 
        ...whereClause,
        AND: [
          { storagePath: { not: null } },
          { storageUrl: { not: null } }
        ]
      } 
    }),
    db.documento.count({ 
      where: { 
        ...whereClause,
        OR: [
          { storagePath: null },
          { storageUrl: null }
        ]
      } 
    })
  ]);

  return {
    total,
    conStorage,
    sinStorage,
    porcentajeCompletado: total > 0 ? Math.round((conStorage / total) * 100) : 0
  };
}

/**
 * Obtiene lista de documentos pendientes de descarga
 */
export async function getPendingDocuments(limit = 50) {
  return db.documento.findMany({
    where: {
      OR: [
        { storagePath: null },
        { storageUrl: null }
      ]
    },
    include: {
      convocatoria: {
        select: {
          codigoBDNS: true,
          titulo: true
        }
      }
    },
    orderBy: [
      { convocatoria: { fechaPublicacion: 'desc' } },
      { id: 'asc' }
    ],
    take: limit
  });
} 