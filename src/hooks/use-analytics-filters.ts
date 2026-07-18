"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  ANALYTICS_FILTER_PARAMS,
  DEFAULT_ANALYTICS_TIME_PERIOD,
  type AnalyticsTimePeriod,
} from "@/config/analytics-filters"
import { isoRangeForTimePeriod } from "@/lib/analytics/date-range"
import { resolveAnalyticsDateRange } from "@/lib/analytics/build-analytics-filter"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

export function useAnalyticsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const defaultPersonalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const paramsKey = searchParams.toString()
  const params = useMemo(
    () => new URLSearchParams(paramsKey),
    [paramsKey]
  )

  const range = useMemo(() => resolveAnalyticsDateRange(params), [params])

  const stylistId = params.get(ANALYTICS_FILTER_PARAMS.stylistId) ?? ""
  const studioId = params.get(ANALYTICS_FILTER_PARAMS.studioId) ?? ""
  const timePeriod =
    (params.get(ANALYTICS_FILTER_PARAMS.timePeriod) as AnalyticsTimePeriod) ||
    range.timePeriod ||
    DEFAULT_ANALYTICS_TIME_PERIOD

  const replaceParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(paramsKey)
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") next.delete(key)
        else next.set(key, value)
      }
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [paramsKey, pathname, router]
  )

  const setStylistId = useCallback(
    (value: string) => {
      replaceParams({ [ANALYTICS_FILTER_PARAMS.stylistId]: value || null })
    },
    [replaceParams]
  )

  const setTimePeriod = useCallback(
    (period: AnalyticsTimePeriod) => {
      const { startDate, endDate } = isoRangeForTimePeriod(period)
      replaceParams({
        [ANALYTICS_FILTER_PARAMS.timePeriod]: period,
        [ANALYTICS_FILTER_PARAMS.startDate]: startDate,
        [ANALYTICS_FILTER_PARAMS.endDate]: endDate,
      })
    },
    [replaceParams]
  )

  const setStudioIds = useCallback(
    (ids: string[]) => {
      replaceParams({
        [ANALYTICS_FILTER_PARAMS.studioId]:
          ids.length > 0 ? ids.join(",") : null,
      })
    },
    [replaceParams]
  )

  const setCustomDateRange = useCallback(
    (startInput: string, endInput: string) => {
      const startDate = dateInputToIso(startInput)
      let endDate = dateInputToIso(endInput)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        endDate = end.toISOString()
      }
      replaceParams({
        [ANALYTICS_FILTER_PARAMS.timePeriod]: null,
        [ANALYTICS_FILTER_PARAMS.startDate]: startDate,
        [ANALYTICS_FILTER_PARAMS.endDate]: endDate,
      })
    },
    [replaceParams]
  )

  const clearFilters = useCallback(() => {
    const { startDate, endDate } = isoRangeForTimePeriod(
      DEFAULT_ANALYTICS_TIME_PERIOD
    )
    replaceParams({
      [ANALYTICS_FILTER_PARAMS.stylistId]: null,
      [ANALYTICS_FILTER_PARAMS.studioId]: null,
      [ANALYTICS_FILTER_PARAMS.timePeriod]: DEFAULT_ANALYTICS_TIME_PERIOD,
      [ANALYTICS_FILTER_PARAMS.startDate]: startDate,
      [ANALYTICS_FILTER_PARAMS.endDate]: endDate,
    })
  }, [replaceParams])

  return {
    searchParams: params,
    defaultPersonalStylistId,
    stylistId,
    studioId,
    studioIds: studioId
      ? studioId.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    timePeriod,
    startDateInput: isoToDateInput(range.startDate),
    endDateInput: isoToDateInput(range.endDate),
    setStylistId,
    setTimePeriod,
    setStudioIds,
    setCustomDateRange,
    clearFilters,
    replaceParams,
  }
}
