import type { AnalyticsTimePeriod } from "@/config/analytics-filters"
import {
  endDateFilter,
  startDateFilter,
  type MpfDateFilter,
} from "@/lib/customers/date-filter"

function startOfLocalDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfLocalDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfWeek(date: Date) {
  const d = startOfLocalDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return endOfLocalDay(end)
}

function startOfMonth(date: Date) {
  return startOfLocalDay(new Date(date.getFullYear(), date.getMonth(), 1))
}

function endOfMonth(date: Date) {
  return endOfLocalDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

function startOfYear(date: Date) {
  return startOfLocalDay(new Date(date.getFullYear(), 0, 1))
}

function endOfYear(date: Date) {
  return endOfLocalDay(new Date(date.getFullYear(), 11, 31))
}

export function rangeForTimePeriod(period: AnalyticsTimePeriod): {
  start: Date
  end: Date
} {
  const now = new Date()
  if (period === "lastDay") {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      start: startOfLocalDay(yesterday),
      end: endOfLocalDay(yesterday),
    }
  }
  if (period === "week") {
    return { start: startOfWeek(now), end: endOfWeek(now) }
  }
  if (period === "month") {
    return { start: startOfMonth(now), end: endOfMonth(now) }
  }
  if (period === "year") {
    return { start: startOfYear(now), end: endOfYear(now) }
  }
  return { start: startOfLocalDay(now), end: endOfLocalDay(now) }
}

export function isoRangeForTimePeriod(period: AnalyticsTimePeriod): {
  startDate: string
  endDate: string
} {
  const { start, end } = rangeForTimePeriod(period)
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

/** Legacy extractDateFormateForAnalytics — START_DATE hour=0 / END_DATE hour=23. */
export function extractDateFormatForAnalytics(
  isoOrDate: string | Date,
  type: "START_DATE" | "END_DATE"
): MpfDateFilter {
  return type === "START_DATE"
    ? startDateFilter(
        typeof isoOrDate === "string" ? isoOrDate : isoOrDate.toISOString()
      )
    : endDateFilter(
        typeof isoOrDate === "string" ? isoOrDate : isoOrDate.toISOString()
      )
}
