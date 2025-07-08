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

    // Parsear la URL para identificar problemas
    let urlAnalysis;
    try {
      const url = new URL(databaseUrl);
      
      // Ocultar la contraseña por seguridad, pero mostrar su estructura
      const password = url.password || '';
      const maskedPassword = password.length > 0 
        ? `${password.substring(0, 2)}***${password.substring(password.length - 2)}`
        : 'NO_PASSWORD';

      urlAnalysis = {
        protocol: url.protocol,
        username: url.username,
        password: maskedPassword,
        passwordLength: password.length,
        hasSpecialChars: /[^a-zA-Z0-9]/.test(password),
        specialCharsFound: password.match(/[^a-zA-Z0-9]/g) || [],
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        fullUrl: databaseUrl.replace(password, maskedPassword)
      };
    } catch (parseError) {
      urlAnalysis = {
        parseError: parseError instanceof Error ? parseError.message : 'Error parsing URL',
        rawUrl: databaseUrl.substring(0, 50) + '...' // Solo mostrar el inicio
      };
    }

    // Verificar caracteres problemáticos comunes
    const problematicChars = ['@', '#', '%', '&', '+', '=', '?', ' '];
    const foundProblematic = problematicChars.filter(char => 
      databaseUrl.includes(char) && !databaseUrl.startsWith(`postgres://`) && !databaseUrl.includes(`@${databaseUrl.split('@')[1]}`)
    );

    return NextResponse.json({
      success: true,
      analysis: urlAnalysis,
      recommendations: {
        hasProblematicChars: foundProblematic.length > 0,
        foundChars: foundProblematic,
        needsUrlEncoding: foundProblematic.length > 0,
        suggestion: foundProblematic.length > 0 
          ? 'La contraseña contiene caracteres especiales que necesitan ser URL-encoded'
          : 'La URL parece tener formato correcto'
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