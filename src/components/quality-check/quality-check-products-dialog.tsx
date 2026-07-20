"use client"

import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { ImageIcon, Loader2Icon, PackageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import type { QualityCheckViewTarget } from "@/components/quality-check/quality-check-view"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  GET_STORE_ORDER_ITEMS_FOR_DETAIL,
  type GetStoreOrderByIdVars,
  type GetStoreOrderItemsDetailData,
  type QualityCheckOrderRow,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import { findOrderQualityCheck, mergeOrderQualityChecks } from "@/lib/quality-check/helpers"
import { qualityCheckStatusChipClass } from "@/lib/quality-check/status-chip"
import type { OrderQualityCheckItem } from "@/lib/quality-check/types"
import { cn } from "@/lib/utils"

type QualityCheckProductsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: QualityCheckOrderRow | null
  onViewQc: (target: QualityCheckViewTarget) => void
}

function customerName(order: QualityCheckOrderRow | null) {
  if (!order) return "—"
  return (
    `${order.customerFirstName?.trim() || ""} ${order.customerLastName?.trim() || ""}`.trim() ||
    "—"
  )
}

function itemImageUrls(item: StoreOrderItem): string[] {
  const urls: string[] = []
  const push = (url?: string | null) => {
    const trimmed = url?.trim()
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
  }
  push(item.readyItemImage)
  push(item.fabricImage)
  push(item.referenceImage)
  push(item.fitImage)
  return urls
}

function primaryImageUrl(item: StoreOrderItem): string | null {
  return (
    item.fabricImage?.trim() ||
    item.readyItemImage?.trim() ||
    item.referenceImage?.trim() ||
    null
  )
}

export function QualityCheckProductsDialog({
  open,
  onOpenChange,
  order,
  onViewQc,
}: QualityCheckProductsDialogProps) {
  const router = useRouter()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)

  const [fetchItems, { data, loading, error }] = useLazyQuery<
    GetStoreOrderItemsDetailData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_ITEMS_FOR_DETAIL, { fetchPolicy: "network-only" })

  useEffect(() => {
    if (!open || !order?._id) return
    void fetchItems({ variables: { orderId: order._id } })
  }, [open, order?._id, fetchItems])

  const detail = data?.getStoreOrderById
  const items = (detail?.orderItems ?? []).filter(Boolean) as StoreOrderItem[]
  // Legacy: `hasQualityCheck(item.itemNumber)` against `orderQualityChecks`.
  // Merge detail + list-row refs so Enter→View/Edit still works if one source is thin.
  const checks = mergeOrderQualityChecks(
    detail?.orderQualityChecks as OrderQualityCheckItem[] | null | undefined,
    order?.orderQualityChecks as OrderQualityCheckItem[] | null | undefined
  )

  const openForm = (item: StoreOrderItem, qcId?: string | null) => {
    if (!order?._id || !item._id) return
    const params = new URLSearchParams({
      orderId: order._id,
      orderItemId: item._id,
      orderItemNumber: String(item.itemNumber ?? ""),
    })
    if (qcId) params.set("qcItemId", qcId)
    onOpenChange(false)
    router.push(`/quality-check/form?${params.toString()}`)
  }

  const openPreview = (item: StoreOrderItem, preferred?: string | null) => {
    const images = itemImageUrls(item)
    if (!images.length) return
    const idx = preferred
      ? Math.max(0, images.indexOf(preferred))
      : 0
    setGalleryImages(images)
    setGalleryIndex(idx)
    setGalleryOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="space-y-1.5 border-b px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <PackageIcon className="text-muted-foreground size-4 shrink-0" />
              Products · Order {order?.orderNo ?? "—"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {customerName(order)} — enter, view, or edit quality checks per
              item.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <p className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading products…
              </p>
            ) : null}
            {error ? (
              <p className="text-destructive py-8 text-sm" role="alert">
                Failed to load order products.
              </p>
            ) : null}
            {!loading && !error && items.length === 0 ? (
              <p className="text-muted-foreground py-8 text-sm">
                No products on this order.
              </p>
            ) : null}

            {items.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                        Image
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                        Product No
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                        Color
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                        Fabric Code
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      // Legacy QualityProductsTableView:
                      // has QC → show View + Edit; no QC → show Enter only.
                      const qc = findOrderQualityCheck(checks, item.itemNumber)
                      const hasQc = Boolean(qc?._id)
                      const thumb = primaryImageUrl(item)
                      return (
                        <tr
                          key={item._id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3.5 align-middle">
                            {thumb ? (
                              <button
                                type="button"
                                className="border-border bg-muted/40 size-14 shrink-0 overflow-hidden rounded-md border transition-opacity hover:opacity-90"
                                title="View product image"
                                onClick={() => openPreview(item, thumb)}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={thumb}
                                  alt={item.itemName || "Product"}
                                  className="size-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            ) : (
                              <div
                                className="border-border bg-muted/40 text-muted-foreground flex size-14 items-center justify-center rounded-md border"
                                aria-hidden
                              >
                                <ImageIcon className="size-5 opacity-50" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex min-w-0 flex-col gap-1.5">
                              <span className="font-medium leading-snug">
                                {item.itemName || "—"}
                              </span>
                              {hasQc && qc?.qualityCheckStatus ? (
                                <span
                                  className={cn(
                                    "w-fit",
                                    qualityCheckStatusChipClass(
                                      qc.qualityCheckStatus
                                    )
                                  )}
                                >
                                  {qc.qualityCheckStatus}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="text-muted-foreground px-4 py-3.5 align-middle tabular-nums">
                            {item.itemNumber != null
                              ? String(item.itemNumber)
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            {item.itemColor || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            {item.fabricCode || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <div className="flex flex-wrap items-center gap-2">
                              {hasQc ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-medium"
                                    onClick={() =>
                                      onViewQc({
                                        orderQualityCheckId: qc!._id,
                                        orderId: order?._id,
                                        orderNo: order?.orderNo,
                                        customerName: customerName(order),
                                        itemName: item.itemName,
                                        itemNumber: item.itemNumber,
                                      })
                                    }
                                  >
                                    View
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 px-3 text-xs font-medium"
                                    onClick={() => openForm(item, qc!._id)}
                                  >
                                    Edit
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 px-3 text-xs font-medium"
                                  onClick={() => openForm(item)}
                                >
                                  Enter
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <ReceiptImagePreview
        open={galleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
        onOpenChange={setGalleryOpen}
        ariaLabel="Product images"
      />
    </>
  )
}
