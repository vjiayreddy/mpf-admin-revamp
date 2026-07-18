"use client"

import { useMemo, useState } from "react"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsDonutChart } from "@/components/analytics/analytics-donut-chart"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionAppointments } from "@/lib/analytics/partition"
import {
  GET_APPOINTMENTS_DASHBOARD_DATA,
  GET_APPOINTMENTS_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

export function AppointmentsAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const [tab, setTab] = useState("created")
  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_APPOINTMENTS_DASHBOARD_DATA,
      summaryAnalyticsPath: "getAppointmentDashboardData.analytics",
      drillDocument: GET_APPOINTMENTS_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getAppointmentDashboardDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      includeStudioId: false,
      partition: partitionAppointments,
    })

  const listItems = useMemo(() => {
    switch (tab) {
      case "scheduled":
        return partitioned.appointmentScheduled
      case "credited":
        return partitioned.stylistScheduled
      default:
        return partitioned.appointmentCreated
    }
  }, [tab, partitioned])

  const donutItems = useMemo(
    () =>
      partitioned.appointmentCreated.map((item) => ({
        label: item.label,
        value: Number(item.value) || 0,
      })),
    [partitioned.appointmentCreated]
  )

  return (
    <AnalyticsSectionCard
      title="Appointments Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid gap-4 lg:grid-cols-[220px_1fr]">
        <AnalyticsDonutChart items={donutItems} />
        <div>
          <AnalyticsTabs
            tabs={[
              { id: "created", label: "Created" },
              { id: "scheduled", label: "Scheduled" },
              { id: "credited", label: "Credited Stylist" },
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
