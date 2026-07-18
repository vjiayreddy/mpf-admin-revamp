import { Suspense } from "react"

import { InvoicePageClient } from "./invoice-page-client"

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading invoices…</div>
      }
    >
      <InvoicePageClient />
    </Suspense>
  )
}
