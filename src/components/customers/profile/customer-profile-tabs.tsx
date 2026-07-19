"use client"

import { AnalyticsTabs } from "@/components/analytics/analytics-tabs"
import {
  CUSTOMER_PROFILE_TAB_OPTIONS,
  type CustomerProfileTab,
} from "@/config/customer-profile"

type CustomerProfileTabsProps = {
  value: CustomerProfileTab
  onChange: (tab: CustomerProfileTab) => void
}

export function CustomerProfileTabs({
  value,
  onChange,
}: CustomerProfileTabsProps) {
  return (
    <AnalyticsTabs
      tabs={CUSTOMER_PROFILE_TAB_OPTIONS}
      value={value}
      onChange={(id) => onChange(id as CustomerProfileTab)}
      className="mb-0"
    />
  )
}
