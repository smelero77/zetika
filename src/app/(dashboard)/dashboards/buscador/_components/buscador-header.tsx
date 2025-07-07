"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useBuscador } from "./buscador-provider"
import type { BuscadorFiltersEmpresa, BuscadorFiltersParticular } from "@/types"

export function BuscadorHeader() {
  const { state, dispatch } = useBuscador()
  const [searchInput, setSearchInput] = useState(state.searchQuery)

  const handleSearch = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: searchInput })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    dispatch({ type: 'RESET_FILTERS' })
  }

  const getActiveFiltersCount = () => {
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

  return (
    <div>


      {/* Search Bar - Compacto */}
      <div>
        
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              placeholder={state.tipoUsuario === 'empresas' 
                ? "Ej: digitalización, tecnología..."
                : "Ej: formación, vivienda..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-10 text-base md:text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch} 
              className="flex-1"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button 
              onClick={handleResetFilters} 
              variant="outline"
              disabled={getActiveFiltersCount() === 0}
            >
              <X className="h-4 w-4" />
              Quitar filtros
            </Button>
          </div>
        </div>
      </div>


    </div>
  )
} 