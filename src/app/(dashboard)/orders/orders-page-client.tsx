"use client"

import { Suspense } from "react"

import { OrdersListPanel } from "@/components/orders/orders-list-panel"

export function OrdersPageClient() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Loading orders…</p>
      }
    >
      <OrdersListPanel />
    </Suspense>
  )
}
