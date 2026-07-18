import { Suspense } from "react"

import { TicketTrackerPageClient } from "./ticket-tracker-page-client"

export default function TicketTrackerPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading tickets…
        </div>
      }
    >
      <TicketTrackerPageClient />
    </Suspense>
  )
}
