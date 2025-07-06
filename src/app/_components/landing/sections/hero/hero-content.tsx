import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SocialProofBadgeAvatarsData } from "../../_data/social-proof-badge-avatars"

import { cn } from "@/lib/utils"

import { AvatarStack } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"

export function HeroContent() {
  return (
    <div className="grid place-items-center text-center gap-y-4">
      <SocialProofBadge />
      <h1 className="text-4xl md:text-6xl font-black leading-none">
        Encuentra las mejores subvenciones
      </h1>
      <p className="max-w-prose w-full text-lg text-muted-foreground">
        Plataforma líder para encontrar y gestionar convocatorias de subvenciones públicas en España. 
        Búsqueda inteligente, alertas personalizadas y matching automático.
      </p>
      <div className="flex gap-x-2">
        <Link
          href="/signup"
          className={buttonVariants({ size: "lg" })}
        >
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

function SocialProofBadge() {
  return (
    <div
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "group gap-x-1.5"
      )}
    >
      <AvatarStack
        avatars={SocialProofBadgeAvatarsData}
        size="sm"
        className="me-1.5"
        avatarClassName="h-7 w-7"
      />
      Confiado por más de 1,000 empresas en España
      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-in-out ltr:group-hover:translate-x-0.5 rtl:scale-x-[-1] rtl:group-hover:-translate-x-0.5" />
    </div>
  )
} 