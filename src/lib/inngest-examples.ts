/**
 * Ejemplos de uso de Inngest para procesos batch
 * 
 * Este archivo contiene ejemplos de cómo usar Inngest programáticamente
 * para ejecutar los diferentes procesos batch del proyecto.
 */

import { inngest } from "~/inngest";
import { INNGEST_CONFIG } from "./inngest-config";

/**
 * Ejemplo 1: Ejecutar sincronización completa
 */
export async function ejecutarSincronizacionCompleta() {
  try {
    const result = await inngest.send({
      name: INNGEST_CONFIG.EVENTS.SYNC_ALL,
      data: {
        timestamp: new Date().toISOString(),
        source: "manual-execution",
      },
    });
    
    console.log("✅ Sincronización completa iniciada:", result);
    return result;
  } catch (error) {
    console.error("❌ Error al iniciar sincronización completa:", error);
    throw error;
  }
}

/**
 * Ejemplo 2: Ejecutar sincronización individual
 */
export async function ejecutarSincronizacionIndividual(tipo: keyof typeof INNGEST_CONFIG.EVENTS) {
  try {
    const eventName = INNGEST_CONFIG.EVENTS[tipo];
    if (!eventName) {
      throw new Error(`Tipo de sincronización no válido: ${tipo}`);
    }

    const result = await inngest.send({
      name: eventName,
      data: {
        timestamp: new Date().toISOString(),
        source: "manual-execution",
        tipo,
      },
    });
    
    console.log(`✅ Sincronización de ${tipo} iniciada:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error al iniciar sincronización de ${tipo}:`, error);
    throw error;
  }
}

/**
 * Ejemplo 3: Ejecutar múltiples sincronizaciones en paralelo
 */
export async function ejecutarSincronizacionesParalelas(tipos: Array<keyof typeof INNGEST_CONFIG.EVENTS>) {
  try {
    const promises = tipos.map(tipo => ejecutarSincronizacionIndividual(tipo));
    const results = await Promise.all(promises);
    
    console.log(`✅ ${results.length} sincronizaciones iniciadas en paralelo`);
    return results;
  } catch (error) {
    console.error("❌ Error al ejecutar sincronizaciones en paralelo:", error);
    throw error;
  }
}

/**
 * Ejemplo 4: Ejecutar sincronización con retraso
 */
export async function ejecutarSincronizacionConRetraso(
  tipo: keyof typeof INNGEST_CONFIG.EVENTS, 
  retrasoMinutos: number
) {
  try {
    const eventName = INNGEST_CONFIG.EVENTS[tipo];
    if (!eventName) {
      throw new Error(`Tipo de sincronización no válido: ${tipo}`);
    }

    const scheduledTime = new Date(Date.now() + retrasoMinutos * 60 * 1000);
    
    const result = await inngest.send({
      name: eventName,
      data: {
        timestamp: new Date().toISOString(),
        source: "scheduled-execution",
        scheduledFor: scheduledTime.toISOString(),
        tipo,
      },
      ts: scheduledTime.getTime(),
    });
    
    console.log(`✅ Sincronización de ${tipo} programada para:`, scheduledTime);
    return result;
  } catch (error) {
    console.error(`❌ Error al programar sincronización de ${tipo}:`, error);
    throw error;
  }
}

/**
 * Ejemplo 5: Ejecutar sincronización con datos personalizados
 */
export async function ejecutarSincronizacionConDatos(
  tipo: keyof typeof INNGEST_CONFIG.EVENTS,
  datosPersonalizados: Record<string, unknown>
) {
  try {
    const eventName = INNGEST_CONFIG.EVENTS[tipo];
    if (!eventName) {
      throw new Error(`Tipo de sincronización no válido: ${tipo}`);
    }

    const result = await inngest.send({
      name: eventName,
      data: {
        timestamp: new Date().toISOString(),
        source: "custom-execution",
        tipo,
        ...datosPersonalizados,
      },
    });
    
    console.log(`✅ Sincronización de ${tipo} con datos personalizados iniciada:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error al iniciar sincronización de ${tipo} con datos personalizados:`, error);
    throw error;
  }
}

/**
 * Ejemplo 6: Ejecutar sincronización de catálogos básicos
 */
export async function sincronizarCatalogosBasicos() {
  return ejecutarSincronizacionIndividual("CATALOGOS_SYNC");
}

/**
 * Ejemplo 7: Ejecutar sincronización de regiones
 */
export async function sincronizarRegiones() {
  return ejecutarSincronizacionIndividual("REGIONES_SYNC");
}

/**
 * Ejemplo 8: Ejecutar sincronización de grandes beneficiarios
 */
export async function sincronizarGrandesBeneficiarios() {
  return ejecutarSincronizacionIndividual("GRANDES_BENEFICIARIOS_SYNC");
}

/**
 * Ejemplo 9: Ejecutar sincronización de ayudas de estado
 */
export async function sincronizarAyudasDeEstado() {
  return ejecutarSincronizacionIndividual("AYUDAS_ESTADO_SYNC");
}

/**
 * Ejemplo 10: Ejecutar sincronización de partidos políticos
 */
export async function sincronizarPartidosPoliticos() {
  return ejecutarSincronizacionIndividual("PARTIDOS_POLITICOS_SYNC");
}

/**
 * Ejemplo 11: Ejecutar sincronización de concesiones
 */
export async function sincronizarConcesiones() {
  return ejecutarSincronizacionIndividual("CONCESIONES_SYNC");
}

/**
 * Ejemplo 12: Ejecutar sincronización de sanciones
 */
export async function sincronizarSanciones() {
  return ejecutarSincronizacionIndividual("SANCIONES_SYNC");
}

/**
 * Ejemplo 13: Ejecutar sincronización de órganos
 */
export async function sincronizarOrganos() {
  return ejecutarSincronizacionIndividual("ORGANOS_SYNC");
}

/**
 * Ejemplo 14: Ejecutar sincronización de minimis
 */
export async function sincronizarMinimis() {
  return ejecutarSincronizacionIndividual("MINIMIS_SYNC");
}

/**
 * Ejemplo 15: Ejecutar sincronización de planes estratégicos
 */
export async function sincronizarPlanesEstrategicos() {
  return ejecutarSincronizacionIndividual("PLANES_ESTRATEGICOS_SYNC");
}

/**
 * Ejemplo 16: Ejecutar sincronización de datos críticos
 * (catálogos, regiones, órganos)
 */
export async function sincronizarDatosCriticos() {
  const datosCriticos = [
    "CATALOGOS_SYNC",
    "REGIONES_SYNC", 
    "ORGANOS_SYNC"
  ] as Array<keyof typeof INNGEST_CONFIG.EVENTS>;
  
  return ejecutarSincronizacionesParalelas(datosCriticos);
}

/**
 * Ejemplo 17: Ejecutar sincronización de datos de beneficiarios
 * (grandes beneficiarios, ayudas de estado)
 */
export async function sincronizarDatosBeneficiarios() {
  const datosBeneficiarios = [
    "GRANDES_BENEFICIARIOS_SYNC",
    "AYUDAS_ESTADO_SYNC"
  ] as Array<keyof typeof INNGEST_CONFIG.EVENTS>;
  
  return ejecutarSincronizacionesParalelas(datosBeneficiarios);
}

/**
 * Ejemplo 18: Ejecutar sincronización de datos políticos
 * (partidos políticos, concesiones, sanciones)
 */
export async function sincronizarDatosPoliticos() {
  const datosPoliticos = [
    "PARTIDOS_POLITICOS_SYNC",
    "CONCESIONES_SYNC",
    "SANCIONES_SYNC"
  ] as Array<keyof typeof INNGEST_CONFIG.EVENTS>;
  
  return ejecutarSincronizacionesParalelas(datosPoliticos);
}

/**
 * Ejemplo 19: Ejecutar sincronización de datos adicionales
 * (minimis, planes estratégicos)
 */
export async function sincronizarDatosAdicionales() {
  const datosAdicionales = [
    "MINIMIS_SYNC",
    "PLANES_ESTRATEGICOS_SYNC"
  ] as Array<keyof typeof INNGEST_CONFIG.EVENTS>;
  
  return ejecutarSincronizacionesParalelas(datosAdicionales);
}

/**
 * Ejemplo de uso en un controlador o servicio
 */
export class InngestService {
  /**
   * Ejecutar sincronización completa con logging
   */
  static async sincronizacionCompleta() {
    console.log("🚀 Iniciando sincronización completa...");
    
    try {
      const result = await ejecutarSincronizacionCompleta();
      console.log("✅ Sincronización completa iniciada exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error en sincronización completa:", error);
      throw error;
    }
  }

  /**
   * Ejecutar sincronización específica con validación
   */
  static async sincronizacionEspecifica(tipo: string) {
    console.log(`🔄 Iniciando sincronización de: ${tipo}`);
    
    try {
      const result = await ejecutarSincronizacionIndividual(tipo as keyof typeof INNGEST_CONFIG.EVENTS);
      console.log(`✅ Sincronización de ${tipo} iniciada exitosamente`);
      return result;
    } catch (error) {
      console.error(`❌ Error en sincronización de ${tipo}:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar sincronización programada
   */
  static async sincronizacionProgramada(tipo: string, retrasoMinutos: number) {
    console.log(`⏰ Programando sincronización de ${tipo} en ${retrasoMinutos} minutos`);
    
    try {
      const result = await ejecutarSincronizacionConRetraso(tipo as keyof typeof INNGEST_CONFIG.EVENTS, retrasoMinutos);
      console.log(`✅ Sincronización de ${tipo} programada exitosamente`);
      return result;
    } catch (error) {
      console.error(`❌ Error al programar sincronización de ${tipo}:`, error);
      throw error;
    }
  }
} 