import { NextResponse } from 'next/server';
import { env } from '~/env';

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true,
      env: {
        SNPSAP_API_BASE_URL: env.SNPSAP_API_BASE_URL,
        SNPSAP_PORTAL: env.SNPSAP_PORTAL,
        NODE_ENV: env.NODE_ENV,
        // También mostramos la variable directa de process.env para comparar
        processEnv: {
          SNPSAP_API_BASE_URL: process.env.SNPSAP_API_BASE_URL,
          SNPSAP_PORTAL: process.env.SNPSAP_PORTAL,
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 