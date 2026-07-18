import { Suspense } from "react"

import { AppointmentsPageClient } from "./appointments-page-client"

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading appointments…
        </div>
      }
    >
      <AppointmentsPageClient />
    </Suspense>
  )
}
