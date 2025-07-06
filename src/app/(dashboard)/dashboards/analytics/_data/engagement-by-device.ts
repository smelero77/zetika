import type { EngagementByDeviceType } from "../types"

export const engagementByDeviceData: EngagementByDeviceType[] = [
  {
    deviceType: "Desktop",
    sessionDuration: 320,
    pagesPerSession: 4.2,
    bounceRate: 28.5,
    userPercentage: 45.2,
    conversionRate: 4.1,
  },
  {
    deviceType: "Mobile",
    sessionDuration: 180,
    pagesPerSession: 2.8,
    bounceRate: 38.7,
    userPercentage: 42.1,
    conversionRate: 2.8,
  },
  {
    deviceType: "Tablet",
    sessionDuration: 240,
    pagesPerSession: 3.5,
    bounceRate: 32.1,
    userPercentage: 12.7,
    conversionRate: 3.2,
  },
] 