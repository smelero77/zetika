import { CoreBenefitsList } from "./core-benefits-list"

export function CoreBenefits() {
  return (
    <section id="benefits" className="container grid gap-8">
      <div className="text-center mx-auto space-y-1.5">
        <h2 className="text-3xl md:text-4xl font-semibold">Beneficios Principales</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Zetika ofrece beneficios reales desde el primer día: configuración rápida,
          temas flexibles y características listas para producción que escalan con tu equipo.
        </p>
      </div>
      <CoreBenefitsList />
    </section>
  )
} 