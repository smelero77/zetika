import "../styles/globals.css"

import { cn } from "@/lib/utils"

import { Providers } from "@/providers"
import { ThemeScript } from "@/components/theme-script"

import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"

// Define metadata for the application
export const metadata: Metadata = {
  title: {
    template: "%s | Zetika",
    default: "Zetika - Encuentra las mejores subvenciones",
  },
  description: "Plataforma líder para encontrar y gestionar convocatorias de subvenciones públicas en España.",
  metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" dir="ltr" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen flex flex-col",
          "bg-background text-foreground antialiased overscroll-none"
        )}
        suppressHydrationWarning
      >
        <Providers>
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  )
} 