"use client"

import { useState } from "react"
import { Calendar, MapPin, Euro, Award, Target, Briefcase, GraduationCap, Heart, Users } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { FilterCollapsible } from "./filter-collapsible"
import { CheckboxFilter } from "./checkbox-filter"
import { RangeFilter } from "./range-filter"
import { useFilterActions } from "../hooks/use-filter-actions"
import { 
  SITUACIONES_LABORALES,
  NIVELES_ESTUDIOS,
  GRUPOS_EDAD,
  SITUACIONES_FAMILIARES,
  COMUNIDADES_AUTONOMAS,
  INSTRUMENTOS_AYUDA,
  ORIGENES_FONDOS,
  FINALIDADES_AYUDA_PARTICULAR
} from "../data/filter-options"
import type { BuscadorFiltersParticular } from "@/types"

interface ParticularFiltersProps {
  filters: BuscadorFiltersParticular
}

export function ParticularFilters({ filters }: ParticularFiltersProps) {
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
          id="solo-abiertas-particular" 
          checked={filters.soloAbiertas}
          onCheckedChange={(checked) => updateFilter('soloAbiertas', checked)}
        />
        <span className={`text-xs lg:text-sm font-light ${filters.soloAbiertas ? 'font-bold' : ''}`}>
          Convocatorias abiertas
        </span>
      </div>

      {/* Situación Laboral */}
      <FilterCollapsible
        isOpen={openSections.situacionLaboral || false}
        onToggle={() => toggleSection('situacionLaboral')}
        icon={<Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Situación Laboral"
      >
        <CheckboxFilter
          options={SITUACIONES_LABORALES}
          selectedValues={filters.situacionLaboral || []}
          onToggle={(value) => toggleArrayFilter('situacionLaboral', value)}
        />
      </FilterCollapsible>

      {/* Nivel de Estudios */}
      <FilterCollapsible
        isOpen={openSections.nivelEstudios || false}
        onToggle={() => toggleSection('nivelEstudios')}
        icon={<GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Nivel de Estudios"
      >
        <CheckboxFilter
          options={NIVELES_ESTUDIOS}
          selectedValues={filters.nivelEstudios || []}
          onToggle={(value) => toggleArrayFilter('nivelEstudios', value)}
        />
      </FilterCollapsible>

      {/* Grupo de Edad */}
      <FilterCollapsible
        isOpen={openSections.grupoEdad || false}
        onToggle={() => toggleSection('grupoEdad')}
        icon={<Users className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Grupo de Edad"
      >
        <CheckboxFilter
          options={GRUPOS_EDAD}
          selectedValues={filters.grupoEdad || []}
          onToggle={(value) => toggleArrayFilter('grupoEdad', value)}
        />
      </FilterCollapsible>

      {/* Situación Familiar */}
      <FilterCollapsible
        isOpen={openSections.situacionFamiliar || false}
        onToggle={() => toggleSection('situacionFamiliar')}
        icon={<Heart className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Situación Familiar"
      >
        <CheckboxFilter
          options={SITUACIONES_FAMILIARES}
          selectedValues={filters.situacionFamiliar || []}
          onToggle={(value) => toggleArrayFilter('situacionFamiliar', value)}
        />
      </FilterCollapsible>

      {/* Desempleo */}
      <FilterCollapsible
        isOpen={openSections.desempleo || false}
        onToggle={() => toggleSection('desempleo')}
        icon={<Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Desempleo"
      >
        <div className="flex items-center space-x-2">
          <Switch 
            id="desempleo" 
            checked={filters.desempleo}
            onCheckedChange={(checked) => updateFilter('desempleo', checked)}
          />
          <Label htmlFor="desempleo" className="text-xs lg:text-sm font-light">Estoy desempleado</Label>
        </div>
      </FilterCollapsible>

      {/* Comunidad Autónoma */}
      <FilterCollapsible
        isOpen={openSections.comunidadAutonomaParticular || false}
        onToggle={() => toggleSection('comunidadAutonomaParticular')}
        icon={<MapPin className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Comunidad Autónoma"
      >
        <CheckboxFilter
          options={COMUNIDADES_AUTONOMAS}
          selectedValues={filters.comunidadAutonoma || []}
          onToggle={(value) => toggleArrayFilter('comunidadAutonoma', value)}
        />
      </FilterCollapsible>

      {/* Presupuesto */}
      <FilterCollapsible
        isOpen={openSections.presupuestoParticular || false}
        onToggle={() => toggleSection('presupuestoParticular')}
        icon={<Euro className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Presupuesto"
      >
        <RangeFilter
          minValue={0}
          maxValue={100000}
          currentMin={filters.presupuestoMin ?? 0}
          currentMax={filters.presupuestoMax ?? 100000}
          onMinChange={(value) => updateFilter('presupuestoMin', value)}
          onMaxChange={(value) => updateFilter('presupuestoMax', value)}
          step={1000}
          formatValue={(value) => `€${value.toLocaleString()}`}
        />
      </FilterCollapsible>

      {/* Fecha de Publicación */}
      <FilterCollapsible
        isOpen={openSections.fechaPublicacionParticular || false}
        onToggle={() => toggleSection('fechaPublicacionParticular')}
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
        isOpen={openSections.instrumentosAyudaParticular || false}
        onToggle={() => toggleSection('instrumentosAyudaParticular')}
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
        isOpen={openSections.origenFondosParticular || false}
        onToggle={() => toggleSection('origenFondosParticular')}
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
        isOpen={openSections.finalidadAyudaParticular || false}
        onToggle={() => toggleSection('finalidadAyudaParticular')}
        icon={<Target className="h-3 w-3 lg:h-4 lg:w-4" />}
        title="Finalidad de la Ayuda"
      >
        <CheckboxFilter
          options={FINALIDADES_AYUDA_PARTICULAR}
          selectedValues={filters.finalidadAyuda || []}
          onToggle={(value) => toggleArrayFilter('finalidadAyuda', value)}
        />
      </FilterCollapsible>
    </div>
  )
} 