"use client"

import { useEffect, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import { OrderPaymentsSheet } from "@/components/orders/order-payments-sheet"
import { isoToDateInput } from "@/lib/appointments/date-payload"
import {
  GET_STORE_ORDER_BY_ID,
  UPDATE_PAYMENTS_FOR_STORE_ORDER,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type UpdatePaymentsForStoreOrderData,
  type UpdatePaymentsForStoreOrderVars,
} from "@/lib/apollo/queries/store-orders"
import { notify } from "@/lib/notify"
import type { OrderPaymentLine } from "@/lib/orders/form"
import { buildUpdatePaymentsPayload } from "@/lib/orders/payments-payload"

export type OrderListPaymentsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string | null
  onSaved?: () => void
}

export function OrderListPaymentsSheet({
  open,
  onOpenChange,
  orderId,
  onSaved,
}: OrderListPaymentsSheetProps) {
  const [lines, setLines] = useState<OrderPaymentLine[]>([])
  const [orderDate, setOrderDate] = useState("")

  const [fetchOrder, { loading: loadingOrder }] = useLazyQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, { fetchPolicy: "network-only" })

  const [updatePayments, { loading: saving }] = useMutation<
    UpdatePaymentsForStoreOrderData,
    UpdatePaymentsForStoreOrderVars
  >(UPDATE_PAYMENTS_FOR_STORE_ORDER)

  useEffect(() => {
    if (!open || !orderId) return
    void fetchOrder({ variables: { orderId } }).then((result) => {
      const order = result.data?.getStoreOrderById
      if (!order) {
        notify.error("Could not load order payments")
        return
      }
      setLines(order.paymentBreakdown ?? [])
      setOrderDate(isoToDateInput(order.orderDate?.timestamp))
    })
  }, [open, orderId, fetchOrder])

  if (!orderId) return null

  return (
    <>
      {open && loadingOrder ? (
        <div className="text-muted-foreground fixed inset-0 z-50 flex items-center justify-center bg-black/20 text-sm">
          <Loader2Icon className="mr-2 size-4 animate-spin" />
          Loading payments…
        </div>
      ) : null}
      <OrderPaymentsSheet
        open={open && !loadingOrder}
        onOpenChange={onOpenChange}
        lines={lines}
        orderDate={orderDate}
        orderId={orderId}
        saving={saving}
        onSave={async (next) => {
          try {
            await updatePayments({
              variables: {
                orderId,
                payments: buildUpdatePaymentsPayload(next),
              },
            })
            notify.success("Payments updated")
            onOpenChange(false)
            onSaved?.()
          } catch (err) {
            notify.fromError(err, "Failed to update payments")
          }
        }}
      />
    </>
  )
}
