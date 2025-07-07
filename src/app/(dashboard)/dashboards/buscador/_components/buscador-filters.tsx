"use client"

import { useState } from "react"
import { Calendar, MapPin, Building, Euro, FileText, Users, GraduationCap, Heart, Briefcase, Award, Target } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

import { useBuscador } from "./buscador-provider"
import type { BuscadorFiltersEmpresa, BuscadorFiltersParticular } from "@/types"

// Datos para filtros de EMPRESAS
const SECTORES_ECONOMICOS = [
  "Agricultura, ganadería, silvicultura y pesca",
  "Industria manufacturera",
  "Construcción",
  "Comercio al por mayor y al por menor",
  "Transporte y almacenamiento",
  "Hostelería",
  "Información y comunicaciones",
  "Actividades financieras y de seguros",
  "Actividades inmobiliarias",
  "Actividades profesionales, científicas y técnicas",
  "Educación",
  "Actividades sanitarias y de servicios sociales",
  "Actividades artísticas, recreativas y de entretenimiento",
]

const TAMANOS_EMPRESA = [
  "Microempresa (1-9 empleados)",
  "Pequeña empresa (10-49 empleados)", 
  "Mediana empresa (50-249 empleados)",
  "Gran empresa (250+ empleados)"
]

const FORMAS_JURIDICAS = [
  "Autónomo/RETA",
  "Sociedad Limitada (SL)",
  "Sociedad Anónima (SA)",
  "Sociedad Cooperativa",
  "Comunidad de Bienes",
  "Sociedad Civil",
  "Otras formas jurídicas"
]

const ANTIGUEDAD_EMPRESA = [
  "Menos de 1 año",
  "1-2 años",
  "3-5 años", 
  "6-10 años",
  "Más de 10 años"
]

// Datos para filtros de PARTICULARES
const SITUACIONES_LABORALES = [
  "Empleado por cuenta ajena",
  "Autónomo",
  "Desempleado",
  "Estudiante",
  "Jubilado/Pensionista",
  "Ama/o de casa",
  "Incapacidad temporal",
  "Otras situaciones"
]

const NIVELES_ESTUDIOS = [
  "Sin estudios",
  "Educación Primaria",
  "Educación Secundaria Obligatoria (ESO)",
  "Bachillerato",
  "Formación Profesional",
  "Educación Universitaria",
  "Máster/Posgrado",
  "Doctorado"
]

const GRUPOS_EDAD = [
  "16-25 años",
  "26-35 años",
  "36-45 años",
  "46-55 años",
  "56-65 años",
  "Más de 65 años"
]

const SITUACIONES_FAMILIARES = [
  "Soltero/a sin hijos",
  "Soltero/a con hijos",
  "Pareja sin hijos",
  "Pareja con hijos",
  "Familia monoparental",
  "Familia numerosa",
  "Persona dependiente a cargo"
]

// Datos comunes
const COMUNIDADES_AUTONOMAS = [
  "Andalucía", "Aragón", "Asturias", "Islas Baleares", "Canarias", "Cantabria",
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Extremadura", "Galicia",
  "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco", "Valencia", "Ceuta", "Melilla"
]

const INSTRUMENTOS_AYUDA = [
  "Subvención directa",
  "Préstamo",
  "Aval",
  "Garantía",
  "Subvención de intereses",
  "Préstamo participativo",
  "Microcrédito",
  "Beca",
  "Ayuda social",
  "Otras ayudas financieras"
]

const ORIGENES_FONDOS = [
  "Fondos Europeos",
  "Administración General del Estado",
  "Comunidades Autónomas",
  "Entidades Locales",
  "Otros organismos públicos"
]

const FINALIDADES_AYUDA_EMPRESA = [
  "Innovación y I+D+i",
  "Digitalización",
  "Internacionalización",
  "Formación",
  "Creación de empleo",
  "Sostenibilidad y medio ambiente",
  "Inversión productiva",
  "Otros"
]

const FINALIDADES_AYUDA_PARTICULAR = [
  "Educación y formación",
  "Vivienda",
  "Familia e hijos",
  "Empleo e inserción laboral",
  "Personas dependientes",
  "Discapacidad",
  "Emprendimiento",
  "Otros"
]

export function BuscadorFilters() {
  const { state, dispatch } = useBuscador()
  const { filters, tipoUsuario } = state
  
  // Estado para manejar el colapso de las secciones
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  
  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const updateFilter = (key: string, value: unknown) => {
    dispatch({ type: 'SET_FILTERS', payload: { [key]: value } })
  }

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = (filters as Record<string, string[]>)[key] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const updateRangeFilter = (key: string, subKey: 'min' | 'max', value: number) => {
    const currentRange = (filters as Record<string, { min?: number; max?: number }>)[key] || {}
    updateFilter(key, { ...currentRange, [subKey]: value })
  }

  if (tipoUsuario === 'empresas') {
    const empresaFilters = filters as BuscadorFiltersEmpresa

    return (
      <div className="space-y-3 lg:space-y-4">
        {/* Estado de Convocatorias */}
        <div className="flex items-center gap-2 px-3 lg:px-4 pb-3 lg:pb-4">
          <Switch 
            id="solo-abiertas" 
            checked={empresaFilters.soloAbiertas}
            onCheckedChange={(checked) => updateFilter('soloAbiertas', checked)}
          />
          <span className={`text-xs lg:text-sm font-light ${empresaFilters.soloAbiertas ? 'font-bold' : ''}`}>Convocatorias abiertas</span>
        </div>

        {/* Sector Económico */}
        <Collapsible open={openSections.sectorEconomico} onOpenChange={() => toggleSection('sectorEconomico')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Sector Económico</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.sectorEconomico ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {SECTORES_ECONOMICOS.map((sector) => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={sector}
                  checked={empresaFilters.sectorEconomico?.includes(sector)}
                  onCheckedChange={() => toggleArrayFilter('sectorEconomico', sector)}
                />
                <Label htmlFor={sector} className="text-xs lg:text-sm leading-tight font-light">
                  {sector}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Tamaño de Empresa */}
        <Collapsible open={openSections.tamanoEmpresa} onOpenChange={() => toggleSection('tamanoEmpresa')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Tamaño de Empresa</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.tamanoEmpresa ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {TAMANOS_EMPRESA.map((tamano) => (
              <div key={tamano} className="flex items-center space-x-2">
                <Checkbox
                  id={tamano}
                  checked={empresaFilters.tamanoEmpresa?.includes(tamano)}
                  onCheckedChange={() => toggleArrayFilter('tamanoEmpresa', tamano)}
                />
                <Label htmlFor={tamano} className="text-xs lg:text-sm font-light">
                  {tamano}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Forma Jurídica */}
        <Collapsible open={openSections.formaJuridica} onOpenChange={() => toggleSection('formaJuridica')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Forma Jurídica</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.formaJuridica ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {FORMAS_JURIDICAS.map((forma) => (
              <div key={forma} className="flex items-center space-x-2">
                <Checkbox
                  id={forma}
                  checked={empresaFilters.formaJuridica?.includes(forma)}
                  onCheckedChange={() => toggleArrayFilter('formaJuridica', forma)}
                />
                <Label htmlFor={forma} className="text-xs lg:text-sm font-light">
                  {forma}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Antigüedad de la Empresa */}
        <Collapsible open={openSections.antiguedadEmpresa} onOpenChange={() => toggleSection('antiguedadEmpresa')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Antigüedad</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.antiguedadEmpresa ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {ANTIGUEDAD_EMPRESA.map((antiguedad) => (
              <div key={antiguedad} className="flex items-center space-x-2">
                <Checkbox
                  id={antiguedad}
                  checked={empresaFilters.antiguedadEmpresa?.includes(antiguedad)}
                  onCheckedChange={() => toggleArrayFilter('antiguedadEmpresa', antiguedad)}
                />
                <Label htmlFor={antiguedad} className="text-xs lg:text-sm font-light">
                  {antiguedad}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Facturación Anual */}
        <Collapsible open={openSections.facturacionAnual} onOpenChange={() => toggleSection('facturacionAnual')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Euro className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Facturación Anual</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.facturacionAnual ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Mínima: €{(empresaFilters.facturacionAnual?.min || 0).toLocaleString()}</Label>
              <Slider
                value={[empresaFilters.facturacionAnual?.min ?? 0]}
                onValueChange={([value]) => updateRangeFilter('facturacionAnual', 'min', value)}
                max={5000000}
                step={50000}
                className="w-full"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Máxima: €{(empresaFilters.facturacionAnual?.max || 5000000).toLocaleString()}</Label>
              <Slider
                value={[empresaFilters.facturacionAnual?.max ?? 5000000]}
                onValueChange={([value]) => updateRangeFilter('facturacionAnual', 'max', value)}
                max={5000000}
                step={50000}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Número de Empleados */}
        <Collapsible open={openSections.numeroEmpleados} onOpenChange={() => toggleSection('numeroEmpleados')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Número de Empleados</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.numeroEmpleados ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Mínimo: {empresaFilters.numeroEmpleados?.min ?? 0}</Label>
              <Slider
                value={[empresaFilters.numeroEmpleados?.min ?? 0]}
                onValueChange={([value]) => updateRangeFilter('numeroEmpleados', 'min', value)}
                max={1000}
                step={10}
                className="w-full"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Máximo: {empresaFilters.numeroEmpleados?.max ?? 1000}</Label>
              <Slider
                value={[empresaFilters.numeroEmpleados?.max ?? 1000]}
                onValueChange={([value]) => updateRangeFilter('numeroEmpleados', 'max', value)}
                max={1000}
                step={10}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Comunidad Autónoma */}
        <Collapsible open={openSections.comunidadAutonoma} onOpenChange={() => toggleSection('comunidadAutonoma')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Comunidad Autónoma</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.comunidadAutonoma ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {COMUNIDADES_AUTONOMAS.map((comunidad) => (
              <div key={comunidad} className="flex items-center space-x-2">
                <Checkbox
                  id={comunidad}
                  checked={empresaFilters.comunidadAutonoma?.includes(comunidad)}
                  onCheckedChange={() => toggleArrayFilter('comunidadAutonoma', comunidad)}
                />
                <Label htmlFor={comunidad} className="text-xs lg:text-sm font-light">
                  {comunidad}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Presupuesto */}
        <Collapsible open={openSections.presupuesto} onOpenChange={() => toggleSection('presupuesto')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Euro className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Presupuesto</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.presupuesto ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Mínimo: €{(empresaFilters.presupuestoMin ?? 0).toLocaleString()}</Label>
              <Slider
                value={[empresaFilters.presupuestoMin ?? 0]}
                onValueChange={([value]) => updateFilter('presupuestoMin', value)}
                max={10000000}
                step={100000}
                className="w-full"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Máximo: €{(empresaFilters.presupuestoMax ?? 10000000).toLocaleString()}</Label>
              <Slider
                value={[empresaFilters.presupuestoMax ?? 10000000]}
                onValueChange={([value]) => updateFilter('presupuestoMax', value)}
                max={10000000}
                step={100000}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Fecha de Publicación */}
        <Collapsible open={openSections.fechaPublicacion} onOpenChange={() => toggleSection('fechaPublicacion')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Fecha de Publicación</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.fechaPublicacion ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Desde</Label>
              <Input
                type="date"
                value={empresaFilters.fechaPublicacionDesde?.toString() || ''}
                onChange={(e) => updateFilter('fechaPublicacionDesde', e.target.value)}
                className="text-xs lg:text-sm"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Hasta</Label>
              <Input
                type="date"
                value={empresaFilters.fechaPublicacionHasta?.toString() || ''}
                onChange={(e) => updateFilter('fechaPublicacionHasta', e.target.value)}
                className="text-xs lg:text-sm"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Instrumentos de Ayuda */}
        <Collapsible open={openSections.instrumentosAyuda} onOpenChange={() => toggleSection('instrumentosAyuda')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Instrumentos de Ayuda</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.instrumentosAyuda ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {INSTRUMENTOS_AYUDA.map((instrumento) => (
              <div key={instrumento} className="flex items-center space-x-2">
                <Checkbox
                  id={instrumento}
                  checked={empresaFilters.instrumentosAyuda?.includes(instrumento)}
                  onCheckedChange={() => toggleArrayFilter('instrumentosAyuda', instrumento)}
                />
                <Label htmlFor={instrumento} className="text-xs lg:text-sm font-light">
                  {instrumento}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Origen de Fondos */}
        <Collapsible open={openSections.origenFondos} onOpenChange={() => toggleSection('origenFondos')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Euro className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Origen de Fondos</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.origenFondos ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {ORIGENES_FONDOS.map((origen) => (
              <div key={origen} className="flex items-center space-x-2">
                <Checkbox
                  id={origen}
                  checked={empresaFilters.origenFondos?.includes(origen)}
                  onCheckedChange={() => toggleArrayFilter('origenFondos', origen)}
                />
                <Label htmlFor={origen} className="text-xs lg:text-sm font-light">
                  {origen}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Finalidad de la Ayuda */}
        <Collapsible open={openSections.finalidadAyuda} onOpenChange={() => toggleSection('finalidadAyuda')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Finalidad de la Ayuda</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.finalidadAyuda ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {FINALIDADES_AYUDA_EMPRESA.map((finalidad) => (
              <div key={finalidad} className="flex items-center space-x-2">
                <Checkbox
                  id={finalidad}
                  checked={empresaFilters.finalidadAyuda?.includes(finalidad)}
                  onCheckedChange={() => toggleArrayFilter('finalidadAyuda', finalidad)}
                />
                <Label htmlFor={finalidad} className="text-xs lg:text-sm font-light">
                  {finalidad}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  } else {
    // Filtros para PARTICULARES
    const particularFilters = filters as BuscadorFiltersParticular

    return (
      <div className="space-y-3 lg:space-y-4">
        {/* Estado de Convocatorias */}
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="solo-abiertas-particular" 
              checked={particularFilters.soloAbiertas}
              onCheckedChange={(checked) => updateFilter('soloAbiertas', checked)}
            />
            <Label htmlFor="solo-abiertas-particular" className="text-xs lg:text-sm font-light">Solo convocatorias abiertas</Label>
          </div>
        </div>

        {/* Situación Laboral */}
        <Collapsible open={openSections.situacionLaboral} onOpenChange={() => toggleSection('situacionLaboral')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Situación Laboral</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.situacionLaboral ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {SITUACIONES_LABORALES.map((situacion) => (
              <div key={situacion} className="flex items-center space-x-2">
                <Checkbox
                  id={situacion}
                  checked={particularFilters.situacionLaboral?.includes(situacion)}
                  onCheckedChange={() => toggleArrayFilter('situacionLaboral', situacion)}
                />
                <Label htmlFor={situacion} className="text-xs lg:text-sm font-light">
                  {situacion}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Nivel de Estudios */}
        <Collapsible open={openSections.nivelEstudios} onOpenChange={() => toggleSection('nivelEstudios')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Nivel de Estudios</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.nivelEstudios ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {NIVELES_ESTUDIOS.map((nivel) => (
              <div key={nivel} className="flex items-center space-x-2">
                <Checkbox
                  id={nivel}
                  checked={particularFilters.nivelEstudios?.includes(nivel)}
                  onCheckedChange={() => toggleArrayFilter('nivelEstudios', nivel)}
                />
                <Label htmlFor={nivel} className="text-xs lg:text-sm font-light">
                  {nivel}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Grupo de Edad */}
        <Collapsible open={openSections.grupoEdad} onOpenChange={() => toggleSection('grupoEdad')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Grupo de Edad</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.grupoEdad ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {GRUPOS_EDAD.map((grupo) => (
              <div key={grupo} className="flex items-center space-x-2">
                <Checkbox
                  id={grupo}
                  checked={particularFilters.grupoEdad?.includes(grupo)}
                  onCheckedChange={() => toggleArrayFilter('grupoEdad', grupo)}
                />
                <Label htmlFor={grupo} className="text-xs lg:text-sm font-light">
                  {grupo}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Situación Familiar */}
        <Collapsible open={openSections.situacionFamiliar} onOpenChange={() => toggleSection('situacionFamiliar')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Situación Familiar</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.situacionFamiliar ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {SITUACIONES_FAMILIARES.map((situacion) => (
              <div key={situacion} className="flex items-center space-x-2">
                <Checkbox
                  id={situacion}
                  checked={particularFilters.situacionFamiliar?.includes(situacion)}
                  onCheckedChange={() => toggleArrayFilter('situacionFamiliar', situacion)}
                />
                <Label htmlFor={situacion} className="text-xs lg:text-sm font-light">
                  {situacion}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Número de Hijos */}
        <Collapsible open={openSections.numeroHijos} onOpenChange={() => toggleSection('numeroHijos')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Número de Hijos</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.numeroHijos ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Select 
              value={particularFilters.numeroHijos?.toString() || ''} 
              onValueChange={(value) => updateFilter('numeroHijos', parseInt(value))}
            >
              <SelectTrigger className="text-xs lg:text-sm">
                <SelectValue placeholder="Seleccionar número de hijos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 hijos</SelectItem>
                <SelectItem value="1">1 hijo</SelectItem>
                <SelectItem value="2">2 hijos</SelectItem>
                <SelectItem value="3">3 hijos</SelectItem>
                <SelectItem value="4">4 hijos</SelectItem>
                <SelectItem value="5">5 o más hijos</SelectItem>
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Ingresos Familiares */}
        <Collapsible open={openSections.ingresosFamiliares} onOpenChange={() => toggleSection('ingresosFamiliares')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Euro className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Ingresos Familiares</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.ingresosFamiliares ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Mínimo: €{(particularFilters.ingresosFamiliares?.min ?? 0).toLocaleString()}</Label>
              <Slider
                value={[particularFilters.ingresosFamiliares?.min ?? 0]}
                onValueChange={([value]) => updateRangeFilter('ingresosFamiliares', 'min', value)}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Máximo: €{(particularFilters.ingresosFamiliares?.max ?? 100000).toLocaleString()}</Label>
              <Slider
                value={[particularFilters.ingresosFamiliares?.max ?? 100000]}
                onValueChange={([value]) => updateRangeFilter('ingresosFamiliares', 'max', value)}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Discapacidad */}
        <Collapsible open={openSections.discapacidad} onOpenChange={() => toggleSection('discapacidad')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Discapacidad</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.discapacidad ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex items-center space-x-2">
              <Switch 
                id="discapacidad" 
                checked={particularFilters.discapacidad}
                onCheckedChange={(checked) => updateFilter('discapacidad', checked)}
              />
              <Label htmlFor="discapacidad" className="text-xs lg:text-sm font-light">Tengo discapacidad</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Desempleo */}
        <Collapsible open={openSections.desempleo} onOpenChange={() => toggleSection('desempleo')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Desempleo</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.desempleo ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex items-center space-x-2">
              <Switch 
                id="desempleo" 
                checked={particularFilters.desempleo}
                onCheckedChange={(checked) => updateFilter('desempleo', checked)}
              />
              <Label htmlFor="desempleo" className="text-xs lg:text-sm font-light">Estoy desempleado</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Comunidad Autónoma */}
        <Collapsible open={openSections.comunidadAutonomaParticular} onOpenChange={() => toggleSection('comunidadAutonomaParticular')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Comunidad Autónoma</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.comunidadAutonomaParticular ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {COMUNIDADES_AUTONOMAS.map((comunidad) => (
              <div key={comunidad} className="flex items-center space-x-2">
                <Checkbox
                  id={comunidad}
                  checked={particularFilters.comunidadAutonoma?.includes(comunidad)}
                  onCheckedChange={() => toggleArrayFilter('comunidadAutonoma', comunidad)}
                />
                <Label htmlFor={comunidad} className="text-xs lg:text-sm font-light">
                  {comunidad}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Presupuesto */}
        <Collapsible open={openSections.presupuestoParticular} onOpenChange={() => toggleSection('presupuestoParticular')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Euro className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Presupuesto</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.presupuestoParticular ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Mínimo: €{(particularFilters.presupuestoMin ?? 0).toLocaleString()}</Label>
              <Slider
                value={[particularFilters.presupuestoMin ?? 0]}
                onValueChange={([value]) => updateFilter('presupuestoMin', value)}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Máximo: €{(particularFilters.presupuestoMax ?? 100000).toLocaleString()}</Label>
              <Slider
                value={[particularFilters.presupuestoMax ?? 100000]}
                onValueChange={([value]) => updateFilter('presupuestoMax', value)}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Fecha de Publicación */}
        <Collapsible open={openSections.fechaPublicacionParticular} onOpenChange={() => toggleSection('fechaPublicacionParticular')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Fecha de Publicación</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.fechaPublicacionParticular ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 lg:space-y-4">
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Desde</Label>
              <Input
                type="date"
                value={particularFilters.fechaPublicacionDesde?.toString() || ''}
                onChange={(e) => updateFilter('fechaPublicacionDesde', e.target.value)}
                className="text-xs lg:text-sm"
              />
            </div>
            <div className="space-y-1 lg:space-y-2">
              <Label className="text-xs lg:text-sm font-light">Hasta</Label>
              <Input
                type="date"
                value={particularFilters.fechaPublicacionHasta?.toString() || ''}
                onChange={(e) => updateFilter('fechaPublicacionHasta', e.target.value)}
                className="text-xs lg:text-sm"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Instrumentos de Ayuda */}
        <Collapsible open={openSections.instrumentosAyudaParticular} onOpenChange={() => toggleSection('instrumentosAyudaParticular')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Instrumentos de Ayuda</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.instrumentosAyudaParticular ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {INSTRUMENTOS_AYUDA.map((instrumento) => (
              <div key={instrumento} className="flex items-center space-x-2">
                <Checkbox
                  id={instrumento}
                  checked={particularFilters.instrumentosAyuda?.includes(instrumento)}
                  onCheckedChange={() => toggleArrayFilter('instrumentosAyuda', instrumento)}
                />
                <Label htmlFor={instrumento} className="text-xs lg:text-sm font-light">
                  {instrumento}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Origen de Fondos */}
        <Collapsible open={openSections.origenFondosParticular} onOpenChange={() => toggleSection('origenFondosParticular')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Euro className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Origen de Fondos</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.origenFondosParticular ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {ORIGENES_FONDOS.map((origen) => (
              <div key={origen} className="flex items-center space-x-2">
                <Checkbox
                  id={origen}
                  checked={particularFilters.origenFondos?.includes(origen)}
                  onCheckedChange={() => toggleArrayFilter('origenFondos', origen)}
                />
                <Label htmlFor={origen} className="text-xs lg:text-sm font-light">
                  {origen}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Finalidad de la Ayuda */}
        <Collapsible open={openSections.finalidadAyudaParticular} onOpenChange={() => toggleSection('finalidadAyudaParticular')}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="text-sm lg:text-base">Finalidad de la Ayuda</span>
              </div>
              <ChevronDown className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${openSections.finalidadAyudaParticular ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 lg:space-y-2">
            {FINALIDADES_AYUDA_PARTICULAR.map((finalidad) => (
              <div key={finalidad} className="flex items-center space-x-2">
                <Checkbox
                  id={finalidad}
                  checked={particularFilters.finalidadAyuda?.includes(finalidad)}
                  onCheckedChange={() => toggleArrayFilter('finalidadAyuda', finalidad)}
                />
                <Label htmlFor={finalidad} className="text-xs lg:text-sm font-light">
                  {finalidad}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }
} 