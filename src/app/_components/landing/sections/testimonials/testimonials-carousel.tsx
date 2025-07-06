import { whatPeopleSayData } from "../../_data/what-people-say"

import { TestimonialCard } from "./testimonial-card"

export function TestimonialsCarousel() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {whatPeopleSayData.map((testimonial) => (
        <TestimonialCard key={testimonial.name} {...testimonial} />
      ))}
    </div>
  )
} 