import type { OverviewType } from "../types"

export const overviewData: OverviewType = {
  uniqueVisitors: {
    averageValue: 24567,
    percentageChange: 12.5,
    perMonth: [
      { month: "Jan", value: 22000, fill: "hsl(var(--chart-1))" },
      { month: "Feb", value: 23500, fill: "hsl(var(--chart-1))" },
      { month: "Mar", value: 24000, fill: "hsl(var(--chart-1))" },
      { month: "Apr", value: 23800, fill: "hsl(var(--chart-1))" },
      { month: "May", value: 24200, fill: "hsl(var(--chart-1))" },
      { month: "Jun", value: 24567, fill: "hsl(var(--chart-1))" },
    ],
  },
  averageSessionDuration: {
    averageValue: 245,
    percentageChange: -2.1,
    perMonth: [
      { month: "Jan", value: 250, fill: "hsl(var(--chart-2))" },
      { month: "Feb", value: 248, fill: "hsl(var(--chart-2))" },
      { month: "Mar", value: 246, fill: "hsl(var(--chart-2))" },
      { month: "Apr", value: 247, fill: "hsl(var(--chart-2))" },
      { month: "May", value: 244, fill: "hsl(var(--chart-2))" },
      { month: "Jun", value: 245, fill: "hsl(var(--chart-2))" },
    ],
  },
  bounceRate: {
    averageValue: 32.1,
    percentageChange: 1.2,
    perMonth: [
      { month: "Jan", value: 31.5, fill: "hsl(var(--chart-3))" },
      { month: "Feb", value: 31.8, fill: "hsl(var(--chart-3))" },
      { month: "Mar", value: 32.0, fill: "hsl(var(--chart-3))" },
      { month: "Apr", value: 32.2, fill: "hsl(var(--chart-3))" },
      { month: "May", value: 32.1, fill: "hsl(var(--chart-3))" },
      { month: "Jun", value: 32.1, fill: "hsl(var(--chart-3))" },
    ],
  },
  conversionRate: {
    averageValue: 3.2,
    percentageChange: 8.7,
    perMonth: [
      { month: "Jan", value: 2.9, fill: "hsl(var(--chart-4))" },
      { month: "Feb", value: 3.0, fill: "hsl(var(--chart-4))" },
      { month: "Mar", value: 3.1, fill: "hsl(var(--chart-4))" },
      { month: "Apr", value: 3.2, fill: "hsl(var(--chart-4))" },
      { month: "May", value: 3.3, fill: "hsl(var(--chart-4))" },
      { month: "Jun", value: 3.2, fill: "hsl(var(--chart-4))" },
    ],
  },
} 