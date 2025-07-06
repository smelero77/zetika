"use client"

import { Line, LineChart } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { OverviewType } from "../../types"

import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Conversion Rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ConversionRateChart({
  data,
}: {
  data: OverviewType["conversionRate"]["perMonth"]
}) {
  return (
    <ChartContainer config={chartConfig} className="h-[90px] w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <Line
          type="monotone"
          strokeWidth={2}
          dataKey="value"
          stroke="var(--color-value)"
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
} 