import { Inngest } from "inngest";

// Crea un cliente de Inngest, que se usará para definir y enviar eventos.
// Configurado con logging reducido para evitar ruido en los logs del servidor
export const inngest = new Inngest({ 
  id: "zetika",
  // Configurar logging para reducir el ruido interno de Inngest
  // Niveles disponibles: 'debug', 'info', 'warn', 'error'
  // En producción, solo mostrar errores para evitar ruido
  logLevel: process.env.INNGEST_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'warn')
}); 