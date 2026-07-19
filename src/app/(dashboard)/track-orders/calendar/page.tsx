import { Suspense } from "react"

import { TrackOrdersCalendarPageClient } from "./track-orders-calendar-page-client"

export default function TrackOrdersCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading track orders calendar…
        </div>
      }
    >
      <TrackOrdersCalendarPageClient />
    </Suspense>
  )
}
