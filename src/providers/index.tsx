import type { ReactNode } from "react"

import { ModeProvider } from "./mode-provider"
import { ThemeProvider } from "./theme-provider"
import { SettingsProvider } from "@/contexts/settings-context"
import { SidebarProvider } from "@/components/ui/sidebar"

export function Providers({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <SettingsProvider>
      <ModeProvider>
        <ThemeProvider>
          <SidebarProvider className="flex flex-col">
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </ModeProvider>
    </SettingsProvider>
  )
} 