import type { LucideIcon } from "lucide-react"
import type { ComponentType, SVGAttributes } from "react"

export type LayoutType = "vertical" | "horizontal"

export type ModeType = "light" | "dark" | "system"

export type OrientationType = "vertical" | "horizontal"

export type DirectionType = "ltr" | "rtl"

export type ThemeType = "zinc" | "slate" | "stone" | "gray" | "neutral" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet"

export type RadiusType = "none" | "sm" | "md" | "lg" | "xl"

export type SettingsType = {
  theme: ThemeType
  mode: ModeType
  radius: RadiusType
  layout: LayoutType
}

export interface IconProps extends SVGAttributes<SVGElement> {
  children?: never
  color?: string
}

export type IconType = ComponentType<IconProps> | LucideIcon

export type DynamicIconNameType = string

export interface UserType {
  id: string
  firstName: string
  lastName: string
  name: string
  password: string
  username: string
  role: string
  avatar: string
  background: string
  status: string
  phoneNumber: string
  email: string
  state: string
  country: string
  address: string
  zipCode: string
  language: string
  timeZone: string
  currency: string
  organization: string
  twoFactorAuth: boolean
  loginAlerts: boolean
  accountReoveryOption?: "email" | "sms" | "codes"
  connections: number
  followers: number
}

export interface RouteType {
  type: "guest" | "public"
  exceptions?: string[]
}

export interface NotificationType {
  unreadCount: number
  notifications: Array<{
    id: string
    iconName: DynamicIconNameType
    content: string
    url: string
    date: Date
    isRead: boolean
  }>
}

export type FormatStyleType = "percent" | "duration" | "currency" | "regular"

export interface NavigationType {
  title: string
  items: NavigationRootItem[]
}

export type NavigationRootItem =
  | NavigationRootItemWithHrefType
  | NavigationRootItemWithItemsType

export interface NavigationRootItemBasicType {
  title: string
  label?: string
  iconName: DynamicIconNameType
}

export interface NavigationRootItemWithHrefType
  extends NavigationRootItemBasicType {
  href: string
  items?: never
}

export interface NavigationRootItemWithItemsType
  extends NavigationRootItemBasicType {
  items: (
    | NavigationNestedItemWithHrefType
    | NavigationNestedItemWithItemsType
  )[]
  href?: never
}

export interface NavigationNestedItemBasicType {
  title: string
  label?: string
}

export interface NavigationNestedItemWithHrefType
  extends NavigationNestedItemBasicType {
  href: string
  items?: never
}

export interface NavigationNestedItemWithItemsType
  extends NavigationNestedItemBasicType {
  items: (
    | NavigationNestedItemWithHrefType
    | NavigationNestedItemWithItemsType
  )[]
  href?: never
}

export type NavigationNestedItem =
  | NavigationNestedItemWithHrefType
  | NavigationNestedItemWithItemsType

export interface OAuthLinkType {
  href: string
  label: string
  icon: IconType
}

export interface FileType {
  id: string
  name: string
  size: number
  type: string
  url: string
}

// Tipos para el Buscador de Subvenciones
export type TipoUsuarioPrincipal = 'empresas' | 'particulares'

export interface BuscadorFiltersEmpresa {
  // Filtros específicos para Autónomos/Sociedades
  sectorEconomico?: string[]
  tamanoEmpresa?: string[]
  formaJuridica?: string[]
  antiguedadEmpresa?: string[]
  facturacionAnual?: {
    min?: number
    max?: number
  }
  numeroEmpleados?: {
    min?: number
    max?: number
  }
  
  // Filtros geográficos
  comunidadAutonoma?: string[]
  provincia?: string[]
  
  // Filtros por características de la ayuda
  presupuestoMin?: number
  presupuestoMax?: number
  fechaPublicacionDesde?: Date
  fechaPublicacionHasta?: Date
  soloAbiertas?: boolean
  
  // Filtros por tipo de ayuda
  instrumentosAyuda?: string[]
  origenFondos?: string[]
  finalidadAyuda?: string[]
  
  // Búsqueda por texto
  busquedaTexto?: string
}

export interface BuscadorFiltersParticular {
  // Filtros específicos para Particulares/Familias
  situacionLaboral?: string[]
  nivelEstudios?: string[]
  grupoEdad?: string[]
  situacionFamiliar?: string[]
  numeroHijos?: number
  ingresosFamiliares?: {
    min?: number
    max?: number
  }
  discapacidad?: boolean
  desempleo?: boolean
  
  // Filtros geográficos
  comunidadAutonoma?: string[]
  provincia?: string[]
  
  // Filtros por características de la ayuda
  presupuestoMin?: number
  presupuestoMax?: number
  fechaPublicacionDesde?: Date
  fechaPublicacionHasta?: Date
  soloAbiertas?: boolean
  
  // Filtros por tipo de ayuda
  instrumentosAyuda?: string[]
  origenFondos?: string[]
  finalidadAyuda?: string[]
  
  // Búsqueda por texto
  busquedaTexto?: string
}

export type BuscadorFilters = BuscadorFiltersEmpresa | BuscadorFiltersParticular

export interface ConvocatoriaCard {
  id: number
  codigoBdns: string
  titulo: string
  descripcion: string
  resumenIa?: string
  fechaPublicacion: Date
  fechaCierre?: Date
  presupuesto?: number
  organo: string
  estado: 'abierta' | 'cerrada'
  sectorEconomico?: string
  tipoAyuda?: string
  origenFondos?: string
}

export interface ConcesionCard {
  id: number
  beneficiario: string
  nifCif?: string
  importe: number
  fechaConcesion: Date
  convocatoria: string
  codigoBdns: string
  instrumentoAyuda?: string
}

export interface BeneficiarioCard {
  id: number
  nombre: string
  nifCif?: string
  totalAyudas: number
  numeroAyudas: number
  ultimaAyuda?: Date
  sectores: string[]
  tipoEntidad: 'persona' | 'empresa' | 'asociacion' | 'otro'
}

export type BuscadorResultType = 'convocatorias' | 'concesiones' | 'beneficiarios' 