import type { Metadata } from "next"

import { Hero } from "@/app/_components/landing/sections/hero"
import { CoreFeatures } from "@/app/_components/landing/sections/features"
import { CoreBenefits } from "@/app/_components/landing/core-benefits"
import { WhatPeopleSay } from "@/app/_components/landing/sections/testimonials"
import { ReadyToBuildCTA } from "@/app/_components/landing/sections/cta"
import { InActionCTA } from "@/app/_components/landing/in-action-cta"
import { PricingPlans } from "@/app/_components/landing/pricing-plans"
import { Faqs } from "@/app/_components/landing/faqs"
import { ContactUs } from "@/app/_components/landing/contact-us"
import { TrustedBy } from "@/app/_components/landing/trusted-by"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata: Metadata = {
  title: "Zetika - Encuentra las mejores subvenciones",
  description: "Plataforma líder para encontrar y gestionar convocatorias de subvenciones públicas en España. Búsqueda inteligente, alertas personalizadas y matching automático.",
}

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <div className="w-full min-h-screen bg-muted/40">
        <div className="flex flex-col space-y-16">
        <Hero />
        <TrustedBy />
        <CoreBenefits />
        <WhatPeopleSay />
        <ReadyToBuildCTA />
        <CoreFeatures />
        <InActionCTA />
        <PricingPlans />
        <Faqs />
        <ContactUs />
        <SiteFooter />
        </div>
      </div>
    </>
  )
} 