import { cn } from "@/lib/utils"

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  container?: boolean
}

export function SectionWrapper({ 
  children, 
  className,
  container = true 
}: SectionWrapperProps) {
  return (
    <section className={cn("py-16", className)}>
      {container ? (
        <div className="container mx-auto">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
} 