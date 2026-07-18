"use client"

import { useMemo, useState } from "react"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionOrders } from "@/lib/analytics/partition"
import {
  GET_ORDER_DASHBOARD_DATA,
  GET_STORE_ORDER_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function OrdersAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const [tab, setTab] = useState("studio")
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_ORDER_DASHBOARD_DATA,
      summaryAnalyticsPath: "getStoreOrderDashboardData.analytics",
      drillDocument: GET_STORE_ORDER_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getStoreOrderDashboardDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      partition: partitionOrders,
    })

  const listItems = useMemo(() => {
    switch (tab) {
      case "products":
        return partitioned.productOrders
      case "source":
        return partitioned.sourceOrders
      case "stylist":
        return partitioned.stylistOrders
      case "occasion":
        return partitioned.ocassionOrders
      default:
        return partitioned.studioOrders
    }
  }, [tab, partitioned])

  return (
    <AnalyticsSectionCard
      title="Orders Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {partitioned.totalOrders.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value ?? item.total}
          />
        ))}
      </div>
      <AnalyticsTabs
        tabs={[
          { id: "studio", label: "Studio" },
          { id: "products", label: "Products" },
          { id: "source", label: "Source" },
          { id: "stylist", label: "Stylist" },
          { id: "occasion", label: "Occasion" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <AnalyticsCategoryList
        items={listItems}
        onView={openDrillDown}
        drill={drill}
      />
    </AnalyticsSectionCard>
  )
}
