"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Github, Twitter, Mail, ChevronRight, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  "Características",
  "Precios", 
  "Testimonios",
  "Recursos",
  "FAQ"
]

export function SiteHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (pathname !== "/") {
    return null
  }

  const handleThemeToggle = () => {
    if (mounted) {
      setTheme(theme === "light" ? "dark" : "light")
    }
  }

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetId = e.currentTarget.getAttribute("href")?.slice(1)
    if (!targetId) return

    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 border-b border-border/20 bg-background/95",
        isScrolled && "bg-background/90 shadow-sm"
      )}
    >
      <div className="container mx-auto flex h-16 px-4 md:px-6 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 font-bold text-foreground hover:text-foreground/80 transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">Z</span>
            </div>
            <span>Zetika</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-8 items-center">
          {navigation.map((item, i) => {
            const href = item === "Recursos" ? "#resources" : `#${item.toLowerCase()}`
            return (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                href={href}
                onClick={handleScrollToSection}
                className="text-xs lg:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative group py-2"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex gap-4 items-center">
          {/* GitHub Link */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <Button variant="ghost" asChild>
              <a
                href="https://github.com/tu-usuario"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold"
              >
                <Github className="size-4" />
                GitHub
              </a>
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={handleThemeToggle}
              className="rounded-full transition-transform hover:scale-105"
              disabled={!mounted}
            >
              {mounted && theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Link href="/signup">
              <Button className="rounded-full transition-all hover:scale-105 hover:shadow-md font-medium">
                Empezar Gratis
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="rounded-full"
            disabled={!mounted}
          >
            {mounted && theme === "light" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/20"
          >
            <div className="container mx-auto py-4 flex flex-col gap-4 px-4 max-w-7xl">
              {navigation.map((item, i) => {
                const href = item === "Recursos" ? "#resources" : `#${item.toLowerCase()}`
                return (
                  <motion.a
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    href={href}
                    onClick={(e) => {
                      handleScrollToSection(e)
                      setMobileMenuOpen(false)
                    }}
                    className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative overflow-hidden group"
                  >
                    <span className="relative z-10">{item}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </motion.a>
                )
              })}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="pt-2 mt-2 border-t border-border/30"
              >
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full rounded-full transition-all hover:shadow-md">
                    Empezar Gratis
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Mobile Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="flex gap-4 justify-center pt-2"
              >
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://github.com/tu-usuario" target="_blank" rel="noopener noreferrer">
                    <Github className="size-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://twitter.com/tu-usuario" target="_blank" rel="noopener noreferrer">
                    <Twitter className="size-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="mailto:contacto@zetika.com">
                    <Mail className="size-4" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
} 