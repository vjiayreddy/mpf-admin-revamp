import { Suspense } from "react"

import { CustomerCifPageClient } from "./customer-cif-page-client"

export default function CustomerCifPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading CIF…</div>
      }
    >
      <CustomerCifPageClient />
    </Suspense>
  )
}
