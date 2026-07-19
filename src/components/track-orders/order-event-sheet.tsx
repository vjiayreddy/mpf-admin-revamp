"use client"

import { useEffect, useMemo, useState } from "react"
import { useApolloClient, useMutation } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import {
  ORDER_STATUS_EDIT_OPTIONS,
  OUTFIT_STATUS_OPTIONS,
} from "@/config/track-orders-calendar-filters"
import { extractDateFormat } from "@/lib/appointments/date-payload"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"
import type { CalendarOrderPatch } from "@/hooks/use-track-orders-calendar"
import {
  GET_STORE_ORDER_BY_ID,
  SAVE_STORE_ORDER,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type SaveStoreOrderData,
  type SaveStoreOrderVars,
  type StoreOrderDetail,
} from "@/lib/apollo/queries/store-orders"
import {
  buildSaveStoreOrderParams,
  type OrderEventFormValues,
} from "@/lib/track-orders/build-save-payload"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

function formFromOrder(order: StoreOrderDetail): OrderEventFormValues {
  return {
    trialDate: isoToDateInput(order.trialDate?.timestamp ?? null),
    deliveryDate: isoToDateInput(order.deliveryDate?.timestamp ?? null),
    orderStatus: order.orderStatus || "RUNNING",
    remark: order.remark || "",
    items: (order.orderItems ?? []).map((item, index) => ({
      key: String(item._id ?? item.itemNumber ?? index),
      outfitStatus: item.outfitStatus || "not_started",
      hasEmbroidary: !!item.hasEmbroidary,
    })),
  }
}

function itemImageUrls(item: {
  readyItemImage?: string | null
  referenceImage?: string | null
  fabricImage?: string | null
  referenceLookBooks?: Array<{ lookBookImages?: string[] | null }> | null
}): string[] {
  const urls: string[] = []
  const push = (url?: string | null) => {
    const trimmed = url?.trim()
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
  }
  push(item.readyItemImage)
  push(item.referenceImage)
  push(item.fabricImage)
  for (const lb of item.referenceLookBooks ?? []) {
    for (const img of lb.lookBookImages ?? []) push(img)
  }
  return urls
}

type OrderEventSheetProps = {
  open: boolean
  orderId: string | null
  /** Bump on every open so the sheet always reloads from the network. */
  openNonce?: number
  onOpenChange: (open: boolean) => void
  onSaved?: (patch: CalendarOrderPatch) => void | Promise<void>
}

export function OrderEventSheet({
  open,
  orderId,
  openNonce = 0,
  onOpenChange,
  onSaved,
}: OrderEventSheetProps) {
  const client = useApolloClient()
  const [form, setForm] = useState<OrderEventFormValues | null>(null)
  const [order, setOrder] = useState<StoreOrderDetail | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)

  const [saveOrder, { loading: saving }] = useMutation<
    SaveStoreOrderData,
    SaveStoreOrderVars
  >(SAVE_STORE_ORDER)

  useEffect(() => {
    if (!open || !orderId) {
      if (!open) {
        setForm(null)
        setOrder(null)
        setSubmitError(null)
        setLoadError(null)
        setLoadingOrder(false)
        setGalleryOpen(false)
        setGalleryImages([])
        setGalleryIndex(0)
      }
      return
    }

    let cancelled = false
    setSubmitError(null)
    setLoadError(null)
    setForm(null)
    setOrder(null)
    setLoadingOrder(true)

    void client
      .query<GetStoreOrderByIdData, GetStoreOrderByIdVars>({
        query: GET_STORE_ORDER_BY_ID,
        variables: { orderId },
        fetchPolicy: "no-cache",
      })
      .then((result) => {
        if (cancelled) return
        const next = result.data?.getStoreOrderById ?? null
        if (!next) {
          setLoadError("Order not found")
          setLoadingOrder(false)
          return
        }
        setOrder(next)
        setForm(formFromOrder(next))
        setLoadingOrder(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadError(
          err instanceof Error ? err.message : "Failed to load order"
        )
        setLoadingOrder(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, orderId, openNonce, client])

  const title = useMemo(() => {
    if (!order) return "Order"
    const name =
      `${order.customerFirstName ?? ""} ${order.customerLastName ?? ""}`.trim()
    return `${name || "Order"}${order.orderNo != null ? ` · #${order.orderNo}` : ""}`
  }, [order])

  const stylistName = order?.stylist?.[0]?.name || "—"

  const onSubmit = async () => {
    if (!order || !form) return
    setSubmitError(null)
    try {
      await saveOrder({
        variables: { params: buildSaveStoreOrderParams(order, form) },
      })
      client.cache.evict({ fieldName: "getStoreOrderById" })
      client.cache.gc()
      const trialIso = dateInputToIso(form.trialDate)
      const patch: CalendarOrderPatch = {
        _id: order._id,
        orderStatus: form.orderStatus,
        remark: form.remark,
        trialDate: trialIso ? extractDateFormat(trialIso) : null,
      }
      onOpenChange(false)
      await onSaved?.(patch)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save order"
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">{title}</SheetTitle>
          <SheetDescription>
            Update trial, delivery, status, and items.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loadingOrder && !form ? (
            <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading order…
            </div>
          ) : null}

          {loadError ? (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {loadError}
            </p>
          ) : null}

          {form && order ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label>Stylist</Label>
                <Input value={stylistName} readOnly disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="trial-date">Trial date</Label>
                <Input
                  id="trial-date"
                  type="date"
                  value={form.trialDate}
                  disabled={saving}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, trialDate: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="delivery-date">Delivery date</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={form.deliveryDate}
                  disabled={saving}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, deliveryDate: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Event date</Label>
                <Input
                  value={isoToDateInput(order?.eventDate?.timestamp ?? null)}
                  readOnly
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label>Order date</Label>
                <Input
                  value={isoToDateInput(order?.orderDate?.timestamp ?? null)}
                  readOnly
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="order-status">Order status</Label>
                <select
                  id="order-status"
                  className={selectClass}
                  value={form.orderStatus}
                  disabled={saving}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, orderStatus: e.target.value } : prev
                    )
                  }
                >
                  {ORDER_STATUS_EDIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Balance</Label>
                <Input
                  value={
                    order?.balanceAmount != null
                      ? String(order.balanceAmount)
                      : "—"
                  }
                  readOnly
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="remark">Remarks</Label>
                <Textarea
                  id="remark"
                  rows={3}
                  value={form.remark}
                  disabled={saving}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, remark: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="bg-muted/50 grid grid-cols-[2.5rem_1fr_7.5rem_3.5rem] gap-2 border-b px-3 py-2 text-xs font-medium uppercase">
                  <span className="sr-only">Image</span>
                  <span>Product</span>
                  <span>Status</span>
                  <span>Emb</span>
                </div>
                {(order?.orderItems ?? []).map((item, index) => {
                  const key = String(item._id ?? item.itemNumber ?? index)
                  const row = form.items.find((i) => i.key === key)
                  if (!row) return null
                  const images = itemImageUrls(item)
                  const imageUrl = images[0] ?? null
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-[2.5rem_1fr_7.5rem_3.5rem] items-center gap-2 border-b px-3 py-2 last:border-b-0"
                    >
                      {imageUrl ? (
                        <button
                          type="button"
                          className="border-border size-10 shrink-0 overflow-hidden rounded-md border"
                          title="View product gallery"
                          onClick={() => {
                            setGalleryImages(images)
                            setGalleryIndex(0)
                            setGalleryOpen(true)
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={item.itemName || "Product"}
                            className="size-full object-cover"
                          />
                        </button>
                      ) : (
                        <div
                          className="border-muted-foreground/40 bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed text-[10px]"
                          title="No image"
                        >
                          N/A
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.itemName || "Item"}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          #{item.itemNumber ?? "—"}
                        </p>
                      </div>
                      <select
                        className={cn(selectClass, "h-8 text-xs")}
                        value={row.outfitStatus}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((prev) => {
                            if (!prev) return prev
                            return {
                              ...prev,
                              items: prev.items.map((i) =>
                                i.key === key
                                  ? { ...i, outfitStatus: e.target.value }
                                  : i
                              ),
                            }
                          })
                        }
                      >
                        {OUTFIT_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center justify-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          className="size-3.5 accent-primary"
                          checked={row.hasEmbroidary}
                          disabled={saving}
                          onChange={(e) =>
                            setForm((prev) => {
                              if (!prev) return prev
                              return {
                                ...prev,
                                items: prev.items.map((i) =>
                                  i.key === key
                                    ? {
                                        ...i,
                                        hasEmbroidary: e.target.checked,
                                      }
                                    : i
                                ),
                              }
                            })
                          }
                        />
                      </label>
                    </div>
                  )
                })}
              </div>

              {submitError ? (
                <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                  {submitError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <SheetFooter className="border-t">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || !form || loadingOrder}
            onClick={() => void onSubmit()}
          >
            {saving ? "Saving…" : "Update"}
          </Button>
        </SheetFooter>
      </SheetContent>

      <ReceiptImagePreview
        open={galleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
        onOpenChange={setGalleryOpen}
        ariaLabel="Product image gallery"
      />
    </Sheet>
  )
}
