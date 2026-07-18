"use client"

import { useLazyQuery } from "@apollo/client/react"
import type { DocumentNode } from "graphql"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  buildAnalyticsSummaryVars,
  buildDrillDownFilters,
} from "@/lib/analytics/build-analytics-filter"
import {
  ANALYTICS_DRILL_DOWN_LIMIT,
  type AnalyticsDrillDownRow,
  type AnalyticsItem,
  type AnalyticsSummaryVars,
} from "@/lib/apollo/queries/analytics"

type UseAnalyticsDomainOptions<TPartition> = {
  summaryDocument: DocumentNode
  /** Dot path under data, e.g. "getDashboardData.analytics" */
  summaryAnalyticsPath: string
  drillDocument: DocumentNode
  /** Root field name returning { totalCount, drillDownData } */
  drillRootField: string
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
  includeStudioId?: boolean
  partition: (items: AnalyticsItem[]) => TPartition
  skip?: boolean
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined
    return (acc as Record<string, unknown>)[key]
  }, obj)
}

export function useAnalyticsDomain<TPartition>({
  summaryDocument,
  summaryAnalyticsPath,
  drillDocument,
  drillRootField,
  searchParams,
  defaultPersonalStylistId,
  includeStudioId = true,
  partition,
  skip,
}: UseAnalyticsDomainOptions<TPartition>) {
  const paramsKey = searchParams.toString()

  const summaryVars = useMemo(
    () =>
      buildAnalyticsSummaryVars(searchParams, defaultPersonalStylistId, {
        includeStudioId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey, defaultPersonalStylistId, includeStudioId]
  )

  const [fetchSummary, summaryState] = useLazyQuery(summaryDocument, {
    fetchPolicy: "network-only",
  })
  const [fetchDrill, drillState] = useLazyQuery(drillDocument, {
    fetchPolicy: "network-only",
  })

  const [drillOpen, setDrillOpen] = useState(false)
  const [drillTitle, setDrillTitle] = useState("")
  const [drillPage, setDrillPage] = useState(0)
  const [selectedItem, setSelectedItem] = useState<AnalyticsItem | null>(null)

  useEffect(() => {
    if (skip) return
    void fetchSummary({ variables: summaryVars as AnalyticsSummaryVars })
  }, [fetchSummary, summaryVars, skip])

  const items = useMemo(() => {
    const raw = getByPath(summaryState.data, summaryAnalyticsPath)
    return Array.isArray(raw) ? (raw as AnalyticsItem[]) : []
  }, [summaryState.data, summaryAnalyticsPath])

  const partitioned = useMemo(() => partition(items), [items, partition])

  const drillRoot = drillState.data
    ? (drillState.data as Record<string, unknown>)[drillRootField]
    : null
  const drillRows = useMemo(() => {
    if (!drillRoot || typeof drillRoot !== "object") return []
    const data = (drillRoot as { drillDownData?: AnalyticsDrillDownRow[] })
      .drillDownData
    return Array.isArray(data) ? data : []
  }, [drillRoot])
  const drillTotal =
    drillRoot && typeof drillRoot === "object"
      ? ((drillRoot as { totalCount?: number }).totalCount ?? null)
      : null

  const loadDrill = useCallback(
    async (item: AnalyticsItem, page: number) => {
      setSelectedItem(item)
      setDrillTitle(item.label)
      setDrillPage(page)
      setDrillOpen(true)
      await fetchDrill({
        variables: {
          filters: buildDrillDownFilters(item),
          page: page + 1,
          limit: ANALYTICS_DRILL_DOWN_LIMIT,
        },
      })
    },
    [fetchDrill]
  )

  const openDrillDown = useCallback(
    (item: AnalyticsItem) => {
      void loadDrill(item, 0)
    },
    [loadDrill]
  )

  const onDrillPageChange = useCallback(
    (page: number) => {
      if (!selectedItem) return
      void loadDrill(selectedItem, page)
    },
    [loadDrill, selectedItem]
  )

  const error =
    summaryState.error?.message ??
    (summaryState.error ? "Failed to load analytics" : null)

  return {
    items,
    partitioned,
    loading: summaryState.loading && items.length === 0,
    error,
    openDrillDown,
    drill: {
      open: drillOpen,
      onOpenChange: setDrillOpen,
      title: drillTitle,
      loading: drillState.loading,
      rows: drillRows,
      totalCount: drillTotal,
      page: drillPage,
      onPageChange: onDrillPageChange,
      pageSize: ANALYTICS_DRILL_DOWN_LIMIT,
    },
  }
}
