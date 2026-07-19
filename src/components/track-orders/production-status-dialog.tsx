"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PRODUCTION_STATUS_OPTIONS } from "@/config/track-orders-calendar-filters"
import {
  UPDATE_STORE_ORDER_ITEM_PRODUCTION_STATUS,
  UPDATE_STORE_ORDER_PRODUCTION_STATUS,
  type ProductionStatusEnum,
  type UpdateStoreOrderItemProductionStatusData,
  type UpdateStoreOrderItemProductionStatusVars,
  type UpdateStoreOrderProductionStatusData,
  type UpdateStoreOrderProductionStatusVars,
} from "@/lib/apollo/queries/store-orders"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type FormValues = {
  productionStatus: ProductionStatusEnum | ""
}

export type ProductionStatusTarget =
  | { kind: "order"; orderId: string; orderNo?: string | number | null; current?: string | null }
  | {
      kind: "item"
      orderId: string
      orderItemId: string
      orderNo?: string | number | null
      itemName?: string | null
      current?: string | null
    }

export type ProductionStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: ProductionStatusTarget | null
  onUpdated?: (patch: {
    kind: "order" | "item"
    orderId: string
    orderItemId?: string
    productionStatus: ProductionStatusEnum
  }) => void
}

function normalizeStatus(raw?: string | null): ProductionStatusEnum | "" {
  if (!raw) return ""
  const upper = raw.toUpperCase()
  const match = PRODUCTION_STATUS_OPTIONS.find((o) => o.value === upper)
  return match?.value ?? ""
}

export function ProductionStatusDialog({
  open,
  onOpenChange,
  target,
  onUpdated,
}: ProductionStatusDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [updateOrderStatus, { loading: orderLoading }] = useMutation<
    UpdateStoreOrderProductionStatusData,
    UpdateStoreOrderProductionStatusVars
  >(UPDATE_STORE_ORDER_PRODUCTION_STATUS)

  const [updateItemStatus, { loading: itemLoading }] = useMutation<
    UpdateStoreOrderItemProductionStatusData,
    UpdateStoreOrderItemProductionStatusVars
  >(UPDATE_STORE_ORDER_ITEM_PRODUCTION_STATUS)

  const loading = orderLoading || itemLoading
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { productionStatus: "" },
  })

  useEffect(() => {
    if (!open || !target) return
    setSubmitError(null)
    reset({ productionStatus: normalizeStatus(target.current) })
  }, [open, target, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!target || !values.productionStatus) return
    setSubmitError(null)

    try {
      if (target.kind === "order") {
        await updateOrderStatus({
          variables: {
            orderId: target.orderId,
            productionStatus: values.productionStatus,
          },
        })
        onUpdated?.({
          kind: "order",
          orderId: target.orderId,
          productionStatus: values.productionStatus,
        })
      } else {
        await updateItemStatus({
          variables: {
            orderId: target.orderId,
            orderItemId: target.orderItemId,
            productionStatus: values.productionStatus,
          },
        })
        onUpdated?.({
          kind: "item",
          orderId: target.orderId,
          orderItemId: target.orderItemId,
          productionStatus: values.productionStatus,
        })
      }
      onOpenChange(false)
      notify.success("Production status updated")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update production status"
      setSubmitError(msg)
      notify.fromError(err, "Failed to update production status")
    }
  })

  const description =
    target?.kind === "item"
      ? `Order #${target.orderNo ?? "—"} · ${target.itemName || "Item"}`
      : target
        ? `Order #${target.orderNo ?? "—"}`
        : "Production status"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update production status</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="production-status">Status</Label>
            <select
              id="production-status"
              className={selectClass}
              {...register("productionStatus", { required: true })}
            >
              <option value="">Select…</option>
              {PRODUCTION_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {submitError ? (
            <p className="text-destructive text-sm">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
