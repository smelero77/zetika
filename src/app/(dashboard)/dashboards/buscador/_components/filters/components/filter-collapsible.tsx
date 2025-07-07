import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FilterCollapsibleProps {
  isOpen: boolean
  onToggle: () => void
  icon: ReactNode
  title: string
  children: ReactNode
}

export function FilterCollapsible({ 
  isOpen, 
  onToggle, 
  icon, 
  title, 
  children 
}: FilterCollapsibleProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer hover:text-primary py-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm lg:text-base">{title}</span>
          </div>
          <ChevronDown 
            className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 lg:space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
} 