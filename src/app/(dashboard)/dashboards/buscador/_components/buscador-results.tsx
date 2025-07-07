"use client"

import { useEffect, useState } from "react"
import { Calendar, Building, Euro, FileText, Users, ExternalLink, Clock, TrendingUp, Award, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { useBuscador } from "./buscador-provider"
import type { ConvocatoriaCard, ConcesionCard, BeneficiarioCard } from "@/types"

// Datos de ejemplo - En producción vendrían de tRPC
const MOCK_CONVOCATORIAS: ConvocatoriaCard[] = [
  {
    id: 1,
    codigoBdns: "BDNS-000001",
    titulo: "Ayudas para la transformación digital de PYMES",
    descripcion: "Subvenciones destinadas a impulsar la digitalización de pequeñas y medianas empresas mediante la adopción de tecnologías innovadoras.",
    resumenIa: "Programa de ayudas para digitalización empresarial con hasta 12.000€ por empresa",
    fechaPublicacion: new Date("2024-01-15"),
    fechaCierre: new Date("2024-03-15"),
    presupuesto: 5000000,
    organo: "Ministerio de Industria, Comercio y Turismo",
    estado: "abierta",
    sectorEconomico: "Industria manufacturera",
    tipoAyuda: "Subvención directa",
    origenFondos: "Fondos Europeos"
  },
  {
    id: 2,
    codigoBdns: "BDNS-000002",
    titulo: "Programa de apoyo a jóvenes agricultores",
    descripcion: "Ayudas para la primera instalación de jóvenes en el sector agrario y desarrollo de explotaciones.",
    fechaPublicacion: new Date("2024-01-10"),
    fechaCierre: new Date("2024-04-30"),
    presupuesto: 2000000,
    organo: "Ministerio de Agricultura, Pesca y Alimentación",
    estado: "abierta",
    sectorEconomico: "Agricultura, ganadería, silvicultura y pesca",
    tipoAyuda: "Subvención directa",
    origenFondos: "Administración General del Estado"
  }
]

const MOCK_CONCESIONES: ConcesionCard[] = [
  {
    id: 1,
    beneficiario: "Innovación Tecnológica S.L.",
    nifCif: "B12345678",
    importe: 15000,
    fechaConcesion: new Date("2024-01-20"),
    convocatoria: "Ayudas para la transformación digital de PYMES",
    codigoBdns: "BDNS-000001",
    instrumentoAyuda: "Subvención directa"
  },
  {
    id: 2,
    beneficiario: "María García López",
    nifCif: "12345678A",
    importe: 25000,
    fechaConcesion: new Date("2024-01-25"),
    convocatoria: "Programa de apoyo a jóvenes agricultores",
    codigoBdns: "BDNS-000002",
    instrumentoAyuda: "Subvención directa"
  }
]

const MOCK_BENEFICIARIOS: BeneficiarioCard[] = [
  {
    id: 1,
    nombre: "Innovación Tecnológica S.L.",
    nifCif: "B12345678",
    totalAyudas: 45000,
    numeroAyudas: 3,
    ultimaAyuda: new Date("2024-01-20"),
    sectores: ["Industria manufacturera", "Información y comunicaciones"],
    tipoEntidad: "empresa"
  },
  {
    id: 2,
    nombre: "María García López",
    nifCif: "12345678A",
    totalAyudas: 25000,
    numeroAyudas: 1,
    ultimaAyuda: new Date("2024-01-25"),
    sectores: ["Agricultura, ganadería, silvicultura y pesca"],
    tipoEntidad: "persona"
  }
]

function ConvocatoriaCardComponent({ convocatoria }: { convocatoria: ConvocatoriaCard }) {
  const formatDate = (date: Date) => date.toLocaleDateString('es-ES')
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
  
  return (
    <Card className="group h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-background hover:from-blue-50 dark:from-blue-950/20 dark:hover:from-blue-950/30">
      <CardHeader className="pb-3 relative">
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        </div>
        
        <div className="flex items-start justify-between pr-8">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={convocatoria.estado === 'abierta' ? 'default' : 'secondary'} className="text-xs">
                {convocatoria.estado === 'abierta' ? '🟢 Abierta' : '🔴 Cerrada'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <FileText className="h-3 w-3 mr-1" />
                {convocatoria.codigoBdns}
              </Badge>
            </div>
            
            <CardTitle className="text-lg xl:text-xl leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
              {convocatoria.titulo}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {convocatoria.resumenIa && (
          <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-l-blue-300">
            <p className="text-sm line-clamp-3 italic text-muted-foreground">
              {convocatoria.resumenIa}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="truncate">Pub: {formatDate(convocatoria.fechaPublicacion)}</span>
          </div>
          
          {convocatoria.fechaCierre && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="truncate">Cierre: {formatDate(convocatoria.fechaCierre)}</span>
            </div>
          )}
          
          {convocatoria.presupuesto && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <Euro className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">{formatCurrency(convocatoria.presupuesto)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="line-clamp-2 text-muted-foreground">{convocatoria.organo}</span>
        </div>
        
        <Separator />
        
        <div className="flex flex-wrap gap-2">
          {convocatoria.sectorEconomico && (
            <Badge variant="outline" className="text-xs bg-slate-50">
              <Target className="h-3 w-3 mr-1" />
              {convocatoria.sectorEconomico.length > 25 ? convocatoria.sectorEconomico.substring(0, 25) + '...' : convocatoria.sectorEconomico}
            </Badge>
          )}
          {convocatoria.origenFondos && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
              {convocatoria.origenFondos}
            </Badge>
          )}
        </div>
        
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full group-hover:bg-blue-50 group-hover:border-blue-300">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ConcesionCardComponent({ concesion }: { concesion: ConcesionCard }) {
  const formatDate = (date: Date) => date.toLocaleDateString('es-ES')
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
  
  return (
    <Card className="group h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-background hover:from-green-50 dark:from-green-950/20 dark:hover:from-green-950/30">
      <CardHeader className="pb-3 relative">
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        
        <div className="space-y-2 pr-8">
          <CardTitle className="text-lg xl:text-xl line-clamp-2 group-hover:text-green-700 transition-colors">
            {concesion.beneficiario}
          </CardTitle>
          {concesion.nifCif && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Users className="h-3 w-3 mr-1" />
                {concesion.nifCif}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-700">
            <TrendingUp className="h-6 w-6" />
            <span>{formatCurrency(concesion.importe)}</span>
          </div>
          <p className="text-sm text-green-600 mt-1">Importe concedido</p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span>Concedida: {formatDate(concesion.fechaConcesion)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs">{concesion.codigoBdns}</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            Convocatoria:
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 pl-6">
            {concesion.convocatoria}
          </p>
        </div>
        
        {concesion.instrumentoAyuda && (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            {concesion.instrumentoAyuda}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

function BeneficiarioCardComponent({ beneficiario }: { beneficiario: BeneficiarioCard }) {
  const formatDate = (date: Date) => date.toLocaleDateString('es-ES')
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
  
  const getTipoEntidadIcon = (tipo: string) => {
    switch (tipo) {
      case 'empresa': return <Building className="h-4 w-4" />
      case 'persona': return <Users className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }
  
  return (
    <Card className="group h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-background hover:from-purple-50 dark:from-purple-950/20 dark:hover:from-purple-950/30">
      <CardHeader className="pb-3 relative">
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
        </div>
        
        <div className="space-y-2 pr-8">
          <CardTitle className="text-lg xl:text-xl line-clamp-2 group-hover:text-purple-700 transition-colors">
            {beneficiario.nombre}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {getTipoEntidadIcon(beneficiario.tipoEntidad)}
              <span className="ml-1">{beneficiario.nifCif}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(beneficiario.totalAyudas)}
            </p>
            <p className="text-xs text-green-600 mt-1">Total ayudas</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xl font-bold text-blue-700">
              {beneficiario.numeroAyudas}
            </p>
            <p className="text-xs text-blue-600 mt-1">Núm. ayudas</p>
          </div>
        </div>
        
        {beneficiario.ultimaAyuda && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Última ayuda: {formatDate(beneficiario.ultimaAyuda)}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Sectores:
          </p>
          <div className="flex flex-wrap gap-2">
            {beneficiario.sectores.map((sector, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-slate-50">
                {sector.length > 20 ? sector.substring(0, 20) + '...' : sector}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-full sm:w-48 bg-muted animate-pulse rounded" />
      </div>
      
      {/* Grid skeleton - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-16 w-full bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



export function BuscadorResults() {
  const { state } = useBuscador()
  const [isLoading, setIsLoading] = useState(true)
  
  // Nueva variable para almacenar datos filtrados según el tipo seleccionado
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<ConvocatoriaCard[]>(MOCK_CONVOCATORIAS)
  const [filteredConcesiones, setFilteredConcesiones] = useState<ConcesionCard[]>(MOCK_CONCESIONES)
  const [filteredBeneficiarios, setFilteredBeneficiarios] = useState<BeneficiarioCard[]>(MOCK_BENEFICIARIOS)
  
  // Función auxiliar para comprobar coincidencia de texto
  const textMatches = (text: string, query: string) =>
    text.toLowerCase().includes(query.toLowerCase())

  // Aplicar filtros y búsqueda cada vez que cambien los filtros, el tipo de resultado o la query
  useEffect(() => {
    setIsLoading(true)

    const { filters, searchQuery, resultType } = state

    // Convocatorias
    let convocatorias = [...MOCK_CONVOCATORIAS]
    if ('soloAbiertas' in filters && filters.soloAbiertas) {
      convocatorias = convocatorias.filter(c => c.estado === 'abierta')
    }
    if (searchQuery) {
      convocatorias = convocatorias.filter(c =>
        textMatches(c.titulo, searchQuery) ||
        textMatches(c.descripcion, searchQuery)
      )
    }
    // Sector económico
    if ('sectorEconomico' in filters && filters.sectorEconomico?.length) {
      const sectores = filters.sectorEconomico
      convocatorias = convocatorias.filter(c => c.sectorEconomico && sectores.includes(c.sectorEconomico))
    }
    // Origen fondos
    if ('origenFondos' in filters && filters.origenFondos?.length) {
      const origenes = filters.origenFondos
      convocatorias = convocatorias.filter(c => c.origenFondos && origenes.includes(c.origenFondos))
    }
    setFilteredConvocatorias(convocatorias)

    // Concesiones
    let concesiones = [...MOCK_CONCESIONES]
    if (searchQuery) {
      concesiones = concesiones.filter(c =>
        textMatches(c.beneficiario, searchQuery) ||
        textMatches(c.convocatoria, searchQuery)
      )
    }
    setFilteredConcesiones(concesiones)

    // Beneficiarios
    let beneficiarios = [...MOCK_BENEFICIARIOS]
    if (searchQuery) {
      beneficiarios = beneficiarios.filter(b =>
        textMatches(b.nombre, searchQuery) ||
        textMatches(b.nifCif ?? '', searchQuery)
      )
    }
    setFilteredBeneficiarios(beneficiarios)

    // Imitar retardo de red
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // tiempo reducido

    return () => clearTimeout(timer)

  }, [state])
  
  if (isLoading) {
    return <LoadingSkeleton />
  }
  
  const renderResults = () => {
    switch (state.resultType) {
      case 'convocatorias':
        return filteredConvocatorias.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredConvocatorias.map(convocatoria => (
              <ConvocatoriaCardComponent 
                key={convocatoria.id} 
                convocatoria={convocatoria} 
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">No se encontraron convocatorias.</p>
        )
      case 'concesiones':
        return filteredConcesiones.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredConcesiones.map(concesion => (
              <ConcesionCardComponent 
                key={concesion.id} 
                concesion={concesion} 
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">No se encontraron concesiones.</p>
        )
      case 'beneficiarios':
        return filteredBeneficiarios.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredBeneficiarios.map(beneficiario => (
              <BeneficiarioCardComponent 
                key={beneficiario.id} 
                beneficiario={beneficiario} 
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">No se encontraron beneficiarios.</p>
        )
      default:
        return null
    }
  }
  

  
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Resultados reales */}
      {renderResults()}
      
      {/* Paginación mejorada */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Mostrando resultados
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" disabled size="sm" className="px-3">
            Anterior
          </Button>
          <Button variant="default" size="sm" className="px-3">1</Button>
          <Button variant="outline" size="sm" className="px-3">2</Button>
          <Button variant="outline" size="sm" className="px-3">3</Button>
          <span className="px-2 text-sm text-muted-foreground">...</span>
          <Button variant="outline" size="sm" className="px-3">10</Button>
          <Button variant="outline" size="sm" className="px-3">
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
} 