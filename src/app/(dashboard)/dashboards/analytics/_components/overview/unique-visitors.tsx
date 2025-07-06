import type { OverviewType } from "../../types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatOverviewCardValue } from "@/lib/utils"
import { UniqueVisitorsChart } from "./unique-visitors-chart"

export function UniqueVisitors({
  data,
}: {
  data: OverviewType["uniqueVisitors"]
}) {
  const formattedValue = formatOverviewCardValue(data.averageValue, "regular")
  const isPositive = data.percentageChange >= 0
  const percentageLabel = `${isPositive ? "+" : ""}${data.percentageChange}% from last month`

  return (
    <Card>
      <CardHeader>
        <CardDescription>Unique Visitors</CardDescription>
        <CardTitle className="text-3xl">{formattedValue}</CardTitle>
        <CardDescription>{percentageLabel}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <UniqueVisitorsChart data={data.perMonth} />
      </CardContent>
    </Card>
  )
} 