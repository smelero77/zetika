import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  description?: string
  className?: string
  centered?: boolean
}

export function SectionHeader({ 
  title, 
  description, 
  className,
  centered = true 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "space-y-4",
      centered && "text-center",
      className
    )}>
      <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
      {description && (
        <p className="max-w-prose text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
} 