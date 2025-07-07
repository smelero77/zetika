"use client"

import { useState } from "react"
import { Calendar, MapPin, Building, Euro, FileText, Users, Award, Target } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { FilterCollapsible } from "./filter-collapsible"
import { CheckboxFilter } from "./checkbox-filter"
import { RangeFilter } from "./range-filter"
import { useFilterActions } from "../hooks/use-filter-actions"
import { 
  SECTORES_ECONOMICOS, 
  TAMANOS_EMPRESA, 
  FORMAS_JURIDICAS, 
  ANTIGUEDAD_EMPRESA,
  COMUNIDADES_AUTONOMAS,
  INSTRUMENTOS_AYUDA,
  ORIGENES_FONDOS,
  FINALIDADES_AYUDA_EMPRESA
} from "../data/filter-options"
import type { BuscadorFiltersEmpresa } from "@/types"

interface EmpresaFiltersProps {
  filters: BuscadorFiltersEmpresa
}

export function EmpresaFilters({ filters }: EmpresaFiltersProps) {
  const { updateFilter, toggleArrayFilter, updateRangeFilter } = useFilterActions()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  
  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Estado de Convocatorias */}
      <div className="flex items-center gap-2 px-3 lg:px-4 pb-3 lg:pb-4">
        <Switch 
          id="solo-abiertas" 
          checked={filters.soloAbiertas}
          onCheckedChange={(checked) => updateFilter('soloAbiertas', checked)}
        />
        <span className={`text-xs lg:text-sm font-light ${filters.soloAbiertas ? 'font-bold' : ''}`}>
          Convocatorias abiertas
        </span>
      </div>

      {/* Sector Económico */}
      <FilterCollapsible
        isOpen={openSections.sectorEconomico || false}
        onToggle={() => toggleSection('sectorEconomico')}
        icon={<Building className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Sector Económico"
      >
        <CheckboxFilter
          options={SECTORES_ECONOMICOS}
          selectedValues={filters.sectorEconomico || []}
          onToggle={(value) => toggleArrayFilter('sectorEconomico', value)}
        />
      </FilterCollapsible>

      {/* Tamaño de Empresa */}
      <FilterCollapsible
        isOpen={openSections.tamanoEmpresa || false}
        onToggle={() => toggleSection('tamanoEmpresa')}
        icon={<Building className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Tamaño de Empresa"
      >
        <CheckboxFilter
          options={TAMANOS_EMPRESA}
          selectedValues={filters.tamanoEmpresa || []}
          onToggle={(value) => toggleArrayFilter('tamanoEmpresa', value)}
        />
      </FilterCollapsible>

      {/* Forma Jurídica */}
      <FilterCollapsible
        isOpen={openSections.formaJuridica || false}
        onToggle={() => toggleSection('formaJuridica')}
        icon={<FileText className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Forma Jurídica"
      >
        <CheckboxFilter
          options={FORMAS_JURIDICAS}
          selectedValues={filters.formaJuridica || []}
          onToggle={(value) => toggleArrayFilter('formaJuridica', value)}
        />
      </FilterCollapsible>

      {/* Antigüedad de la Empresa */}
      <FilterCollapsible
        isOpen={openSections.antiguedadEmpresa || false}
        onToggle={() => toggleSection('antiguedadEmpresa')}
        icon={<Calendar className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Antigüedad"
      >
        <CheckboxFilter
          options={ANTIGUEDAD_EMPRESA}
          selectedValues={filters.antiguedadEmpresa || []}
          onToggle={(value) => toggleArrayFilter('antiguedadEmpresa', value)}
        />
      </FilterCollapsible>

      {/* Facturación Anual */}
      <FilterCollapsible
        isOpen={openSections.facturacionAnual || false}
        onToggle={() => toggleSection('facturacionAnual')}
        icon={<Euro className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Facturación Anual"
      >
        <RangeFilter
          minValue={0}
          maxValue={5000000}
          currentMin={filters.facturacionAnual?.min || 0}
          currentMax={filters.facturacionAnual?.max || 5000000}
          onMinChange={(value) => updateRangeFilter('facturacionAnual', 'min', value)}
          onMaxChange={(value) => updateRangeFilter('facturacionAnual', 'max', value)}
          step={50000}
          formatValue={(value) => `€${value.toLocaleString()}`}
        />
      </FilterCollapsible>

      {/* Número de Empleados */}
      <FilterCollapsible
        isOpen={openSections.numeroEmpleados || false}
        onToggle={() => toggleSection('numeroEmpleados')}
        icon={<Users className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Número de Empleados"
      >
        <RangeFilter
          minValue={0}
          maxValue={1000}
          currentMin={filters.numeroEmpleados?.min ?? 0}
          currentMax={filters.numeroEmpleados?.max ?? 1000}
          onMinChange={(value) => updateRangeFilter('numeroEmpleados', 'min', value)}
          onMaxChange={(value) => updateRangeFilter('numeroEmpleados', 'max', value)}
          step={10}
        />
      </FilterCollapsible>

      {/* Comunidad Autónoma */}
      <FilterCollapsible
        isOpen={openSections.comunidadAutonoma || false}
        onToggle={() => toggleSection('comunidadAutonoma')}
        icon={<MapPin className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Comunidad Autónoma"
      >
        <CheckboxFilter
          options={COMUNIDADES_AUTONOMAS}
          selectedValues={filters.comunidadAutonoma || []}
          onToggle={(value) => toggleArrayFilter('comunidadAutonoma', value)}
        />
      </FilterCollapsible>

      {/* Fecha de Publicación */}
      <FilterCollapsible
        isOpen={openSections.fechaPublicacion || false}
        onToggle={() => toggleSection('fechaPublicacion')}
        icon={<Calendar className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Fecha de Publicación"
      >
        <div className="space-y-3 lg:space-y-4">
          <div className="space-y-1 lg:space-y-2">
            <Label className="text-xs lg:text-sm font-light">Desde</Label>
            <Input
              type="date"
              value={filters.fechaPublicacionDesde?.toString() || ''}
              onChange={(e) => updateFilter('fechaPublicacionDesde', e.target.value)}
              className="text-xs lg:text-sm"
            />
          </div>
          <div className="space-y-1 lg:space-y-2">
            <Label className="text-xs lg:text-sm font-light">Hasta</Label>
            <Input
              type="date"
              value={filters.fechaPublicacionHasta?.toString() || ''}
              onChange={(e) => updateFilter('fechaPublicacionHasta', e.target.value)}
              className="text-xs lg:text-sm"
            />
          </div>
        </div>
      </FilterCollapsible>

      {/* Instrumentos de Ayuda */}
      <FilterCollapsible
        isOpen={openSections.instrumentosAyuda || false}
        onToggle={() => toggleSection('instrumentosAyuda')}
        icon={<Award className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Instrumentos de Ayuda"
      >
        <CheckboxFilter
          options={INSTRUMENTOS_AYUDA}
          selectedValues={filters.instrumentosAyuda || []}
          onToggle={(value) => toggleArrayFilter('instrumentosAyuda', value)}
        />
      </FilterCollapsible>

      {/* Origen de Fondos */}
      <FilterCollapsible
        isOpen={openSections.origenFondos || false}
        onToggle={() => toggleSection('origenFondos')}
        icon={<Euro className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Origen de Fondos"
      >
        <CheckboxFilter
          options={ORIGENES_FONDOS}
          selectedValues={filters.origenFondos || []}
          onToggle={(value) => toggleArrayFilter('origenFondos', value)}
        />
      </FilterCollapsible>

      {/* Finalidad de la Ayuda */}
      <FilterCollapsible
        isOpen={openSections.finalidadAyuda || false}
        onToggle={() => toggleSection('finalidadAyuda')}
        icon={<Target className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Finalidad de la Ayuda"
      >
        <CheckboxFilter
          options={FINALIDADES_AYUDA_EMPRESA}
          selectedValues={filters.finalidadAyuda || []}
          onToggle={(value) => toggleArrayFilter('finalidadAyuda', value)}
        />
      </FilterCollapsible>
    </div>
  )
} 