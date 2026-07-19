import { Suspense } from "react"

import { CustomerMeasurementsPageClient } from "./customer-measurements-page-client"

export default function CustomerMeasurementsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading measurements…
        </div>
      }
    >
      <CustomerMeasurementsPageClient />
    </Suspense>
  )
}
