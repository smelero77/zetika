"use client"

import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"

const footerNavigation = {
  product: [
    { name: "Características", href: "#features" },
    { name: "Precios", href: "#pricing" },
    { name: "Testimonios", href: "#testimonials" },
    { name: "FAQ", href: "#faqs" },
  ],
  company: [
    { name: "Acerca de", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "#contact-us" },
    { name: "Prensa", href: "/press" },
  ],
  legal: [
    { name: "Política de Privacidad", href: "/privacy" },
    { name: "Términos de Servicio", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
    { name: "Legal", href: "/legal" },
  ],
  resources: [
    { name: "Guías", href: "/guides" },
    { name: "Documentación", href: "/docs" },
    { name: "Centro de Ayuda", href: "/help" },
    { name: "Estado del Servicio", href: "/status" },
  ],
}

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname !== "/") {
    return null
  }
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold">Producto</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold">Empresa</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold">Recursos</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Logo and Description */}
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">Z</span>
            </div>
            <span className="text-sm font-medium">Zetika</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zetika. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
} 