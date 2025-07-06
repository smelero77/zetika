import type { TrafficSourcesType } from "../types"

export const trafficSourcesData: TrafficSourcesType = {
  period: "Last 30 days",
  sources: [
    {
      name: "Organic Search",
      visitors: 12500,
      fill: "hsl(var(--chart-1))",
      percentageChange: 12.5,
      icon: "search",
    },
    {
      name: "Direct",
      visitors: 8900,
      fill: "hsl(var(--chart-2))",
      percentageChange: 8.2,
      icon: "link",
    },
    {
      name: "Social Media",
      visitors: 6700,
      fill: "hsl(var(--chart-3))",
      percentageChange: -2.1,
      icon: "share-2",
    },
    {
      name: "Referral",
      visitors: 4200,
      fill: "hsl(var(--chart-4))",
      percentageChange: 15.3,
      icon: "external-link",
    },
    {
      name: "Email",
      visitors: 2800,
      fill: "hsl(var(--chart-5))",
      percentageChange: 5.7,
      icon: "mail",
    },
  ],
} 