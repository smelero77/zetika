import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Probando conectividad directa a Supabase...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Variables de Supabase no configuradas',
        missing: {
          supabaseUrl: !supabaseUrl,
          supabaseKey: !supabaseKey
        }
      }, { status: 500 });
    }

    // Test 1: Connectivity básica a Supabase REST API
    console.log('Test 1: Conectividad básica...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });

    console.log('Respuesta de Supabase:', response.status, response.statusText);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Error en conectividad Supabase: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: `${supabaseUrl}/rest/v1/`
        }
      }, { status: 500 });
    }

    // Test 2: Consulta simple a una tabla
    console.log('Test 2: Consulta a tabla...');
    const tableResponse = await fetch(`${supabaseUrl}/rest/v1/catalogoObjetivo?select=count`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });

    let tableData = null;
    if (tableResponse.ok) {
      const responseText = await tableResponse.text();
      console.log('Respuesta de tabla:', responseText);
      try {
        tableData = JSON.parse(responseText);
      } catch (e) {
        tableData = responseText;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Conectividad a Supabase exitosa',
      tests: {
        basicConnectivity: {
          status: response.status,
          ok: response.ok
        },
        tableQuery: {
          status: tableResponse.status,
          ok: tableResponse.ok,
          data: tableData
        }
      },
      config: {
        supabaseUrl: supabaseUrl ? 'Configurada' : 'No configurada',
        supabaseKey: supabaseKey ? 'Configurada' : 'No configurada',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en test de Supabase:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 