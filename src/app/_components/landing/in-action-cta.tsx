import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function InActionCTA() {
  return (
    <section id="ready-to-build" className="container">
      <Card className="flex flex-col justify-evenly items-center gap-3 text-center px-6 py-12 md:flex-row md:text-start">
        <div className="space-y-1.5">
          <h2 className="text-3xl md:text-4xl font-semibold">
            ¿Quieres ver Zetika en acción?
          </h2>
          <p className="max-w-prose mx-auto text-sm text-muted-foreground">
            Explora la demo en vivo o revisa la documentación para aprender cómo
            Zetika puede acelerar tu desarrollo.
          </p>
        </div>
        <div className="flex gap-2 md:flex-col">
          <Link
            href="/dashboards/analytics"
            className={buttonVariants({ size: "lg" })}
          >
            Demo
          </Link>
          <Link
            href="/docs"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Documentación
          </Link>
        </div>
      </Card>
    </section>
  )
} 