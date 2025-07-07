# Configuración de Inngest para Procesos Batch

Este documento explica cómo configurar y usar Inngest para gestionar todos los procesos batch de Zetika.

## 📋 Resumen

Inngest está configurado para manejar **15 funciones** que cubren todos los procesos batch del proyecto:

### Funciones de Sincronización Individual
1. **syncCatalogosBasicos** - Sincroniza catálogos básicos
2. **syncRegiones** - Sincroniza regiones
3. **syncGrandesBeneficiarios** - Sincroniza grandes beneficiarios
4. **syncAyudasDeEstado** - Sincroniza ayudas de estado
5. **syncPartidosPoliticos** - Sincroniza partidos políticos
6. **syncConcesiones** - Sincroniza concesiones
7. **syncSanciones** - Sincroniza sanciones
8. **syncOrganos** - Sincroniza órganos
9. **syncMasters** - Sincroniza masters
10. **syncMinimis** - Sincroniza minimis
11. **syncPlanesEstrategicos** - Sincroniza planes estratégicos

### Funciones de Procesamiento
12. **createConvocatoriaJobs** - Crea lotes de jobs de convocatorias
13. **processConvocatoriaBatch** - Procesa lotes de convocatorias
14. **processDocumentStorage** - Almacena documentos PDF

### Función de Sincronización Completa
15. **syncAll** - Ejecuta todos los procesos en orden

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener estas variables configuradas en tu `.env.local`:

```bash
# URL base de la aplicación
NEXTAUTH_URL=http://localhost:3000

# Secret para autenticación de endpoints batch
CRON_SECRET=tu-secret-seguro-aqui

# Nivel de logging de Inngest (opcional)
INNGEST_LOG_LEVEL=warn
```

### 2. Instalación de Dependencias

Inngest ya está incluido en `package.json`. Si necesitas reinstalar:

```bash
npm install inngest
```

## 🔧 Uso de Inngest

### Endpoint de Inngest

El endpoint de Inngest está disponible en:
```
/api/inngest
```

### Endpoint de Pruebas

Para probar las funciones, usa:
```
/api/test-inngest
```

### Comandos de Prueba

#### Probar una función individual:
```bash
curl -X POST http://localhost:3000/api/test-inngest \
  -H "Content-Type: application/json" \
  -d '{"action": "test-single"}'
```

#### Probar sincronización completa:
```bash
curl -X POST http://localhost:3000/api/test-inngest \
  -H "Content-Type: application/json" \
  -d '{"action": "test-all"}'
```

#### Probar todas las funciones individuales:
```bash
curl -X POST http://localhost:3000/api/test-inngest \
  -H "Content-Type: application/json" \
  -d '{"action": "test-individual"}'
```

## 📊 Monitoreo y Logs

### Dashboard de Inngest

En desarrollo, puedes acceder al dashboard de Inngest en:
```
http://localhost:8288
```

### Logs

Los logs de Inngest se muestran en la consola del servidor. En producción, solo se muestran errores para evitar ruido.

### Métricas

Cada función incluye:
- Logs detallados con emojis para fácil identificación
- Manejo de errores con reintentos automáticos
- Métricas de tiempo de ejecución

## 🔄 Eventos Disponibles

### Eventos de Sincronización Individual
- `app/catalogos.sync.requested`
- `app/regiones.sync.requested`
- `app/grandes-beneficiarios.sync.requested`
- `app/ayudas-estado.sync.requested`
- `app/partidos-politicos.sync.requested`
- `app/concesiones.sync.requested`
- `app/sanciones.sync.requested`
- `app/organos.sync.requested`
- `app/masters.sync.requested`
- `app/minimis.sync.requested`
- `app/planes-estrategicos.sync.requested`

### Eventos de Procesamiento
- `app/convocatorias.sync.requested`
- `app/convocatoria.process.batch`
- `app/document.process.storage`

### Eventos de Sincronización Completa
- `app/sync.all.requested`

## ⚙️ Configuración Avanzada

### Concurrencia

Las funciones están configuradas con diferentes niveles de concurrencia:

- **Document Storage**: 5 concurrentes (operaciones I/O)
- **Convocatoria Batch**: 2 concurrentes (evitar sobrecarga)
- **Data Sync**: 3 concurrentes (operaciones moderadas)

### Reintentos

- **Funciones críticas**: 4 reintentos
- **Funciones normales**: 3 reintentos
- **Funciones simples**: 2 reintentos

### Orden de Ejecución

La sincronización completa sigue este orden:
1. Catálogos básicos
2. Regiones
3. Órganos
4. Grandes beneficiarios
5. Ayudas de estado
6. Partidos políticos
7. Concesiones
8. Sanciones
9. Masters
10. Minimis
11. Planes estratégicos

## 🛠️ Desarrollo

### Agregar una Nueva Función

1. Crea la función en `src/inngest/functions.ts`
2. Exporta la función en `src/inngest/index.ts`
3. Agrega la función al array en `src/app/api/inngest/route.ts`
4. Actualiza la configuración en `src/lib/inngest-config.ts`

### Ejemplo de Nueva Función

```typescript
export const syncNuevoDato = inngest.createFunction(
  {
    id: "sync-nuevo-dato",
    name: "Sincronizar Nuevo Dato",
    retries: 3,
  },
  { event: "app/nuevo-dato.sync.requested" },
  async ({ step, logger, event }) => {
    logger.info("🔄 Iniciando sincronización de nuevo dato...");

    try {
      const response = await step.run("call-nuevo-dato-api", async () => {
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/batch/sync-nuevo-dato`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      });

      logger.info("✅ Sincronización de nuevo dato completada", response);
      return response;
    } catch (error) {
      logger.error("❌ Error en sincronización de nuevo dato", error);
      throw error;
    }
  }
);
```

## 🚨 Troubleshooting

### Error: "CRON_SECRET no está configurado"

Solución: Agrega `CRON_SECRET=tu-secret-aqui` a tu `.env.local`

### Error: "HTTP 401: Unauthorized"

Solución: Verifica que el `CRON_SECRET` coincida entre Inngest y los endpoints batch

### Error: "HTTP 404: Not Found"

Solución: Verifica que el endpoint batch exista y esté correctamente implementado

### Funciones no se ejecutan

Solución: 
1. Verifica que el servidor esté corriendo
2. Verifica que el endpoint `/api/inngest` esté accesible
3. Revisa los logs del servidor para errores

## 📝 Notas Importantes

1. **Logging Reducido**: En producción, solo se muestran errores para evitar ruido en los logs
2. **Autenticación**: Todos los endpoints batch requieren el `CRON_SECRET` para autenticación
3. **Reintentos Automáticos**: Las funciones tienen reintentos automáticos configurados
4. **Concurrencia Controlada**: Cada función tiene límites de concurrencia para evitar sobrecarga
5. **Orden de Dependencias**: La sincronización completa respeta las dependencias entre datos

## 🔗 Enlaces Útiles

- [Documentación oficial de Inngest](https://www.inngest.com/docs)
- [Dashboard de Inngest](http://localhost:8288) (desarrollo)
- [Endpoint de pruebas](/api/test-inngest)
- [Configuración de Inngest](/src/lib/inngest-config.ts) 