import {
  ANALYTICS_FILTER_PARAMS,
  DEFAULT_ANALYTICS_TIME_PERIOD,
  type AnalyticsTimePeriod,
} from "@/config/analytics-filters"
import {
  extractDateFormatForAnalytics,
  isoRangeForTimePeriod,
} from "@/lib/analytics/date-range"
import type {
  AnalyticsFilterParams,
  AnalyticsItem,
  AnalyticsRoleFilter,
  AnalyticsSummaryVars,
} from "@/lib/apollo/queries/analytics"
import type { MpfDateFilter } from "@/lib/customers/date-filter"

function splitCsv(value: string | null): string[] | undefined {
  if (!value) return undefined
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

function isTimePeriod(value: string | null): value is AnalyticsTimePeriod {
  return (
    value === "day" ||
    value === "lastDay" ||
    value === "week" ||
    value === "month" ||
    value === "year"
  )
}

export function resolveAnalyticsDateRange(searchParams: URLSearchParams): {
  startDate: string
  endDate: string
  timePeriod: AnalyticsTimePeriod | null
} {
  const p = ANALYTICS_FILTER_PARAMS
  const start = searchParams.get(p.startDate)
  const end = searchParams.get(p.endDate)
  const periodRaw = searchParams.get(p.timePeriod)
  const timePeriod = isTimePeriod(periodRaw) ? periodRaw : null

  if (start && end) {
    return { startDate: start, endDate: end, timePeriod }
  }

  const period = timePeriod ?? DEFAULT_ANALYTICS_TIME_PERIOD
  const range = isoRangeForTimePeriod(period)
  return { ...range, timePeriod: period }
}

export function buildAnalyticsSummaryVars(
  searchParams: URLSearchParams,
  defaultPersonalStylistId?: string | null,
  options?: { includeStudioId?: boolean }
): AnalyticsSummaryVars {
  const p = ANALYTICS_FILTER_PARAMS
  const { startDate, endDate } = resolveAnalyticsDateRange(searchParams)

  const stylistId = searchParams.get(p.stylistId)
  const roleFilter: AnalyticsRoleFilter | null = stylistId
    ? { _id: stylistId, roleIdentifier: "personal_stylist" }
    : defaultPersonalStylistId
      ? {
          _id: defaultPersonalStylistId,
          roleIdentifier: "personal_stylist",
        }
      : null

  const vars: AnalyticsSummaryVars = {
    startDate: extractDateFormatForAnalytics(startDate, "START_DATE"),
    endDate: extractDateFormatForAnalytics(endDate, "END_DATE"),
    roleFilter,
  }

  if (options?.includeStudioId !== false) {
    const studioId = splitCsv(searchParams.get(p.studioId))
    if (studioId) vars.studioId = studioId
  }

  return vars
}

export function buildDrillDownFilters(
  item: AnalyticsItem
): Record<string, unknown> {
  const fp = item.filterParams
  if (!fp) return {}

  const filters: Record<string, unknown> = {}
  if (fp.dateAttribute) filters.dateAttribute = fp.dateAttribute
  if (fp.identifier) filters.identifier = fp.identifier
  if (fp.groupById) filters.groupById = fp.groupById
  if (fp.groupByIdAttribute) {
    filters.groupByIdAttribute = fp.groupByIdAttribute
  }
  if (fp.studioId != null) filters.studioId = fp.studioId
  if (fp.roleFilter) {
    filters.roleFilter = {
      _id: fp.roleFilter._id,
      roleIdentifier: fp.roleFilter.roleIdentifier,
    }
  }
  if (fp.startDate) filters.startDate = pickDateParts(fp.startDate)
  if (fp.endDate) filters.endDate = pickDateParts(fp.endDate)
  return filters
}

function pickDateParts(
  parts: NonNullable<AnalyticsFilterParams["startDate"]>
): MpfDateFilter {
  return {
    day: Number(parts.day ?? 0),
    month: Number(parts.month ?? 0),
    year: Number(parts.year ?? 0),
    hour: Number(parts.hour ?? 0),
    minute: Number(parts.minute ?? 0),
    timestamp: String(parts.timestamp ?? ""),
    datestamp: String(parts.datestamp ?? ""),
  }
}

export function displayAnalyticsLabel(label: string): string {
  if (label.includes("Source: ")) return label.replace("Source: ", "").trim()
  return label
}
