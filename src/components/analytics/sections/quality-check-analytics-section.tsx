"use client"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionQc } from "@/lib/analytics/partition"
import {
  GET_QUALITYCHECK_DASHBOARD_DATA,
  GET_ORDER_QUALITYCHECK_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function QualityCheckAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_QUALITYCHECK_DASHBOARD_DATA,
      summaryAnalyticsPath: "getOrderQualityCheckDashboardData.analytics",
      drillDocument: GET_ORDER_QUALITYCHECK_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getOrderQualityCheckDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      includeStudioId: false,
      partition: partitionQc,
    })

  return (
    <AnalyticsSectionCard
      title="Quality Check Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid grid-cols-2 gap-3">
        {partitioned.totalQcAnalytics.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value ?? item.total}
          />
        ))}
      </div>
      <AnalyticsCategoryList
        items={partitioned.stylistQcAnalytics}
        onView={openDrillDown}
        drill={drill}
      />
    </AnalyticsSectionCard>
  )
}
