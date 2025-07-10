import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL no está configurada'
      }, { status: 500 });
    }

    // Análisis detallado de la URL
    const urlLength = databaseUrl.length;
    const hasWhitespace = /\s/.test(databaseUrl);
    const startsCorrectly = databaseUrl.startsWith('postgres://');
    
    // Intentar parsear la URL
    let parseResult;
    try {
      const url = new URL(databaseUrl);
      
      parseResult = {
        success: true,
        protocol: url.protocol,
        username: url.username,
        // Mostrar solo los primeros y últimos 3 caracteres de la contraseña
        password: url.password ? `${url.password.substring(0, 3)}***${url.password.substring(url.password.length - 3)}` : 'NO_PASSWORD',
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search
      };
    } catch (parseError) {
      parseResult = {
        success: false,
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      };
    }

    // Verificaciones específicas
    const checks = {
      hasCorrectProtocol: startsCorrectly,
      hasWhitespace: hasWhitespace,
      urlLength: urlLength,
      isEmpty: urlLength === 0,
      hasAtSymbol: databaseUrl.includes('@'),
      hasColon: databaseUrl.includes(':'),
      hasSlashes: databaseUrl.includes('//'),
      
      // Verificación específica para transaction mode
      isTransactionMode: databaseUrl.includes('pooler.supabase.com:6543'),
      isDirectConnection: databaseUrl.includes('.supabase.co:5432'),
      
      // Buscar caracteres problemáticos
      hasInvalidChars: /[^\w\-\.@:\/\?&=]/.test(databaseUrl)
    };

    // Mostrar la URL con caracteres problemáticos resaltados (sin mostrar la contraseña completa)
    const maskedUrl = databaseUrl.replace(
      /(postgres:\/\/[^:]+:)([^@]+)(@.+)/,
      (match, prefix, password, suffix) => {
        const maskedPassword = password.length > 6 
          ? `${password.substring(0, 3)}***${password.substring(password.length - 3)}`
          : '***';
        return `${prefix}${maskedPassword}${suffix}`;
      }
    );

    return NextResponse.json({
      success: true,
      analysis: {
        urlLength,
        maskedUrl,
        parseResult,
        checks,
        recommendations: [
          !checks.hasCorrectProtocol && 'URL debe empezar con "postgres://"',
          checks.hasWhitespace && 'URL contiene espacios en blanco - elimínalos',
          checks.isEmpty && 'URL está vacía',
          !checks.hasAtSymbol && 'URL debe contener @ para separar credenciales del host',
          !checks.isTransactionMode && !checks.isDirectConnection && 'URL no parece ser de Supabase',
          checks.isDirectConnection && 'Estás usando conexión directa (5432) - cambia a transaction mode (6543)',
          checks.hasInvalidChars && 'URL contiene caracteres no válidos'
        ].filter(Boolean)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 