"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { BuscadorFilters, BuscadorFiltersEmpresa, BuscadorFiltersParticular, BuscadorResultType, TipoUsuarioPrincipal } from "@/types"

interface BuscadorState {
  tipoUsuario: TipoUsuarioPrincipal
  filters: BuscadorFilters
  resultType: BuscadorResultType
  searchQuery: string
  isLoading: boolean
  currentPage: number
  itemsPerPage: number
}

type BuscadorAction =
  | { type: 'SET_TIPO_USUARIO'; payload: TipoUsuarioPrincipal }
  | { type: 'SET_FILTERS'; payload: Partial<BuscadorFilters> }
  | { type: 'SET_RESULT_TYPE'; payload: BuscadorResultType }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' }

const initialFiltersEmpresa: BuscadorFiltersEmpresa = {
  soloAbiertas: true,
  busquedaTexto: '',
}

const initialFiltersParticular: BuscadorFiltersParticular = {
  soloAbiertas: true,
  busquedaTexto: '',
}

const initialState: BuscadorState = {
  tipoUsuario: 'empresas',
  filters: initialFiltersEmpresa,
  resultType: 'convocatorias',
  searchQuery: '',
  isLoading: false,
  currentPage: 1,
  itemsPerPage: 12,
}

function buscadorReducer(state: BuscadorState, action: BuscadorAction): BuscadorState {
  switch (action.type) {
    case 'SET_TIPO_USUARIO':
      // Cambiar tipo de usuario resetea los filtros al apropiado
      const newFilters = action.payload === 'empresas' 
        ? initialFiltersEmpresa 
        : initialFiltersParticular
      return {
        ...state,
        tipoUsuario: action.payload,
        filters: newFilters,
        currentPage: 1,
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        currentPage: 1, // Reset page when filters change
      }
    case 'SET_RESULT_TYPE':
      return {
        ...state,
        resultType: action.payload,
        currentPage: 1,
      }
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        filters: { ...state.filters, busquedaTexto: action.payload },
        currentPage: 1,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      }
    case 'RESET_FILTERS':
      const resetFilters = state.tipoUsuario === 'empresas' 
        ? initialFiltersEmpresa 
        : initialFiltersParticular
      return {
        ...state,
        filters: resetFilters,
        searchQuery: '',
        currentPage: 1,
      }
    default:
      return state
  }
}

const BuscadorContext = createContext<{
  state: BuscadorState
  dispatch: React.Dispatch<BuscadorAction>
} | null>(null)

export function BuscadorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(buscadorReducer, initialState)

  return (
    <BuscadorContext.Provider value={{ state, dispatch }}>
      {children}
    </BuscadorContext.Provider>
  )
}

export function useBuscador() {
  const context = useContext(BuscadorContext)
  if (!context) {
    throw new Error('useBuscador must be used within BuscadorProvider')
  }
  return context
} 