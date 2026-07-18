import { Suspense } from "react"

import { OnlineOrdersPageClient } from "./online-orders-page-client"

export default function OnlineOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading online orders…
        </div>
      }
    >
      <OnlineOrdersPageClient />
    </Suspense>
  )
}
