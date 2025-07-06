"use client"

import { Area, AreaChart } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { OverviewType } from "../../types"

import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Duration",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function AverageSessionDurationChart({
  data,
}: {
  data: OverviewType["averageSessionDuration"]["perMonth"]
}) {
  return (
    <ChartContainer config={chartConfig} className="relative size-full h-[90px]">
      <AreaChart
        data={data}
        margin={{
          left: 0,
          right: 0,
        }}
        className="size-fit"
      >
        <Area
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.05}
          stroke="var(--color-value)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  )
} 