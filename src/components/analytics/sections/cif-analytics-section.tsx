"use client"

import { useMemo, useState } from "react"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsDonutChart } from "@/components/analytics/analytics-donut-chart"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionCif } from "@/lib/analytics/partition"
import {
  GET_CIF_DASHBOARD_DATA,
  GET_CIF_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function CifAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const [tab, setTab] = useState("status")
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_CIF_DASHBOARD_DATA,
      summaryAnalyticsPath: "getCustomerInfoDashboardData.analytics",
      drillDocument: GET_CIF_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getCustomerInfoDashboardDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      partition: partitionCif,
    })

  const listItems = useMemo(() => {
    switch (tab) {
      case "stylist":
        return partitioned.stylistCif
      case "followup":
        return partitioned.followUpCif
      case "occasion":
        return partitioned.occasionCif
      case "source":
        return partitioned.sourceCif
      case "studio":
        return partitioned.studioOrdersCif
      default:
        return partitioned.statusCif
    }
  }, [tab, partitioned])

  const donutItems = useMemo(
    () =>
      partitioned.statusCif.map((item) => ({
        label: item.label,
        value: Number(item.value) || 0,
      })),
    [partitioned.statusCif]
  )

  return (
    <AnalyticsSectionCard
      title="CIF Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid gap-4 lg:grid-cols-[220px_1fr]">
        <AnalyticsDonutChart items={donutItems} />
        <div>
          <AnalyticsTabs
            tabs={[
              { id: "status", label: "Status" },
              { id: "stylist", label: "Stylist" },
              { id: "followup", label: "Follow Up" },
              { id: "occasion", label: "Occasion" },
              { id: "source", label: "Source" },
              { id: "studio", label: "Studio" },
            ]}
            value={tab}
            onChange={setTab}
          />
          <AnalyticsCategoryList
            items={listItems}
            onView={openDrillDown}
            drill={drill}
          />
        </div>
      </div>
    </AnalyticsSectionCard>
  )
}
