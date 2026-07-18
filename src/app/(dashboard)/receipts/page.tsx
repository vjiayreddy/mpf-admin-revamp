import { Suspense } from "react"

import { ReceiptsPageClient } from "./receipts-page-client"

export default function ReceiptsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading receipts…</div>
      }
    >
      <ReceiptsPageClient />
    </Suspense>
  )
}
