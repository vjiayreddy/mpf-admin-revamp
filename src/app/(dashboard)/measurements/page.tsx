import { Suspense } from "react"

import { MeasurementsPageClient } from "./measurements-page-client"

export default function MeasurementsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading measurements…
        </div>
      }
    >
      <MeasurementsPageClient />
    </Suspense>
  )
}
