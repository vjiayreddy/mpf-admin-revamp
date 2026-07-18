import { Suspense } from "react"

import { LeadsPageClient } from "./leads-page-client"

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading leads…</div>
      }
    >
      <LeadsPageClient />
    </Suspense>
  )
}
