import { coreFeaturesData } from "../../_data/core-features"

import { FeatureCard } from "./feature-card"

export function FeaturesGrid() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {coreFeaturesData.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  )
} 