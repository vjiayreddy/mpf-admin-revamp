import { Suspense } from "react"

import { ProductFormClient } from "./product-form-client"

export default function ProductFormPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading form…</div>
      }
    >
      <ProductFormClient />
    </Suspense>
  )
}
