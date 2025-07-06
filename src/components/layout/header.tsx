"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { FullscreenToggle } from "@/components/layout/full-screen-toggle"
import { NotificationDropdown } from "@/components/layout/notification-dropdown"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { ModeDropdown } from "@/components/mode-dropdown"
import { ToggleMobileSidebar } from "@/components/layout/toggle-mobile-sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
      <div className="container flex h-14 justify-between items-center gap-4">
        <ToggleMobileSidebar />
        <div className="grow flex justify-end gap-2">
          <SidebarTrigger className="hidden lg:flex lg:me-auto" />
          <NotificationDropdown />
          <FullscreenToggle />
          <ModeDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
} 