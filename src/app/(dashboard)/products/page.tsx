import { Suspense } from "react"

import { ProductsPageClient } from "./products-page-client"

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading products…</div>
      }
    >
      <ProductsPageClient />
    </Suspense>
  )
}
