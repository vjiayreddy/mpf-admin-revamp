export const ANALYTICS_FILTER_PARAMS = {
  stylistId: "stylistId",
  timePeriod: "timePeriod",
  startDate: "startDate",
  endDate: "endDate",
  studioId: "studioId",
} as const

export type AnalyticsTimePeriod =
  | "day"
  | "lastDay"
  | "week"
  | "month"
  | "year"

export const ANALYTICS_TIME_PERIOD_OPTIONS: Array<{
  label: string
  value: AnalyticsTimePeriod
}> = [
  { label: "Today", value: "day" },
  { label: "Yesterday", value: "lastDay" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
]

export const DEFAULT_ANALYTICS_TIME_PERIOD: AnalyticsTimePeriod = "day"
