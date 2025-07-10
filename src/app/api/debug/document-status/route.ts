import { NextRequest, NextResponse } from 'next/server';
import { getDocumentStats, getPendingDocuments } from '~/server/services/storage';
import { inngest } from '~/inngest/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bdns = searchParams.get('bdns');
    const showPending = searchParams.get('pending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Obtener estadísticas generales
    const stats = await getDocumentStats(bdns || undefined);

    const response: any = {
      estadisticas: stats,
      timestamp: new Date().toISOString(),
      resumen: {
        porcentajeCompletado: stats.porcentajeCompletado,
        estadoGeneral: stats.porcentajeCompletado >= 90 ? 'Excelente' : 
                      stats.porcentajeCompletado >= 70 ? 'Bueno' : 
                      stats.porcentajeCompletado >= 50 ? 'Regular' : 'Necesita atención'
      }
    };

    // Si se solicitan documentos pendientes, incluirlos
    if (showPending) {
      const pending = await getPendingDocuments(limit);
      response.documentosPendientes = pending.map(doc => ({
        docId: doc.idOficial,
        nombreArchivo: doc.nombreFic,
        descripcion: doc.descripcion,
        tamaño: doc.longitud ? Number(doc.longitud) : null,
        tamañoFormateado: doc.longitud ? `${(Number(doc.longitud) / 1024 / 1024).toFixed(2)} MB` : 'Desconocido',
        convocatoria: {
          bdns: doc.convocatoria.codigoBDNS,
          titulo: doc.convocatoria.titulo.substring(0, 100) + (doc.convocatoria.titulo.length > 100 ? '...' : '')
        },
        fechaMod: doc.fechaMod,
        fechaPublic: doc.fechaPublic,
        urlDescarga: `https://www.infosubvenciones.es/bdnstrans/GE/es/convocatoria/${doc.convocatoria.codigoBDNS}/document/${doc.idOficial}`
      }));
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al obtener estado de documentos', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bdns, limit } = body;

    if (action === 'retry-pending') {
      // Disparar la función de Inngest para reintentar documentos pendientes
      const event = await inngest.send({
        name: "app/documents.retry.pending",
        data: {
          bdns: bdns || undefined,
          limit: limit || 100
        }
      });

      // Obtener estadísticas actuales para el reporte
      const stats = await getDocumentStats(bdns);
      
      return NextResponse.json({
        message: 'Proceso de reintento iniciado exitosamente',
        inngestEventId: event.ids[0],
        estadisticasActuales: {
          documentosPendientes: stats.sinStorage,
          totalDocumentos: stats.total,
          porcentajeCompletado: stats.porcentajeCompletado
        },
        filtro: bdns ? `Solo convocatoria ${bdns}` : 'Todos los documentos pendientes',
        instrucciones: 'Monitorea los logs de Inngest para ver el progreso del reintento'
      });
    }

    if (action === 'get-stats-only') {
      const stats = await getDocumentStats(bdns);
      return NextResponse.json({
        estadisticas: stats,
        recomendacion: stats.sinStorage > 0 ? 
          `Considera ejecutar el reintento para ${stats.sinStorage} documentos pendientes` :
          'Todos los documentos están almacenados correctamente'
      });
    }

    return NextResponse.json(
      { error: 'Acción no soportada. Acciones válidas: retry-pending, get-stats-only' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error en operación', details: error.message },
      { status: 500 }
    );
  }
} 