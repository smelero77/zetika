import { FeaturesGrid } from "./features-grid"

export function CoreFeatures() {
  return (
    <section className="container space-y-16">
      <div className="grid place-items-center text-center gap-y-4">
        <h2 className="text-4xl font-bold">
          Características principales
        </h2>
        <p className="max-w-prose text-lg text-muted-foreground">
          Todo lo que necesitas para encontrar y gestionar subvenciones de manera eficiente
        </p>
      </div>
      <FeaturesGrid />
    </section>
  )
} 