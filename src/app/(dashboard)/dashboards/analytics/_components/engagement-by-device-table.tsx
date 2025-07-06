"use client"

import type { EngagementByDeviceType } from "../types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface EngagementByDeviceTableProps {
  data: EngagementByDeviceType[]
}

export function EngagementByDeviceTable({
  data,
}: EngagementByDeviceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement by Device</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Type</TableHead>
              <TableHead>Session Duration</TableHead>
              <TableHead>Pages Per Session</TableHead>
              <TableHead>Bounce Rate</TableHead>
              <TableHead>User Percentage</TableHead>
              <TableHead>Conversion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((device) => (
              <TableRow key={device.deviceType}>
                <TableCell className="font-medium">{device.deviceType}</TableCell>
                <TableCell>{device.sessionDuration}s</TableCell>
                <TableCell>{device.pagesPerSession}</TableCell>
                <TableCell>{device.bounceRate}%</TableCell>
                <TableCell>{device.userPercentage}%</TableCell>
                <TableCell>{device.conversionRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 