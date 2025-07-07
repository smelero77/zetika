"use client"

import { useState } from "react"
import { Filter, ChevronDown, X, Settings, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { BuscadorFilters } from "./buscador-filters"
import { useBuscador } from "./buscador-provider"
import type { BuscadorFiltersEmpresa, BuscadorFiltersParticular } from "@/types"

interface BuscadorFiltersMobileProps {
  activeFiltersCount?: number
}

export function BuscadorFiltersMobile({ activeFiltersCount: propActiveFiltersCount }: BuscadorFiltersMobileProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const { state, dispatch } = useBuscador()

  // Calcular filtros activos internamente si no se pasa como prop
  const getActiveFiltersCount = () => {
    if (propActiveFiltersCount !== undefined) {
      return propActiveFiltersCount
    }

    const filters = state.filters
    let count = 0
    
    if (state.tipoUsuario === 'empresas') {
      const empresaFilters = filters as BuscadorFiltersEmpresa
      if (empresaFilters.sectorEconomico?.length) count++
      if (empresaFilters.tamanoEmpresa?.length) count++
      if (empresaFilters.formaJuridica?.length) count++
      if (empresaFilters.antiguedadEmpresa?.length) count++
      if (empresaFilters.facturacionAnual?.min || empresaFilters.facturacionAnual?.max) count++
      if (empresaFilters.numeroEmpleados?.min || empresaFilters.numeroEmpleados?.max) count++
      if (empresaFilters.comunidadAutonoma?.length) count++
      if (empresaFilters.presupuestoMin || empresaFilters.presupuestoMax) count++
      if (empresaFilters.fechaPublicacionDesde || empresaFilters.fechaPublicacionHasta) count++
      if (empresaFilters.instrumentosAyuda?.length) count++
      if (empresaFilters.origenFondos?.length) count++
      if (empresaFilters.finalidadAyuda?.length) count++
      if (!empresaFilters.soloAbiertas) count++
    } else {
      const particularFilters = filters as BuscadorFiltersParticular
      if (particularFilters.situacionLaboral?.length) count++
      if (particularFilters.nivelEstudios?.length) count++
      if (particularFilters.grupoEdad?.length) count++
      if (particularFilters.situacionFamiliar?.length) count++
      if (particularFilters.numeroHijos) count++
      if (particularFilters.ingresosFamiliares?.min || particularFilters.ingresosFamiliares?.max) count++
      if (particularFilters.discapacidad) count++
      if (particularFilters.desempleo) count++
      if (particularFilters.comunidadAutonoma?.length) count++
      if (particularFilters.presupuestoMin || particularFilters.presupuestoMax) count++
      if (particularFilters.fechaPublicacionDesde || particularFilters.fechaPublicacionHasta) count++
      if (particularFilters.instrumentosAyuda?.length) count++
      if (particularFilters.origenFondos?.length) count++
      if (particularFilters.finalidadAyuda?.length) count++
      if (!particularFilters.soloAbiertas) count++
    }
    
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const handleResetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' })
  }

  const handleApplyFilters = () => {
    setIsOpen(false)
  }

  return (
    <div className="w-full">
      {/* Header de filtros móviles */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Filtros</CardTitle>
            </div>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón principal de filtros */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 justify-between h-12 text-left border-2 border-dashed hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">
                      {activeFiltersCount > 0 ? 'Filtros aplicados' : 'Abrir filtros'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="bottom" 
                className="h-[90vh] p-0 flex flex-col"
              >
                <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      <SheetTitle className="text-lg">Filtros de búsqueda</SheetTitle>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cerrar</span>
                      </Button>
                    </SheetClose>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Personaliza tu búsqueda con filtros específicos para {state.tipoUsuario === 'empresas' ? 'empresas' : 'particulares'}
                  </p>
                </SheetHeader>
                
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      <BuscadorFilters />
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {activeFiltersCount > 0 ? `${activeFiltersCount} filtros aplicados` : 'Sin filtros aplicados'}
                    </span>
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleResetFilters}
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setIsOpen(false)} 
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleApplyFilters} 
                      className="flex-1"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Aplicar filtros
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Botón de limpiar filtros - Solo visible si hay filtros activos */}
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleResetFilters}
                className="shrink-0 h-12 w-12 border-2 border-dashed border-destructive/50 hover:border-destructive hover:bg-destructive/5 text-destructive hover:text-destructive"
                title="Limpiar todos los filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mostrar filtros activos como badges */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Filtros activos:
              </p>
              <div className="flex flex-wrap gap-1">
                {state.tipoUsuario === 'empresas' && (
                  <FiltersActiveBadges filters={state.filters as BuscadorFiltersEmpresa} type="empresa" />
                )}
                {state.tipoUsuario === 'particulares' && (
                  <FiltersActiveBadges filters={state.filters as BuscadorFiltersParticular} type="particular" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar badges de filtros activos
function FiltersActiveBadges({ filters, type }: { filters: BuscadorFiltersEmpresa | BuscadorFiltersParticular, type: 'empresa' | 'particular' }) {
  const badges = []
  
  if (type === 'empresa') {
    const empresaFilters = filters as BuscadorFiltersEmpresa
    if (empresaFilters.sectorEconomico?.length) {
      badges.push(`${empresaFilters.sectorEconomico.length} sectores`)
    }
    if (empresaFilters.tamanoEmpresa?.length) {
      badges.push(`${empresaFilters.tamanoEmpresa.length} tamaños`)
    }
    if (empresaFilters.comunidadAutonoma?.length) {
      badges.push(`${empresaFilters.comunidadAutonoma.length} CCAA`)
    }
    if (empresaFilters.instrumentosAyuda?.length) {
      badges.push(`${empresaFilters.instrumentosAyuda.length} instrumentos`)
    }
    if (empresaFilters.presupuestoMin || empresaFilters.presupuestoMax) {
      badges.push('Presupuesto')
    }
    if (!empresaFilters.soloAbiertas) {
      badges.push('Incluye cerradas')
    }
  } else {
    const particularFilters = filters as BuscadorFiltersParticular
    if (particularFilters.situacionLaboral?.length) {
      badges.push(`${particularFilters.situacionLaboral.length} situaciones`)
    }
    if (particularFilters.nivelEstudios?.length) {
      badges.push(`${particularFilters.nivelEstudios.length} estudios`)
    }
    if (particularFilters.comunidadAutonoma?.length) {
      badges.push(`${particularFilters.comunidadAutonoma.length} CCAA`)
    }
    if (particularFilters.instrumentosAyuda?.length) {
      badges.push(`${particularFilters.instrumentosAyuda.length} instrumentos`)
    }
    if (particularFilters.ingresosFamiliares?.min || particularFilters.ingresosFamiliares?.max) {
      badges.push('Ingresos')
    }
    if (!particularFilters.soloAbiertas) {
      badges.push('Incluye cerradas')
    }
  }
  
  return (
    <>
      {badges.map((badge, index) => (
        <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
          {badge}
        </Badge>
      ))}
    </>
  )
} 