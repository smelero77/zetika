# Configuración de Inngest en Producción

## Variables de Entorno Requeridas

Para que Inngest funcione correctamente en producción y puedas ver las funciones en el dashboard, necesitas configurar las siguientes variables de entorno:

### Variables Obligatorias

```bash
# Clave para enviar eventos a Inngest
INNGEST_EVENT_KEY=your_event_key_here

# Clave para verificar eventos de Inngest
INNGEST_SIGNING_KEY=your_signing_key_here

# URL base de tu aplicación
NEXTAUTH_URL=https://tu-dominio.com

# Secret para autenticación de endpoints batch
CRON_SECRET=kE7zP9sXv2bN5mR8jF4gH1aC0nQ3wE6y
```

### Variables Opcionales

```bash
# Host donde se sirve tu aplicación (por defecto se detecta automáticamente)
INNGEST_SERVE_HOST=https://tu-dominio.com

# Nivel de logging (error, warn, info, debug)
INNGEST_LOG_LEVEL=error
```

## Cómo Obtener las Claves de Inngest

1. Ve a [Inngest Dashboard](https://cloud.inngest.com)
2. Crea una nueva aplicación o selecciona una existente
3. Ve a la sección "Settings" o "API Keys"
4. Copia las claves `Event Key` y `Signing Key`

## Verificación de Configuración

Puedes verificar que tu configuración esté correcta usando el endpoint de validación:

```bash
curl https://tu-dominio.com/api/validate-inngest
```

## Funciones Disponibles

Una vez configurado correctamente, podrás ver estas funciones en el dashboard de Inngest:

### Funciones de Sincronización
- `sync-catalogos-basicos` - Sincronizar catálogos básicos
- `sync-regiones` - Sincronizar regiones
- `sync-grandes-beneficiarios` - Sincronizar grandes beneficiarios
- `sync-ayudas-estado` - Sincronizar ayudas de estado
- `sync-partidos-politicos` - Sincronizar partidos políticos
- `sync-concesiones` - Sincronizar concesiones
- `sync-sanciones` - Sincronizar sanciones
- `sync-organos` - Sincronizar órganos
- `sync-minimis` - Sincronizar minimis
- `sync-planes-estrategicos` - Sincronizar planes estratégicos
- `sync-all` - Sincronización completa de todos los datos

### Funciones de Convocatorias
- `create-convocatoria-jobs` - Crear lotes de jobs de convocatorias
- `process-convocatoria-batch` - Procesar lote de convocatorias
- `process-document-storage` - Almacenar documentos PDF

## Endpoint de Inngest

Tu aplicación expone las funciones de Inngest en:

```
https://tu-dominio.com/api/inngest
```

## Comandos Útiles

### Desarrollo Local
```bash
# Iniciar servidor de desarrollo de Inngest
npx inngest dev -u http://localhost:3000/api/inngest
```

### Producción
```bash
# Verificar estado de las funciones
curl https://tu-dominio.com/api/inngest

# Enviar evento de sincronización completa
curl -X POST https://tu-dominio.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "app/sync.all.requested"}'
```

## Troubleshooting

### Las funciones no aparecen en el dashboard
1. Verifica que `INNGEST_EVENT_KEY` y `INNGEST_SIGNING_KEY` estén configuradas
2. Asegúrate de que tu aplicación esté accesible desde internet
3. Verifica que el endpoint `/api/inngest` responda correctamente

### Errores de autenticación
1. Verifica que `CRON_SECRET` esté configurado correctamente
2. Asegúrate de que `NEXTAUTH_URL` apunte a tu dominio de producción

### Funciones no se ejecutan
1. Verifica los logs de tu aplicación
2. Comprueba que las variables de entorno de base de datos estén configuradas
3. Verifica que los endpoints batch funcionen correctamente 