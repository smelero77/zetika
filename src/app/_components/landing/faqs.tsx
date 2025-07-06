import Link from "next/link"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import { FaqsList } from "./faqs-list"

export function Faqs() {
  return (
    <section id="faq" className="container grid gap-8">
      <div className="text-center mx-auto space-y-1.5">
        <h2 className="text-3xl md:text-4xl font-semibold">Preguntas Frecuentes</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Respuestas a las preguntas más comunes sobre nuestra plataforma.
        </p>
      </div>
      <FaqsList />
    </section>
  )
} 