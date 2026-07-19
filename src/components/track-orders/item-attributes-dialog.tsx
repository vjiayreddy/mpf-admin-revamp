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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OUTFIT_STATUS_OPTIONS } from "@/config/track-orders-calendar-filters"
import {
  extractDateFormat,
  isoToDateInput,
} from "@/lib/appointments/date-payload"
import {
  UPDATE_STORE_ORDER_ITEM_ATTRIBUTES,
  type StoreOrderItem,
  type StoreOrderTimestamp,
  type UpdateStoreOrderItemAttributesData,
  type UpdateStoreOrderItemAttributesVars,
} from "@/lib/apollo/queries/store-orders"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type FormValues = {
  outfitStatus: string
  readyDate: string
  trialDate: string
  trackingNote: string
}

export type ItemAttributesTarget = {
  orderId: string
  orderNo?: string | number | null
  item: StoreOrderItem
}

export type ItemAttributesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: ItemAttributesTarget | null
  onUpdated?: (patch: {
    orderId: string
    orderItemId: string
    item: Partial<StoreOrderItem>
  }) => void
}

function toTimestamp(dateInput: string): StoreOrderTimestamp | null {
  if (!dateInput.trim()) return null
  return extractDateFormat(new Date(`${dateInput}T00:00:00`).toISOString())
}

export function ItemAttributesDialog({
  open,
  onOpenChange,
  target,
  onUpdated,
}: ItemAttributesDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [updateItem, { loading }] = useMutation<
    UpdateStoreOrderItemAttributesData,
    UpdateStoreOrderItemAttributesVars
  >(UPDATE_STORE_ORDER_ITEM_ATTRIBUTES)

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      outfitStatus: "",
      readyDate: "",
      trialDate: "",
      trackingNote: "",
    },
  })

  useEffect(() => {
    if (!open || !target?.item) return
    setSubmitError(null)
    const item = target.item
    reset({
      outfitStatus: item.outfitStatus ?? "",
      readyDate: isoToDateInput(item.readyDate?.timestamp ?? null),
      trialDate: isoToDateInput(item.trialDate?.timestamp ?? null),
      trackingNote: item.trackingNote ?? "",
    })
  }, [open, target, reset])

  const onSubmit = handleSubmit(async (values) => {
    const item = target?.item
    const orderItemId = item?._id
    if (!target?.orderId || !orderItemId) return
    setSubmitError(null)

    const readyDate = toTimestamp(values.readyDate)
    const trialDate = toTimestamp(values.trialDate)

    const attributes = {
      outfitStatus: values.outfitStatus || null,
      trackingNote: values.trackingNote.trim() || null,
      readyDate,
      trialDate,
      // Preserve workshops — workshop picker lands in a later polish pass.
      dyingWorkshopId: item.dyingWorkshopId ?? null,
      dyingWorkshopName: item.dyingWorkshopName ?? null,
      itemWorkshopId: item.itemWorkshopId ?? null,
      itemWorkshopName: item.itemWorkshopName ?? null,
      fabricWorkshopId: item.fabricWorkshopId ?? null,
      fabricWorkshopName: item.fabricWorkshopName ?? null,
      embroideryWorkshopId: item.embroideryWorkshopId ?? null,
      embroideryWorkshopName: item.embroideryWorkshopName ?? null,
      stitchingWorkshopId: item.stitchingWorkshopId ?? null,
      stitchingWorkshopName: item.stitchingWorkshopName ?? null,
      readyItemImage: item.readyItemImage ?? null,
    }

    try {
      await updateItem({
        variables: {
          orderId: target.orderId,
          orderItemId,
          attributes,
        },
      })

      onUpdated?.({
        orderId: target.orderId,
        orderItemId,
        item: {
          outfitStatus: attributes.outfitStatus,
          trackingNote: attributes.trackingNote,
          readyDate,
          trialDate,
        },
      })
      onOpenChange(false)
      notify.success("Item details updated")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update item"
      setSubmitError(msg)
      notify.fromError(err, "Failed to update item")
    }
  })

  const item = target?.item

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update item details</DialogTitle>
          <DialogDescription>
            Order #{target?.orderNo ?? "—"}
            {item?.itemName ? ` · ${item.itemName}` : ""}
            {item?.itemNumber != null ? ` · #${item.itemNumber}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-outfit-status">Outfit status</Label>
            <select
              id="item-outfit-status"
              className={selectClass}
              {...register("outfitStatus")}
            >
              <option value="">Select…</option>
              {OUTFIT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-ready-date">Ready date</Label>
              <Input id="item-ready-date" type="date" {...register("readyDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-trial-date">Trial date</Label>
              <Input id="item-trial-date" type="date" {...register("trialDate")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-tracking-note">Tracking note</Label>
            <Textarea
              id="item-tracking-note"
              rows={3}
              {...register("trackingNote")}
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
