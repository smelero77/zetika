import { NextRequest, NextResponse } from "next/server";
import { inngest } from "~/inngest";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "test-single":
        // Probar una función individual
        await inngest.send({
          name: "app/catalogos.sync.requested",
          data: { test: true },
        });
        return NextResponse.json({ 
          success: true, 
          message: "Evento de catálogos enviado a Inngest" 
        });

      case "test-all":
        // Probar la sincronización completa
        await inngest.send({
          name: "app/sync.all.requested",
          data: { test: true },
        });
        return NextResponse.json({ 
          success: true, 
          message: "Evento de sincronización completa enviado a Inngest" 
        });

      case "test-individual":
        // Probar todas las funciones individuales
        const events = [
          "app/catalogos.sync.requested",
          "app/regiones.sync.requested",
          "app/grandes-beneficiarios.sync.requested",
          "app/ayudas-estado.sync.requested",
          "app/partidos-politicos.sync.requested",
          "app/concesiones.sync.requested",
          "app/sanciones.sync.requested",
          "app/organos.sync.requested",
          "app/masters.sync.requested",
          "app/minimis.sync.requested",
          "app/planes-estrategicos.sync.requested",
        ];

        for (const eventName of events) {
          await inngest.send({
            name: eventName,
            data: { test: true },
          });
        }

        return NextResponse.json({ 
          success: true, 
          message: `Se enviaron ${events.length} eventos a Inngest`,
          events 
        });

      default:
        return NextResponse.json({ 
          error: "Acción no válida. Use: test-single, test-all, o test-individual" 
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en test-inngest:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Endpoint de prueba de Inngest",
    availableActions: [
      "test-single - Prueba una función individual",
      "test-all - Prueba la sincronización completa",
      "test-individual - Prueba todas las funciones individuales"
    ],
    usage: "POST /api/test-inngest con { action: 'test-single' | 'test-all' | 'test-individual' }"
  });
} 