"use client"

import { useMemo, useState } from "react"

import { AnalyticsCategoryList } from "@/components/analytics/analytics-category-list"
import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card"
import { AnalyticsSectionCard } from "@/components/analytics/analytics-section-card"
import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import { useAnalyticsDomain } from "@/hooks/use-analytics-domain"
import { partitionUsers } from "@/lib/analytics/partition"
import {
  GET_DASHBOARD_DATA,
  GET_DASHBOARD_DRILL_DOWN_DATA,
} from "@/lib/apollo/queries/analytics"

type Props = {
  searchParams: URLSearchParams
  defaultPersonalStylistId?: string | null
}

type TabType = "customers" | "non-customers" | "cc-missed" | "cc-today"

export function UserAnalyticsSection({
  searchParams,
  defaultPersonalStylistId,
}: Props) {
  const [tabType, setTabType] = useState<TabType>("customers")
  const [innerTab, setInnerTab] = useState("status")

  const { partitioned, loading, error, items, openDrillDown, drill } =
    useAnalyticsDomain({
      summaryDocument: GET_DASHBOARD_DATA,
      summaryAnalyticsPath: "getDashboardData.analytics",
      drillDocument: GET_DASHBOARD_DRILL_DOWN_DATA,
      drillRootField: "getDashboardDrillDownData",
      searchParams,
      defaultPersonalStylistId,
      partition: partitionUsers,
    })

  const customerKpis = useMemo(
    () =>
      partitioned.totalCustomers.filter(
        (item) =>
          !item.label.startsWith("Customer Stylist:") &&
          item.label !== "Without Customer Stylist "
      ),
    [partitioned.totalCustomers]
  )

  const nonCustomerKpis = useMemo(
    () =>
      partitioned.totalNonCustomers.filter(
        (item) =>
          !item.label.startsWith("Non Customer Stylist:") &&
          item.label !== "Without Non Customer Stylist"
      ),
    [partitioned.totalNonCustomers]
  )

  const tabs = useMemo(() => {
    if (tabType === "customers") {
      return [
        { id: "status", label: "Status" },
        { id: "stylist", label: "Stylist" },
      ]
    }
    if (tabType === "non-customers") {
      return [
        { id: "status", label: "Status" },
        { id: "stylist", label: "Stylist" },
      ]
    }
    return [{ id: "list", label: tabType === "cc-missed" ? "CC Missed" : "CC Today" }]
  }, [tabType])

  const listItems = useMemo(() => {
    if (tabType === "customers") {
      return innerTab === "stylist"
        ? partitioned.customersStylist
        : partitioned.statusCustomers
    }
    if (tabType === "non-customers") {
      return innerTab === "stylist"
        ? partitioned.nonCustomersStylist
        : partitioned.statusNonCustomers
    }
    if (tabType === "cc-missed") return partitioned.withOutCCmissed
    return partitioned.withOutCCToday
  }, [tabType, innerTab, partitioned])

  return (
    <AnalyticsSectionCard
      title="User Analytics"
      loading={loading}
      error={error}
      empty={!loading && !error && items.length === 0}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {customerKpis.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value}
            onClick={() => {
              setTabType("customers")
              setInnerTab("status")
            }}
          />
        ))}
        {nonCustomerKpis.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value}
            onClick={() => {
              setTabType("non-customers")
              setInnerTab("status")
            }}
          />
        ))}
        {partitioned.totalCount.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value}
          />
        ))}
        {partitioned.withOutCCmissed.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value}
            onClick={() => {
              setTabType("cc-missed")
              setInnerTab("list")
            }}
          />
        ))}
        {partitioned.withOutCCToday.map((item) => (
          <AnalyticsKpiCard
            key={item.label}
            subTitle={item.label}
            title={item.value}
            onClick={() => {
              setTabType("cc-today")
              setInnerTab("list")
            }}
          />
        ))}
      </div>

      <AnalyticsTabs
        tabs={[
          { id: "customers", label: "Customers" },
          { id: "non-customers", label: "Non Customers" },
          { id: "cc-missed", label: "CC Missed" },
          { id: "cc-today", label: "CC Today" },
        ]}
        value={tabType}
        onChange={(id) => {
          setTabType(id as TabType)
          setInnerTab(id === "customers" || id === "non-customers" ? "status" : "list")
        }}
      />
      {(tabType === "customers" || tabType === "non-customers") && (
        <AnalyticsTabs tabs={tabs} value={innerTab} onChange={setInnerTab} />
      )}
      <AnalyticsCategoryList
        items={listItems}
        onView={openDrillDown}
        drill={drill}
      />
    </AnalyticsSectionCard>
  )
}
