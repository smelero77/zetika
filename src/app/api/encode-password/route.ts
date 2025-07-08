import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password, baseUrl } = await req.json();
    
    if (!password) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere el parámetro password'
      }, { status: 400 });
    }

    // URL encode la contraseña
    const encodedPassword = encodeURIComponent(password);
    
    // Mostrar comparación
    const comparison = {
      original: password,
      encoded: encodedPassword,
      needsEncoding: password !== encodedPassword,
      problematicChars: password.match(/[^a-zA-Z0-9]/g) || []
    };

    // Si se proporciona una URL base, generar la URL completa
    let fullUrlExample = null;
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        url.password = encodedPassword;
        fullUrlExample = url.toString();
      } catch (e) {
        fullUrlExample = 'Error: URL base inválida';
      }
    }

    return NextResponse.json({
      success: true,
      comparison,
      fullUrlExample,
      instructions: [
        '1. Copia el valor "encoded" de arriba',
        '2. Reemplaza la contraseña en tu DATABASE_URL con este valor',
        '3. Actualiza la variable en Vercel',
        '4. Redespliega tu aplicación'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 