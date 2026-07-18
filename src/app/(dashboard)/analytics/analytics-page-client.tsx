"use client"

import { AnalyticsFiltersBar } from "@/components/analytics/analytics-filters-bar"
import { AppointmentsAnalyticsSection } from "@/components/analytics/sections/appointments-analytics-section"
import { CifAnalyticsSection } from "@/components/analytics/sections/cif-analytics-section"
import { EmbAnalyticsSection } from "@/components/analytics/sections/emb-analytics-section"
import { LeadAnalyticsSection } from "@/components/analytics/sections/lead-analytics-section"
import { OrdersAnalyticsSection } from "@/components/analytics/sections/orders-analytics-section"
import { QualityCheckAnalyticsSection } from "@/components/analytics/sections/quality-check-analytics-section"
import { ReceiptsAnalyticsSection } from "@/components/analytics/sections/receipts-analytics-section"
import { TrialAnalyticsSection } from "@/components/analytics/sections/trial-analytics-section"
import { UserAnalyticsSection } from "@/components/analytics/sections/user-analytics-section"
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters"

export function AnalyticsPageClient() {
  const filters = useAnalyticsFilters()
  const sectionProps = {
    searchParams: filters.searchParams,
    defaultPersonalStylistId: filters.defaultPersonalStylistId,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Dashboard metrics across users, leads, CIF, orders, and operations.
        </p>
      </div>

      <AnalyticsFiltersBar
        stylistId={filters.stylistId}
        studioIds={filters.studioIds}
        timePeriod={filters.timePeriod}
        startDateInput={filters.startDateInput}
        endDateInput={filters.endDateInput}
        onStylistChange={filters.setStylistId}
        onTimePeriodChange={filters.setTimePeriod}
        onStudioIdsChange={filters.setStudioIds}
        onApplyCustomDates={filters.setCustomDateRange}
        onClearFilters={filters.clearFilters}
      />

      <UserAnalyticsSection {...sectionProps} />
      <LeadAnalyticsSection {...sectionProps} />
      <CifAnalyticsSection {...sectionProps} />
      <OrdersAnalyticsSection {...sectionProps} />
      <EmbAnalyticsSection {...sectionProps} />
      <ReceiptsAnalyticsSection {...sectionProps} />
      <AppointmentsAnalyticsSection {...sectionProps} />

      <div className="grid gap-6 lg:grid-cols-2">
        <QualityCheckAnalyticsSection {...sectionProps} />
        <TrialAnalyticsSection {...sectionProps} />
      </div>
    </div>
  )
}
