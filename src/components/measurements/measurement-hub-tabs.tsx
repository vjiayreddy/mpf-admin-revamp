"use client"

import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import {
  MEASUREMENT_HUB_TAB_OPTIONS,
  type MeasurementHubTab,
} from "@/config/measurement-hub"

type MeasurementHubTabsProps = {
  value: MeasurementHubTab
  onChange: (tab: MeasurementHubTab) => void
}

export function MeasurementHubTabs({
  value,
  onChange,
}: MeasurementHubTabsProps) {
  return (
    <AnalyticsTabs
      tabs={MEASUREMENT_HUB_TAB_OPTIONS}
      value={value}
      onChange={(id) => onChange(id as MeasurementHubTab)}
      className="mb-0"
    />
  )
}
