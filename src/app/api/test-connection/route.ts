import { NextResponse } from 'next/server';
import { SNPSAP_API_BASE_URL } from '~/server/lib/constants';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    baseUrl: SNPSAP_API_BASE_URL,
    tests: {} as any
  };

  try {
    console.log('=== DIAGNÓSTICO DE CONECTIVIDAD ===');
    console.log('URL base:', SNPSAP_API_BASE_URL);
    
    // Test 1: Verificar si la URL es válida
    try {
      new URL(SNPSAP_API_BASE_URL);
      diagnostics.tests.urlValidation = { success: true, message: 'URL válida' };
    } catch (e) {
      diagnostics.tests.urlValidation = { success: false, error: e instanceof Error ? e.message : String(e) };
    }

    // Test 2: Probar con diferentes métodos HTTP
    const testMethods = ['HEAD', 'GET', 'OPTIONS'];
    
    for (const method of testMethods) {
      try {
        console.log(`Probando método ${method}...`);
        const response = await fetch(SNPSAP_API_BASE_URL, {
          method: method as any,
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'Zetika-Diagnostic/1.0'
          },
          signal: AbortSignal.timeout(15000), // 15 segundos
        });
        
        diagnostics.tests[`${method.toLowerCase()}Method`] = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        console.log(`${method} - Status:`, response.status);
        
      } catch (error) {
        diagnostics.tests[`${method.toLowerCase()}Method`] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : 'Unknown'
        };
        console.log(`${method} - Error:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Test 3: Probar la URL específica con diferentes timeouts
    const timeouts = [5000, 10000, 30000];
    
    for (const timeout of timeouts) {
      try {
        console.log(`Probando con timeout de ${timeout}ms...`);
        const testUrl = `${SNPSAP_API_BASE_URL}/finalidades?vpd=GE`;
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'Zetika-Diagnostic/1.0'
          },
          signal: AbortSignal.timeout(timeout),
        });

        if (response.ok) {
          const data = await response.json();
          diagnostics.tests[`timeout${timeout}ms`] = {
            success: true,
            status: response.status,
            itemCount: Array.isArray(data) ? data.length : 'Not an array',
            sampleData: Array.isArray(data) ? data.slice(0, 2) : data
          };
          console.log(`Timeout ${timeout}ms - ÉXITO`);
          break; // Si funciona, no necesitamos probar timeouts más largos
        } else {
          diagnostics.tests[`timeout${timeout}ms`] = {
            success: false,
            status: response.status,
            statusText: response.statusText
          };
          console.log(`Timeout ${timeout}ms - HTTP Error:`, response.status);
        }
        
      } catch (error) {
        diagnostics.tests[`timeout${timeout}ms`] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : 'Unknown'
        };
        console.log(`Timeout ${timeout}ms - Error:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Test 4: Verificar si es un problema de DNS
    try {
      const url = new URL(SNPSAP_API_BASE_URL);
      const dnsTest = await fetch(`https://dns.google/resolve?name=${url.hostname}`);
      const dnsData = await dnsTest.json();
      diagnostics.tests.dnsResolution = {
        success: true,
        hostname: url.hostname,
        dnsResponse: dnsData
      };
    } catch (error) {
      diagnostics.tests.dnsResolution = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    console.log('=== FIN DEL DIAGNÓSTICO ===');
    
    // Determinar si algún test fue exitoso
    const hasSuccess = Object.values(diagnostics.tests).some((test: any) => test.success);
    
    return NextResponse.json({
      success: hasSuccess,
      diagnostics,
      summary: {
        totalTests: Object.keys(diagnostics.tests).length,
        successfulTests: Object.values(diagnostics.tests).filter((test: any) => test.success).length,
        failedTests: Object.values(diagnostics.tests).filter((test: any) => !test.success).length
      }
    });

  } catch (error) {
    console.error('Error en diagnóstico:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      diagnostics,
      suggestions: [
        'Verificar conectividad de red',
        'Verificar configuración de proxy/firewall',
        'Verificar si la API requiere autenticación',
        'Verificar si la URL de la API es correcta',
        'Probar desde otro dispositivo/red'
      ]
    });
  }
} 