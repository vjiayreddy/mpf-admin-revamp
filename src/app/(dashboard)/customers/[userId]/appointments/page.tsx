import { Suspense } from "react"

import { CustomerAppointmentsPageClient } from "./customer-appointments-page-client"

export default function CustomerAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading appointments…
        </div>
      }
    >
      <CustomerAppointmentsPageClient />
    </Suspense>
  )
}
