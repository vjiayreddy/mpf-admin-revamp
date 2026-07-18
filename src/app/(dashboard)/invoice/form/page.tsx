import { Suspense } from "react"

import { InvoiceFormClient } from "./invoice-form-client"

export default function InvoiceFormPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading form…</div>
      }
    >
      <InvoiceFormClient />
    </Suspense>
  )
}
