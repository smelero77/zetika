"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useMedia } from "react-use"
import { ChevronDown, Search } from "lucide-react"

import type { NavigationNestedItem, NavigationRootItem } from "@/types"
import type { DialogProps } from "@radix-ui/react-dialog"

import { sidebarNavigationData } from "../_data/sidebar-navigation"

import { cn, isActivePathname } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"
import { Keyboard } from "@/components/ui/keyboard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DynamicIcon } from "@/components/dynamic-icon"

interface DocsCommandMenuProps extends DialogProps {
  buttonClassName?: string
}

export function DocsCommandMenu({
  buttonClassName,
  ...props
}: DocsCommandMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isLargeOrLarger = useMedia("(min-width: 1024px)")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const renderMenuItem = (item: NavigationRootItem | NavigationNestedItem) => {
    const title = item.title
    const label = item.label

    // If the item has nested items, render it with a collapsible dropdown.
    if (item.items) {
      return (
        <Collapsible key={item.title} className="group/collapsible">
          <CommandItem asChild>
            <CollapsibleTrigger className="w-full flex justify-between items-center gap-2 px-2 py-1.5 [&[data-state=open]>svg]:rotate-180">
              <span className="flex items-center gap-2">
                {"iconName" in item && (
                  <DynamicIcon name={item.iconName} className="h-4 w-4" />
                )}
                <span>{title}</span>
                {"label" in item && <Badge variant="secondary">{label}</Badge>}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </CollapsibleTrigger>
          </CommandItem>
          <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            {item.items.map((subItem: NavigationNestedItem) =>
              renderMenuItem(subItem)
            )}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    // Otherwise, render the item with a link.
    if ("href" in item) {
      const isActive = isActivePathname(item.href, pathname)

      return (
        <CommandItem
          key={item.title}
          onSelect={() => runCommand(() => router.push(item.href))}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5",
            isActive && "bg-accent"
          )}
        >
          {"iconName" in item ? (
            <DynamicIcon name={item.iconName} />
          ) : (
            <DynamicIcon name="Circle" />
          )}
          <span>{title}</span>
          {label && <Badge variant="secondary">{label}</Badge>}
        </CommandItem>
      )
    }
  }

  return (
    <>
      {isLargeOrLarger ? (
        <Button
          variant="outline"
          className={cn(
            "h-8 w-64 justify-start rounded-md bg-muted/50 text-muted-foreground",
            buttonClassName
          )}
          onClick={() => setOpen(true)}
          {...props}
        >
          <Search className="me-2 h-4 w-4" />
          <span>Search...</span>
          <Keyboard className="ms-auto">K</Keyboard>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className={buttonClassName}
          onClick={() => setOpen(true)}
          aria-label="Search"
          {...props}
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen} {...props}>
        <DialogTitle className="sr-only">Search Menu</DialogTitle>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <ScrollArea className="h-[300px] max-h-[300px]">
            {sidebarNavigationData.map((nav) => {
              const title = nav.title

              return (
                <CommandGroup
                  key={nav.title}
                  heading={title}
                  className="[&_[cmdk-group-items]]:space-y-1"
                >
                  {nav.items.map((item: NavigationRootItem) => (
                    <Fragment key={item.title}>{renderMenuItem(item)}</Fragment>
                  ))}
                </CommandGroup>
              )
            })}
          </ScrollArea>
        </CommandList>
      </CommandDialog>
    </>
  )
}
