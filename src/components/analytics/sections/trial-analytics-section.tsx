"use client"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionTrial } from "@/lib/analytics/partition"
import {
  GET_TRIAL_DASHBOARD_DATA,
  GET_ORDER_TRIAL_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function TrialAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_TRIAL_DASHBOARD_DATA,
      summaryAnalyticsPath: "getOrderTrialDashboardData.analytics",
      drillDocument: GET_ORDER_TRIAL_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getOrderTrialDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      includeStudioId: false,
      partition: partitionTrial,
    })

  return (
    <AnalyticsSectionCard
      title="Trial Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid grid-cols-2 gap-3">
        {partitioned.totalTrials.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value ?? item.total}
          />
        ))}
      </div>
      <AnalyticsCategoryList
        items={partitioned.stylistTrial}
        onView={openDrillDown}
        drill={drill}
      />
    </AnalyticsSectionCard>
  )
}
