"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBuscador } from "./buscador-provider"

export function BuscadorTabs() {
  const { state, dispatch } = useBuscador()

  const handleTabChange = (resultType: string) => {
    dispatch({ 
      type: 'SET_RESULT_TYPE', 
      payload: resultType as any 
    })
  }

  const tabs = [
    {
      id: 'convocatorias',
      label: 'Subvenciones'
    },
    {
      id: 'concesiones',
      label: 'Concesiones'
    },
    {
      id: 'beneficiarios',
      label: 'Beneficiarios'
    }
  ]

  return (
    <Tabs value={state.resultType} onValueChange={handleTabChange}>
      <TabsList className="w-fit">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex-shrink-0">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
} 