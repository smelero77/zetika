import type { Metadata } from "next"
import { Suspense } from "react"

import { BuscadorFilters } from "./_components/buscador-filters"
import { BuscadorResults } from "./_components/buscador-results"
import { BuscadorHeader } from "./_components/buscador-header"
import { BuscadorProvider } from "./_components/buscador-provider"
import { BuscadorTabs } from "./_components/buscador-tabs"
import { BuscadorUserTabs } from "./_components/buscador-user-tabs"

export const metadata: Metadata = {
  title: "Buscador de Subvenciones - Zetika",
  description: "Encuentra subvenciones, concesiones y beneficiarios adaptados a tu perfil",
}

export default function BuscadorPage() {
  return (
    <BuscadorProvider>
      <div className="min-h-screen bg-background">
        {/* Contenido principal - Layout integrado */}
        <div className="w-full">
          <div className="container mx-auto px-4 py-6">
            
            {/* Layout responsive: Buscador+Filtros + Resultados */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* COLUMNA IZQUIERDA - Tabs Usuario + Buscador + Filtros */}
              <aside className="lg:col-span-1 order-1 lg:order-1">
                <div className="space-y-6">
                  {/* Tabs de tipo de usuario */}
                  <BuscadorUserTabs />
                  
                  <div className="bg-white dark:bg-slate-900 border rounded-lg shadow-sm">
                    {/* Header del buscador */}
                    <div className="px-4 lg:px-6 py-4 lg:py-6 pb-3 lg:pb-4">
                      <BuscadorHeader />
                    </div>
                    
                    {/* Filtros */}
                    <div className="p-4 lg:p-6 pt-3 lg:pt-4">
                      <Suspense fallback={
                        <div className="space-y-3 lg:space-y-4">
                          <div className="h-24 lg:h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                          <div className="h-32 lg:h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                          <div className="h-28 lg:h-36 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                        </div>
                      }>
                        <BuscadorFilters />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </aside>

              {/* COLUMNA DERECHA - Tabs + Resultados */}
              <main className="lg:col-span-2 xl:col-span-3 order-2 lg:order-2">
                <div className="space-y-6">
                  {/* Tabs de tipo de resultado */}
                  <BuscadorTabs />
                  
                  {/* Resultados */}
                  <div className="bg-white dark:bg-slate-900 border rounded-lg shadow-sm min-h-[600px]">
                    <Suspense fallback={
                      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 lg:p-6">
                          <div className="h-5 lg:h-6 w-32 lg:w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mb-2" />
                          <div className="h-3 lg:h-4 w-48 lg:w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-48 lg:h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                          ))}
                        </div>
                      </div>
                    }>
                      <BuscadorResults />
                    </Suspense>
                  </div>
                </div>
              </main>
              
            </div>
          </div>
        </div>
      </div>
    </BuscadorProvider>
  )
} 