"use client"

import { useMemo, useState } from "react"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionEmb } from "@/lib/analytics/partition"
import {
  GET_EMB_DASHBOARD_DATA,
  GET_EMB_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function EmbAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const [tab, setTab] = useState("work")
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_EMB_DASHBOARD_DATA,
      summaryAnalyticsPath: "getEmbroideryDashboardData.analytics",
      drillDocument: GET_EMB_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getEmbroideryDashboardDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      partition: partitionEmb,
    })

  const listItems = useMemo(() => {
    switch (tab) {
      case "marking":
        return partitioned.embMarkingStatusOrders
      case "approval":
        return partitioned.embApprovalStatusOrders
      case "status":
        return partitioned.embStatusOrders
      case "product":
        return partitioned.productEmbOrders
      case "duration":
        return partitioned.embDurationRangeOrders
      default:
        return partitioned.embWorkTypeOrders
    }
  }, [tab, partitioned])

  const kpis = useMemo(() => {
    const seen = new Set<string>()
    const out = [
      ...partitioned.totalEmbCount,
      ...partitioned.totalEmbAmount,
      ...partitioned.zeroValueEmb,
      ...partitioned.avgDuration,
    ].filter((item) => {
      if (seen.has(item.label)) return false
      seen.add(item.label)
      return true
    })
    return out
  }, [partitioned])

  return (
    <AnalyticsSectionCard
      title="Embroidery Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value ?? item.total}
          />
        ))}
      </div>
      <AnalyticsTabs
        tabs={[
          { id: "work", label: "Work Type" },
          { id: "marking", label: "Marking" },
          { id: "approval", label: "Approval" },
          { id: "status", label: "Status" },
          { id: "product", label: "Product" },
          { id: "duration", label: "Duration" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <AnalyticsCategoryList
        items={listItems}
        onView={openDrillDown}
        showPercents
        drill={drill}
      />
    </AnalyticsSectionCard>
  )
}
