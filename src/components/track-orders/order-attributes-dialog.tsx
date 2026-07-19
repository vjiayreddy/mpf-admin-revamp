"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ORDER_STATUS_EDIT_OPTIONS } from "@/config/track-orders-calendar-filters"
import {
  extractDateFormat,
  isoToDateInput,
} from "@/lib/appointments/date-payload"
import {
  UPDATE_STORE_ORDER_ATTRIBUTES,
  type StoreOrderListRow,
  type StoreOrderTimestamp,
  type UpdateStoreOrderAttributesData,
  type UpdateStoreOrderAttributesVars,
} from "@/lib/apollo/queries/store-orders"
import { customerFullName } from "@/lib/track-orders/format"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type FormValues = {
  readyDate: string
  trialDate: string
  orderStatus: string
  remark: string
  isGroupCreated: boolean
}

export type OrderAttributesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: StoreOrderListRow | null
  onUpdated?: (patch: Partial<StoreOrderListRow> & { _id: string }) => void
}

function toTimestamp(dateInput: string): StoreOrderTimestamp | null {
  if (!dateInput.trim()) return null
  return extractDateFormat(new Date(`${dateInput}T00:00:00`).toISOString())
}

export function OrderAttributesDialog({
  open,
  onOpenChange,
  order,
  onUpdated,
}: OrderAttributesDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [updateAttributes, { loading }] = useMutation<
    UpdateStoreOrderAttributesData,
    UpdateStoreOrderAttributesVars
  >(UPDATE_STORE_ORDER_ATTRIBUTES)

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      readyDate: "",
      trialDate: "",
      orderStatus: "",
      remark: "",
      isGroupCreated: false,
    },
  })

  useEffect(() => {
    if (!open || !order) return
    setSubmitError(null)
    reset({
      readyDate: isoToDateInput(order.readyDate?.timestamp ?? null),
      trialDate: isoToDateInput(order.trialDate?.timestamp ?? null),
      orderStatus: order.orderStatus ?? "",
      remark: order.remark ?? "",
      isGroupCreated: !!order.isGroupCreated,
    })
  }, [open, order, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!order?._id) return
    setSubmitError(null)

    const readyDate = toTimestamp(values.readyDate)
    const trialDate = toTimestamp(values.trialDate)

    try {
      await updateAttributes({
        variables: {
          orderId: order._id,
          attributes: {
            readyDate,
            trialDate,
            orderStatus: values.orderStatus || null,
            remark: values.remark.trim() || null,
            isGroupCreated: values.isGroupCreated,
          },
        },
      })

      onUpdated?.({
        _id: order._id,
        readyDate,
        trialDate,
        orderStatus: values.orderStatus || null,
        remark: values.remark.trim() || null,
        isGroupCreated: values.isGroupCreated,
      })
      onOpenChange(false)
      notify.success("Order details updated")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update order"
      setSubmitError(msg)
      notify.fromError(err, "Failed to update order")
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update order details</DialogTitle>
          <DialogDescription>
            {order
              ? `#${order.orderNo ?? "—"} · ${customerFullName(order.customerFirstName, order.customerLastName)}`
              : "Order"}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-ready-date">Ready date</Label>
              <Input id="order-ready-date" type="date" {...register("readyDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-trial-date">Trial date</Label>
              <Input id="order-trial-date" type="date" {...register("trialDate")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-status">Order status</Label>
            <select
              id="order-status"
              className={selectClass}
              {...register("orderStatus")}
            >
              <option value="">Select…</option>
              {ORDER_STATUS_EDIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-remark">Remark</Label>
            <Textarea id="order-remark" rows={3} {...register("remark")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Group created?</Label>
            <Controller
              name="isGroupCreated"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    No
                  </label>
                </div>
              )}
            />
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
