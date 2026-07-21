"use client"

import { Suspense } from "react"

import { OrdersFormClient } from "@/app/(dashboard)/orders/form/orders-form-client"

export default function OrdersFormPage() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Loading order form…</p>
      }
    >
      <OrdersFormClient />
    </Suspense>
  )
}
