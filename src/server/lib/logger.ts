import { BETTERSTACK_INGEST_URL } from '~/server/lib/constants';

/**
 * Función base y privada para enviar cualquier tipo de log a Better Stack.
 * @param logData - Un objeto JSON con los datos del log.
 */
async function sendLog(logData: object) {
  // Si la variable de entorno con el token no está configurada,
  // mostramos el log en la consola local y no intentamos enviarlo.
  // Esto es útil para el desarrollo local sin necesidad de configurar el token.
  if (!process.env.BETTERSTACK_SOURCE_TOKEN) {
    console.log("LOG (modo desarrollo):", JSON.stringify(logData, null, 2));
    return;
  }

  try {
    // Realizamos la petición a la API de Better Stack.
    // No usamos 'await' en el fetch para no bloquear la ejecución de nuestra aplicación.
    // Es una operación de "disparar y olvidar" (fire and forget).
    fetch(BETTERSTACK_INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BETTERSTACK_SOURCE_TOKEN}`,
      },
      // Convertimos nuestro objeto de log a un string JSON.
      // Añadimos la fecha actual en formato estándar ISO 8601,
      // que Better Stack reconocerá automáticamente como el timestamp del evento.
      body: JSON.stringify({
        ...logData,
        dt: new Date().toISOString(),
      }),
    }).then(response => {
      // Verificamos que recibimos la respuesta 202 esperada
      if (response.status !== 202) {
        console.warn(`Better Stack respondió con status ${response.status} en lugar de 202`);
      }
    });
  } catch (e) {
    // Si por alguna razón el envío del log falla (ej: problema de red),
    // lo capturamos y lo mostramos en la consola del servidor para no detener la aplicación.
    console.error('Error al enviar log a Better Stack:', e);
  }
}

/**
 * Función base para logs de batch que solo muestra en consola cada N registros
 * @param logData - Un objeto JSON con los datos del log.
 * @param showInConsole - Si debe mostrarse en consola (por defecto false para batch)
 */
async function sendBatchLog(logData: object, showInConsole: boolean = false) {
  // Si no hay token de Better Stack, mostrar en consola solo si se especifica
  if (!process.env.BETTERSTACK_SOURCE_TOKEN) {
    if (showInConsole) {
      console.log("BATCH LOG (modo desarrollo):", JSON.stringify(logData, null, 2));
    }
    return;
  }
  
  // Si hay token, solo mostrar en consola si se especifica explícitamente
  if (showInConsole) {
    console.log("BATCH LOG:", JSON.stringify(logData, null, 2));
  }

  try {
    fetch(BETTERSTACK_INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BETTERSTACK_SOURCE_TOKEN}`,
      },
      body: JSON.stringify({
        ...logData,
        dt: new Date().toISOString(),
      }),
    }).then(response => {
      if (response.status !== 202) {
        console.warn(`Better Stack respondió con status ${response.status} en lugar de 202`);
      }
    });
  } catch (e) {
    console.error('Error al enviar log a Better Stack:', e);
  }
}

/**
 * Logger específico para procesos batch con control de frecuencia de logs
 */
export const batchLogger = {
  /**
   * Contador para controlar la frecuencia de logs
   */
  _counters: new Map<string, number>(),

  /**
   * Obtiene el contador para un job específico
   */
  _getCounter(jobName: string): number {
    return this._counters.get(jobName) || 0;
  },

  /**
   * Incrementa el contador para un job específico
   */
  _incrementCounter(jobName: string): number {
    const current = this._getCounter(jobName);
    const next = current + 1;
    this._counters.set(jobName, next);
    return next;
  },

  /**
   * Resetea el contador para un job específico
   */
  _resetCounter(jobName: string): void {
    this._counters.set(jobName, 0);
  },

  /**
   * Para registrar progreso en procesos batch. Solo muestra en consola cada N registros.
   * @param jobName - Nombre del job para controlar contadores
   * @param message - El mensaje del log
   * @param metadata - Metadatos adicionales
   * @param logEvery - Cada cuántos registros mostrar en consola (por defecto 100)
   */
  progress: (jobName: string, message: string, metadata: object = {}, logEvery: number = 100) => {
    const counter = batchLogger._incrementCounter(jobName);
    const showInConsole = counter % logEvery === 0;
    
    sendBatchLog({ 
      level: 'info', 
      message, 
      jobName,
      counter,
      ...metadata 
    }, showInConsole);
  },

  /**
   * Para registrar el inicio de un job batch
   * @param jobName - Nombre del job
   * @param metadata - Metadatos adicionales
   */
  start: (jobName: string, metadata: object = {}) => {
    batchLogger._resetCounter(jobName);
    sendBatchLog({ 
      level: 'info', 
      message: `Iniciando job: ${jobName}`,
      jobName,
      ...metadata 
    }, true); // Siempre mostrar inicio en consola
  },

  /**
   * Para registrar la finalización de un job batch
   * @param jobName - Nombre del job
   * @param metadata - Metadatos adicionales
   */
  complete: (jobName: string, metadata: object = {}) => {
    const totalProcessed = batchLogger._getCounter(jobName);
    sendBatchLog({ 
      level: 'info', 
      message: `Job completado: ${jobName}`,
      jobName,
      totalProcessed,
      ...metadata 
    }, true); // Siempre mostrar finalización en consola
  },

  /**
   * Para registrar errores en procesos batch
   * @param jobName - Nombre del job
   * @param message - Mensaje del error
   * @param error - Objeto Error
   * @param metadata - Metadatos adicionales
   */
  error: (jobName: string, message: string, error: Error, metadata: object = {}) => {
    sendBatchLog({
      level: 'error',
      message,
      jobName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...metadata,
    }, true); // Siempre mostrar errores en consola
  },

  /**
   * Para registrar advertencias en procesos batch
   * @param jobName - Nombre del job
   * @param message - Mensaje de advertencia
   * @param metadata - Metadatos adicionales
   */
  warn: (jobName: string, message: string, metadata: object = {}) => {
    sendBatchLog({ 
      level: 'warn', 
      message, 
      jobName,
      ...metadata 
    }, true); // Siempre mostrar advertencias en consola
  },
};

/**
 * Objeto 'logger' exportado para ser utilizado en toda la aplicación.
 * Proporciona métodos específicos para cada tipo de log, asegurando una estructura consistente.
 */
export const logger = {
  /**
   * Para registrar eventos informativos de progreso o éxito.
   * @param message - El mensaje principal del log.
   * @param metadata - Un objeto con cualquier dato estructurado adicional.
   */
  info: (message: string, metadata: object = {}) => {
    sendLog({ level: 'info', message, ...metadata });
  },

  /**
   * Para registrar advertencias o situaciones inesperadas que no son errores críticos.
   * @param message - El mensaje de la advertencia.
   * @param metadata - Datos adicionales.
   */
  warn: (message: string, metadata: object = {}) => {
    sendLog({ level: 'warn', message, ...metadata });
  },

  /**
   * Para registrar errores.
   * @param message - Un mensaje descriptivo del error.
   * @param error - El objeto Error capturado en un bloque catch.
   * @param metadata - Contexto adicional sobre dónde y por qué ocurrió el error.
   */
  error: (message: string, error: Error, metadata: object = {}) => {
    sendLog({
      level: 'error',
      message,
      // Adjuntamos un objeto estructurado con los detalles del error.
      // Esto es muy potente para depurar en Better Stack.
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...metadata,
    });
  },

  /**
   * Para registrar eventos de negocio específicos (ej: un usuario se registra).
   * @param eventName - El nombre del evento (ej: 'user_signup').
   * @param metadata - Datos asociados al evento (ej: { userId: '123' }).
   */
  event: (eventName: string, metadata: object = {}) => {
    sendLog({ level: 'info', event: eventName, ...metadata });
  },
}; 