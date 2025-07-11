import { NextResponse } from 'next/server';
import { dbETL as db } from '~/server/db';

export async function GET() {
  try {
    console.log('Iniciando prueba de conexión a la base de datos...');
    
    // Intentar una consulta simple para verificar la conexión
    const start = Date.now();
    const result = await db.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - start;
    
    console.log('Conexión exitosa, resultado:', result);
    
    // También probar una consulta a una tabla real
    const count = await db.catalogoObjetivo.count();
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      details: {
        rawQuery: result,
        catalogoObjetivoCount: count,
        connectionDuration: duration + 'ms',
        databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'No configurada',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'No configurada',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 