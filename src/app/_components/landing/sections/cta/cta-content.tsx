import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export function CtaContent() {
  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">
        ¿Listo para empezar?
      </h2>
      <p className="mx-auto max-w-prose text-lg text-muted-foreground">
        Únete a miles de empresas que ya confían en Zetika para encontrar las mejores subvenciones.
      </p>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Empezar Gratis
        </Link>
        <Link
          href="/signin"
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  )
} 