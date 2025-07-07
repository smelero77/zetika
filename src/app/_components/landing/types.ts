import type { ReactNode } from "react"

export interface CoreFeatureType {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
  header?: ReactNode
}

export interface TestimonialType {
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
}

export interface PricingPlanType {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
  href: string
}

export interface BenefitType {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  image?: string
}

export interface CoreBenefitType {
  title: string
  description: string
  points?: string[]
  images?: string[]
} 