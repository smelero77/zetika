import { HeroContent } from "./hero-content"
import { HeroImage } from "./hero-image"

export function Hero() {
  return (
    <section className="container space-y-10 pt-20">
      <HeroContent />
      <HeroImage />
    </section>
  )
} 