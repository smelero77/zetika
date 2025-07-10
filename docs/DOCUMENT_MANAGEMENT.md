# Gestión de Documentos PDF con Inngest

Este documento explica cómo funciona el sistema mejorado de descarga y almacenamiento de documentos PDF en Zetika.

## 🚀 Flujo de Procesamiento

### 1. **Procesamiento de Convocatorias**
```
createConvocatoriaJobs → processConvocatoriaBatch → processDocumentStorage
```

1. **`createConvocatoriaJobs`**: Descubre convocatorias nuevas/modificadas
2. **`processConvocatoriaBatch`**: Procesa metadata de convocatorias y crea registros de documentos
3. **`processDocumentStorage`**: Descarga y almacena PDFs de forma asíncrona

### 2. **Logs Informativos**

El sistema ahora proporciona logs claros sobre:

- ✅ **Documentos encontrados por convocatoria**
- 📥 **Progreso de descarga** (tamaño, tiempo, verificaciones)
- 📊 **Estadísticas globales** de documentos
- ⚠️ **Documentos que fallan** o están pendientes

## 🔧 Monitoreo y Gestión

### Endpoint de Estado: `/api/debug/document-status`

#### **GET** - Consultar estadísticas

```bash
# Estadísticas generales
GET /api/debug/document-status

# Con documentos pendientes
GET /api/debug/document-status?pending=true&limit=20

# Para una convocatoria específica
GET /api/debug/document-status?bdns=123456&pending=true
```

**Respuesta:**
```json
{
  "estadisticas": {
    "total": 1500,
    "conStorage": 1450,
    "sinStorage": 50,
    "porcentajeCompletado": 97
  },
  "resumen": {
    "estadoGeneral": "Excelente"
  },
  "documentosPendientes": [
    {
      "docId": 789,
      "nombreArchivo": "bases_reguladoras.pdf",
      "tamañoFormateado": "2.5 MB",
      "convocatoria": {
        "bdns": "123456",
        "titulo": "Ayudas para empresas..."
      },
      "urlDescarga": "https://www.infosubvenciones.es/..."
    }
  ]
}
```

#### **POST** - Acciones

```bash
# Reintentar documentos pendientes
POST /api/debug/document-status
{
  "action": "retry-pending",
  "limit": 100,
  "bdns": "123456" // opcional
}

# Solo obtener estadísticas
POST /api/debug/document-status
{
  "action": "get-stats-only"
}
```

## 🔄 Reintento de Documentos Fallidos

### Función Inngest: `retryPendingDocuments`

**Evento:** `app/documents.retry.pending`

**Uso:**
```javascript
// Enviar evento para reintentar todos los documentos pendientes
await inngest.send({
  name: "app/documents.retry.pending",
  data: {
    limit: 100,          // Máximo documentos a procesar
    bdns: "123456"       // Opcional: solo una convocatoria
  }
});
```

**Características:**
- ✅ Procesa documentos en **lotes de 50**
- ✅ **Evita duplicados** (verifica si ya existe en storage)
- ✅ **Logs detallados** del progreso
- ✅ **Filtrado por convocatoria** opcional

## 📊 Mejoras en el Almacenamiento

### Características del Sistema Mejorado

1. **Timeout de 30 segundos** para documentos pesados
2. **Verificación de tamaño** vs. metadata esperada
3. **Logs detallados** con timings de descarga/subida
4. **Manejo robusto de errores** con contexto completo
5. **Evita descargas duplicadas** automáticamente

### Logs de Ejemplo

```
📥 Iniciando descarga de documento { bdns: "123456", docId: 789, nombreArchivo: "bases.pdf", tamanoBytes: 2621440 }
📦 Documento descargado exitosamente { tiempoDescarga: 1500, tamanoDescargado: 2621440 }
☁️ Documento almacenado exitosamente { tiempoTotal: 2100, tiempoSubida: 600 }
```

## 🎯 Estados de Documentos

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | `storagePath` o `storageUrl` es `null` |
| **Almacenado** | Ambos campos poblados correctamente |
| **Error** | Falla en descarga/subida (ver logs) |

## 🛠️ Comandos Útiles

```bash
# Ver estadísticas rápidas
curl "http://localhost:3000/api/debug/document-status"

# Ver documentos pendientes
curl "http://localhost:3000/api/debug/document-status?pending=true&limit=10"

# Reintentar documentos fallidos
curl -X POST "http://localhost:3000/api/debug/document-status" \
  -H "Content-Type: application/json" \
  -d '{"action": "retry-pending", "limit": 50}'

# Monitorear una convocatoria específica
curl "http://localhost:3000/api/debug/document-status?bdns=123456&pending=true"
```

## 🚨 Troubleshooting

### Documentos que No Se Descargan

1. **Verificar URL externa**: Algunos documentos pueden no existir en la fuente
2. **Revisar logs de Inngest**: Buscar errores HTTP específicos
3. **Usar endpoint de reintento**: Para procesar documentos fallidos
4. **Verificar límites de Supabase**: Storage puede tener límites de tamaño

### Performance

- **Concurrencia**: 5 documentos en paralelo por defecto
- **Reintentos**: 4 intentos automáticos por documento
- **Timeout**: 30 segundos por descarga
- **Lotes**: 50 documentos por lote en reintentos

## 📈 Métricas Recomendadas

- **Porcentaje completado > 95%**: Excelente
- **Porcentaje completado 85-95%**: Bueno
- **Porcentaje completado < 85%**: Necesita atención

Usar el endpoint `/api/debug/document-status` regularmente para monitorear la salud del sistema. 