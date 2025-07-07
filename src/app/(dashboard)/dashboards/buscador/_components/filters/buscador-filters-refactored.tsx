"use client"

import { useBuscador } from "../buscador-provider"
import { EmpresaFilters } from "./components/empresa-filters"
import { ParticularFilters } from "./components/particular-filters"
import type { BuscadorFiltersEmpresa, BuscadorFiltersParticular } from "@/types"

export function BuscadorFiltersRefactored() {
  const { state } = useBuscador()
  const { filters, tipoUsuario } = state

  if (tipoUsuario === 'empresas') {
    return <EmpresaFilters filters={filters as BuscadorFiltersEmpresa} />
  } else {
    return <ParticularFilters filters={filters as BuscadorFiltersParticular} />
  }
} 