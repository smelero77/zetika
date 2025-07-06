import type { OverviewType } from "../../types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatOverviewCardValue } from "@/lib/utils"
import { AverageSessionDurationChart } from "./average-session-duration-chart"

export function AverageSessionDuration({
  data,
}: {
  data: OverviewType["averageSessionDuration"]
}) {
  const formattedValue = formatOverviewCardValue(data.averageValue, "duration")
  const isPositive = data.percentageChange >= 0
  const percentageLabel = `${isPositive ? "+" : ""}${data.percentageChange}% from last month`

  return (
    <Card className="relative flex flex-col pb-0">
      <CardHeader>
        <CardDescription>Avg. Session Duration</CardDescription>
        <CardTitle className="text-3xl">{formattedValue}</CardTitle>
        <CardDescription>{percentageLabel}</CardDescription>
      </CardHeader>
      <CardContent className="relative mt-auto flex-1 p-0">
        <AverageSessionDurationChart data={data.perMonth} />
      </CardContent>
    </Card>
  )
} 