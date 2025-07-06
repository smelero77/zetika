import type { OverviewType } from "../../types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatOverviewCardValue } from "@/lib/utils"
import { BounceRateChart } from "./bounce-rate-chart"

export function BounceRate({ data }: { data: OverviewType["bounceRate"] }) {
  const formattedValue = formatOverviewCardValue(data.averageValue, "percent")
  const isPositive = data.percentageChange >= 0
  const percentageLabel = `${isPositive ? "+" : ""}${data.percentageChange}% from last month`

  return (
    <Card>
      <CardHeader>
        <CardDescription>Bounce Rate</CardDescription>
        <CardTitle className="text-3xl">{formattedValue}</CardTitle>
        <CardDescription>{percentageLabel}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <BounceRateChart data={data.perMonth} />
      </CardContent>
    </Card>
  )
} 