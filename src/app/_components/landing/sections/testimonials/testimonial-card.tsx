import Image from "next/image"
import { Star } from "lucide-react"

import type { TestimonialType } from "../../types"

import { Card } from "@/components/ui/card"

interface TestimonialCardProps extends TestimonialType {}

export function TestimonialCard({ 
  name, 
  role, 
  company, 
  content, 
  avatar, 
  rating 
}: TestimonialCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Image
          src={avatar}
          alt={name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{role} en {company}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{content}</p>
    </Card>
  )
} 