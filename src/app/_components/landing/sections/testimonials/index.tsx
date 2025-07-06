import { SectionWrapper } from "../../shared/section-wrapper"
import { SectionHeader } from "../../shared/section-header"
import { TestimonialsCarousel } from "./testimonials-carousel"

export function WhatPeopleSay() {
  return (
    <SectionWrapper>
      <div className="space-y-16">
        <SectionHeader
          title="Lo que dicen nuestros usuarios"
          description="Descubre por qué más de 1,000 empresas confían en Zetika para encontrar subvenciones"
        />
        <TestimonialsCarousel />
      </div>
    </SectionWrapper>
  )
} 