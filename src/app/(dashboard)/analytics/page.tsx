import { Suspense } from "react"

import { AnalyticsPageClient } from "./analytics-page-client"

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading analytics…</div>
      }
    >
      <AnalyticsPageClient />
    </Suspense>
  )
}
