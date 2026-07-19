import { Suspense } from "react"

import { TrackOrdersPageClient } from "./track-orders-page-client"

export default function TrackOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading track orders…
        </div>
      }
    >
      <TrackOrdersPageClient />
    </Suspense>
  )
}
