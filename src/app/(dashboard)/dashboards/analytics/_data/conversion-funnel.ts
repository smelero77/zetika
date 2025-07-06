import type { ConversionFunnelType } from "../types"

export const conversionFunnelData: ConversionFunnelType = {
  period: "Last 30 days",
  funnelSteps: [
    { name: "Page Views", value: 24567 },
    { name: "Add to Cart", value: 12345 },
    { name: "Checkout Started", value: 5678 },
    { name: "Purchase Completed", value: 2345 },
  ],
} 