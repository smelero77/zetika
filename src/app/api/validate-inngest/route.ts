import { NextResponse } from "next/server";
import { validateInngestConfig, INNGEST_CONFIG } from "~/lib/inngest-config";

export async function GET() {
  try {
    // Validar configuración
    const configValidation = validateInngestConfig();
    
    // Verificar que el endpoint de Inngest esté disponible
    let inngestEndpointStatus = "unknown";
    try {
      const response = await fetch(`${INNGEST_CONFIG.BASE_URL}/api/inngest`, {
        method: 'GET',
      });
      inngestEndpointStatus = response.ok ? "available" : `error-${response.status}`;
    } catch (error) {
      inngestEndpointStatus = "unavailable";
    }

    // Verificar que los endpoints batch existan
    const batchEndpointsStatus: Record<string, string> = {};
    
    for (const [key, endpoint] of Object.entries(INNGEST_CONFIG.BATCH_ENDPOINTS)) {
      try {
        const response = await fetch(`${INNGEST_CONFIG.BASE_URL}${endpoint}`, {
          method: 'GET',
        });
        batchEndpointsStatus[key] = response.ok ? "available" : `error-${response.status}`;
      } catch (error) {
        batchEndpointsStatus[key] = "unavailable";
      }
    }

    // Verificar variables de entorno
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not-set",
      CRON_SECRET: process.env.CRON_SECRET ? "set" : "not-set",
      INNGEST_LOG_LEVEL: process.env.INNGEST_LOG_LEVEL || "default",
      NODE_ENV: process.env.NODE_ENV || "development",
    };

    const status = {
      valid: configValidation.valid && inngestEndpointStatus === "available",
      timestamp: new Date().toISOString(),
      configuration: {
        valid: configValidation.valid,
        errors: configValidation.errors,
        envVars,
      },
      endpoints: {
        inngest: inngestEndpointStatus,
        batch: batchEndpointsStatus,
      },
      functions: {
        total: 15,
        individual: 11,
        processing: 3,
        complete: 1,
      },
      events: Object.keys(INNGEST_CONFIG.EVENTS).length,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error en validación de Inngest:", error);
    return NextResponse.json({
      valid: false,
      error: "Error interno durante la validación",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: "Endpoint de validación de Inngest",
    usage: "GET /api/validate-inngest para validar la configuración",
    description: "Este endpoint verifica que Inngest esté correctamente configurado y que todos los endpoints batch estén disponibles."
  });
} 