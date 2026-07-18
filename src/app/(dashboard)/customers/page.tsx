import { Suspense } from "react"

import { CustomersPageClient } from "./customers-page-client"

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading customers…</div>
      }
    >
      <CustomersPageClient />
    </Suspense>
  )
}
