# Refactorización de Filtros del Buscador

## Problema Original

El archivo `buscador-filters.tsx` original tenía **977 líneas** y **45KB**, lo que lo hacía:
- Difícil de mantener
- Propenso a errores
- Lento para renderizar
- Complicado para trabajar en equipo

## Solución Implementada

### Estructura de Archivos

```
filters/
├── README.md                           # Esta documentación
├── index.ts                            # Exportaciones centralizadas
├── buscador-filters-refactored.tsx     # Componente principal (nuevo)
├── data/
│   └── filter-options.ts               # Datos hardcodeados extraídos
├── hooks/
│   └── use-filter-actions.ts           # Lógica de filtros reutilizable
└── components/
    ├── filter-collapsible.tsx          # Componente reutilizable
    ├── checkbox-filter.tsx             # Filtro de checkboxes
    ├── range-filter.tsx                # Filtro de rangos
    ├── empresa-filters.tsx             # Filtros específicos empresas
    └── particular-filters.tsx          # Filtros específicos particulares
```

### Beneficios de la Refactorización

1. **Separación de Responsabilidades**
   - Datos separados de la lógica
   - Componentes específicos por tipo de usuario
   - Hooks reutilizables

2. **Mantenibilidad**
   - Archivos más pequeños y enfocados
   - Fácil localización de cambios
   - Menos conflictos en merge

3. **Reutilización**
   - Componentes genéricos (`FilterCollapsible`, `CheckboxFilter`, etc.)
   - Hook personalizado para acciones de filtros
   - Datos centralizados

4. **Rendimiento**
   - Componentes más pequeños = re-renderizados más eficientes
   - Lógica optimizada en hooks

5. **Escalabilidad**
   - Fácil agregar nuevos tipos de filtros
   - Estructura preparada para datos dinámicos de BD

## Migración a Datos Dinámicos

### Preparación para Base de Datos

Los datos actualmente están en `filter-options.ts`, pero están preparados para migrar a la BD:

```typescript
// Actual (hardcodeado)
export const SECTORES_ECONOMICOS = [
  "Agricultura, ganadería, silvicultura y pesca",
  // ...
]

// Futuro (desde BD)
export const useSectoresEconomicos = () => {
  // Query a la BD usando Prisma
  return prisma.sectorEmpresa.findMany({
    select: { nombre: true }
  })
}
```

### Modelos de BD Relevantes

Según el esquema Prisma, estos modelos pueden alimentar los filtros:

- `SectorEmpresa` → `SECTORES_ECONOMICOS`
- `TamanoEmpresa` → `TAMANOS_EMPRESA`
- `Region` → `COMUNIDADES_AUTONOMAS`
- `InstrumentoAyuda` → `INSTRUMENTOS_AYUDA`
- `Fondo` → `ORIGENES_FONDOS`
- `Finalidad` → `FINALIDADES_AYUDA_*`

## Uso

```typescript
// Importar el componente refactorizado
import { BuscadorFiltersRefactored } from "./filters"

// O importar componentes específicos
import { EmpresaFilters, ParticularFilters } from "./filters"

// O usar componentes reutilizables
import { FilterCollapsible, CheckboxFilter } from "./filters"
```

## Próximos Pasos

1. **Migrar datos a BD**: Crear endpoints para obtener opciones dinámicamente
2. **Caching**: Implementar cache para opciones de filtros
3. **Validación**: Agregar validación de filtros
4. **Tests**: Escribir tests unitarios para cada componente
5. **Optimización**: Implementar virtualización para listas largas

## Migración del Archivo Original

Para migrar del archivo original:

1. Reemplazar importaciones:
   ```typescript
   // Antes
   import { BuscadorFilters } from "./buscador-filters"
   
   // Después
   import { BuscadorFiltersRefactored as BuscadorFilters } from "./filters"
   ```

2. Verificar que la funcionalidad sea idéntica
3. Eliminar el archivo original una vez confirmado 