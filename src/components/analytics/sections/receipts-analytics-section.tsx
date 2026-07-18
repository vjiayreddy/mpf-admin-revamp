"use client"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionReceipts } from "@/lib/analytics/partition"
import {
  GET_ORDER_RECEIPTS_DASHBOARD_DATA,
  GET_STORE_ORDER_RECEIPTS_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function ReceiptsAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_ORDER_RECEIPTS_DASHBOARD_DATA,
      summaryAnalyticsPath: "getStoreOrderPaymentsDashboardData.analytics",
      drillDocument: GET_STORE_ORDER_RECEIPTS_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getStoreOrderPaymentsDashboardDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      partition: partitionReceipts,
    })

  return (
    <AnalyticsSectionCard
      title="Receipts Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {partitioned.totalNoOfPayments.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value ?? item.total}
          />
        ))}
      </div>
      <AnalyticsCategoryList
        items={partitioned.paymentMode}
        onView={openDrillDown}
        drill={drill}
      />
    </AnalyticsSectionCard>
  )
}
