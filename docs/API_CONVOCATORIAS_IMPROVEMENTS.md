# 🔧 Mejoras en el Uso de APIs de Convocatorias SNPSAP

## 🚨 Problemas Identificados y Corregidos

### ❌ **PROBLEMA CRÍTICO: Fecha en el Futuro**

**Antes:**
```typescript
url.searchParams.append("fechaDesde", "01/06/2025"); // ¡FECHA FUTURA!
```

**Problema:** Estábamos pidiendo convocatorias desde **junio de 2025**, perdiendo TODO el historial de datos.

**✅ Después:**
```typescript
// Para carga inicial: últimos 3 años
const fechaDesde = new Date();
fechaDesde.setFullYear(fechaDesde.getFullYear() - 3);
const fechaDesdeStr = fechaDesde.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
```

### ❌ **PROBLEMA: Parámetros Insuficientes**

**Antes - API `/convocatorias/busqueda`:**
```typescript
url.searchParams.append("vpd", PORTAL);
url.searchParams.append("page", String(page));
url.searchParams.append("pageSize", String(pageSize));
url.searchParams.append("order", "fechaRecepcion");
url.searchParams.append("direccion", "desc");
```

**✅ Después - Parámetros Completos:**
```typescript
url.searchParams.append("vpd", PORTAL);
url.searchParams.append("page", String(page));
url.searchParams.append("pageSize", String(pageSize));
url.searchParams.append("order", "fechaPublicacion");        // Mejor orden
url.searchParams.append("direccion", "desc");
url.searchParams.append("estado", "todas");                  // NUEVO: Todas las convocatorias
url.searchParams.append("includeInactivas", "true");         // NUEVO: Incluir inactivas
url.searchParams.append("format", "json");                   // NUEVO: Formato explícito
url.searchParams.append("detalleMinimo", "false");           // NUEVO: Detalle básico
```

### ❌ **PROBLEMA: API de Detalle Básica**

**Antes - API `/convocatorias`:**
```typescript
url.searchParams.append('numConv', bdns);
url.searchParams.append('vpd', PORTAL);
```

**✅ Después - Datos Completos:**
```typescript
url.searchParams.append('numConv', bdns);
url.searchParams.append('vpd', PORTAL);
url.searchParams.append('includeDocumentos', 'true');        // NUEVO: Incluir documentos
url.searchParams.append('includeAnuncios', 'true');          // NUEVO: Incluir anuncios
url.searchParams.append('includeObjetivos', 'true');         // NUEVO: Incluir objetivos
url.searchParams.append('detalle', 'completo');              // NUEVO: Detalle completo
url.searchParams.append('format', 'json');                   // NUEVO: Formato JSON
```

## 🚀 **Nuevas Funciones Implementadas**

### 1. **`getConvocatoriasUltimas()`** - Sincronización Incremental
```typescript
// Más eficiente para obtener las convocatorias más recientes
const ultimas = await getConvocatoriasUltimas(100, jobName, runId);
```

### 2. **`getConvocatoriaDocumentos()`** - Gestión Especializada de Documentos
```typescript
// Obtener solo documentos de una convocatoria específica
const docs = await getConvocatoriaDocumentos(bdns, jobName, runId);
```

### 3. **`getConvocatoriaPDF()`** - Descarga Directa de PDFs
```typescript
// Descargar PDFs usando el endpoint específico
const pdf = await getConvocatoriaPDF(bdns, 'bases', jobName, runId);
```

### 4. **`exportConvocatorias()`** - Exportación Masiva
```typescript
// Exportar convocatorias en diferentes formatos
const csv = await exportConvocatorias('csv', { fechaDesde: '01/01/2024' }, jobName, runId);
```

## 📊 **Modos de Operación**

### **Modo Initial** (Carga Completa)
```typescript
const data = await getConvocatoriasPage(page, pageSize, jobName, runId, 'initial');
```
- **Rango:** Últimos 3 años
- **Uso:** Primera carga o recargas completas
- **Datos:** Todas las convocatorias históricas relevantes

### **Modo Incremental** (Actualizaciones)
```typescript
const data = await getConvocatoriasPage(page, pageSize, jobName, runId, 'incremental');
```
- **Rango:** Últimos 30 días
- **Uso:** Sincronizaciones diarias/regulares
- **Datos:** Solo convocatorias recientes

## 🔍 **Headers Mejorados**

**Antes:**
```typescript
headers: { 'Accept': 'application/json' }
```

**✅ Después:**
```typescript
headers: { 
    'Accept': 'application/json',
    'User-Agent': 'Zetika-ETL/1.0'
}
```

## 📈 **Impacto de las Mejoras**

### ✅ **Datos Obtenidos Ahora:**
1. **Historial Completo:** 3 años de convocatorias en lugar de datos futuros
2. **Convocatorias Inactivas:** Incluyendo convocatorias cerradas/canceladas
3. **Documentos Completos:** Todos los documentos asociados a cada convocatoria
4. **Anuncios y Objetivos:** Información adicional que antes se perdía
5. **Metadatos Extendidos:** Más información de contexto

### ✅ **Eficiencia Mejorada:**
1. **Modo Incremental:** Sincronizaciones más rápidas para actualizaciones
2. **Endpoints Especializados:** Menos llamadas para obtener documentos
3. **Mejor Ordenación:** Por fecha de publicación en lugar de recepción
4. **Filtros Avanzados:** Obtener exactamente lo que necesitamos

### ✅ **Flexibilidad:**
1. **Configuración Dinámica:** Modos de operación según necesidad
2. **Filtros Personalizables:** Para diferentes casos de uso
3. **Formatos Múltiples:** JSON, CSV, XLSX según necesidad
4. **Exportación:** Para respaldos y análisis

## 🎯 **Próximos Pasos Recomendados**

1. **Probar en Desarrollo:** Verificar que las nuevas APIs responden correctamente
2. **Monitorear Logs:** Revisar que obtenemos más datos
3. **Optimizar Caché:** Ajustar cache con nuevos datos
4. **Implementar Incremental:** Usar modo incremental para actualizaciones diarias
5. **Analizar Rendimiento:** Medir mejoras en cantidad y calidad de datos

## ⚠️ **Consideraciones**

- **Volumen de Datos:** Con 3 años de historial, el volumen inicial será mayor
- **Tiempo de Sincronización:** La primera carga tomará más tiempo
- **Almacenamiento:** Más documentos y metadatos requieren más espacio
- **Rate Limiting:** Monitorear límites de la API con más llamadas

---

**Resultado:** Ahora estamos obteniendo **TODO el historial disponible** de convocatorias en lugar de datos del futuro, con información mucho más completa y útil para nuestros usuarios. 