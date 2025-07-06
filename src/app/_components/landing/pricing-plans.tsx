import { pricingPlansData } from "./_data/pricing-plans"
import { PricingPlansList } from "./pricing-plans-list"

export function PricingPlans() {
  return (
    <section id="pricing" className="container grid gap-8">
      <div className="text-center mx-auto space-y-1.5">
        <h2 className="text-3xl md:text-4xl font-semibold">Planes de Precios</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Elige el plan que mejor se adapte a las necesidades de tu empresa.
        </p>
      </div>
      <PricingPlansList data={pricingPlansData} />
    </section>
  )
} 