import { Suspense } from "react"

import { InvoicePreviewPageClient } from "./invoice-preview-page-client"

export default function InvoicePreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading invoice preview…
        </div>
      }
    >
      <InvoicePreviewPageClient />
    </Suspense>
  )
}
