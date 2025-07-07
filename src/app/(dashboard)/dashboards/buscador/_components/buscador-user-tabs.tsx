"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBuscador } from "./buscador-provider"

export function BuscadorUserTabs() {
  const { state, dispatch } = useBuscador()

  const handleTabChange = (value: string) => {
    dispatch({ 
      type: 'SET_TIPO_USUARIO', 
      payload: value as 'empresas' | 'particulares' 
    })
  }

  return (
    <Tabs value={state.tipoUsuario} onValueChange={handleTabChange}>
      <TabsList className="w-fit">
        <TabsTrigger value="empresas" className="flex-shrink-0">
          Empresas / Autónomos
        </TabsTrigger>
        <TabsTrigger value="particulares" className="flex-shrink-0">
          Particulares / Familias
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
} 