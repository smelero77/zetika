import { useBuscador } from "../../buscador-provider"

export function useFilterActions() {
  const { state, dispatch } = useBuscador()

  const updateFilter = (key: string, value: unknown) => {
    dispatch({ type: 'SET_FILTERS', payload: { [key]: value } })
  }

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = (state.filters as Record<string, string[]>)[key] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value]
    dispatch({ type: 'SET_FILTERS', payload: { [key]: newArray } })
  }

  const updateRangeFilter = (key: string, subKey: 'min' | 'max', value: number) => {
    const currentRange = (state.filters as Record<string, { min?: number; max?: number }>)[key] || {}
    dispatch({ 
      type: 'SET_FILTERS', 
      payload: { [key]: { ...currentRange, [subKey]: value } } 
    })
  }

  return {
    updateFilter,
    toggleArrayFilter,
    updateRangeFilter
  }
} 