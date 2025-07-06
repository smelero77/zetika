import type { CoreBenefitType } from "../types"

export const coreBenefitsData: CoreBenefitType[] = [
  {
    title: "Acelera el Desarrollo",
    description:
      "Zetika equipa a los desarrolladores con las últimas herramientas para construir dashboards escalables y modernos con menos fricción.",
    points: [
      "Stack moderno: Next.js 15, React 19, y Tailwind CSS 4",
      "4 aplicaciones listas y más de 20 páginas aceleran la entrega",
      "Reduce el tiempo de configuración y simplifica la reutilización de componentes",
    ],
    images: ["/images/illustrations/misc/whiteboard.svg"],
  },
  {
    title: "Diseñado para Equipos y Usuarios Reales",
    description:
      "Con temas personalizables y accesibilidad integrada, Zetika se adapta sin problemas a las necesidades de tu equipo y la diversidad de usuarios.",
    points: [
      "Componentes Shadcn/UI y Radix UI para una interfaz pulida y accesible",
      "Modo oscuro, modo claro y personalización completa de temas",
      "Componentes responsivos y adaptables para cualquier dispositivo",
    ],
    images: ["/images/illustrations/scenes/scene-03.svg"],
  },
  {
    title: "Listo para Uso en Producción desde el Día Uno",
    description:
      "Zetika incluye características esenciales y listas para producción como autenticación, validación de formularios y componentes de datos ricos.",
    points: [
      "Autenticación segura vía NextAuth.js",
      "Formularios inteligentes con React Hook Form y Zod",
      "Tablas y gráficos interactivos con TanStack Table y Recharts",
    ],
    images: ["/images/illustrations/scenes/scene-02.svg"],
  },
]
