"use client"

import { useMemo, useRef, useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2Icon, PrinterIcon, XIcon } from "lucide-react"

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
  GET_STYLING_CONFIG,
  type GetStylingConfigData,
  type GetStylingConfigVars,
  type StylingConfigOption,
} from "@/lib/apollo/queries/styling-config"
import type { StoreOrderItem, StoreOrderTimestamp } from "@/lib/apollo/queries/store-orders"
import { formatStoreOrderDate } from "@/lib/track-orders/format"
import {
  hasStyleDesign,
  resolveProductCatId,
} from "@/lib/track-orders/product-cat-id"
import { cn } from "@/lib/utils"

export type StyleFormViewTarget = {
  orderId: string
  orderNo?: string | number | null
  customerId?: string | null
  customerName?: string | null
  stylistName?: string | null
  orderDate?: StoreOrderTimestamp | string | null
  item: StoreOrderItem
}

export type StyleFormViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: StyleFormViewTarget | null
}

type MergedAttribute = {
  label: string
  sortOrder: number
  masterName: string
  option: StylingConfigOption
}

function normalizeStyleDesign(raw: StoreOrderItem["styleDesign"] | string | null | undefined) {
  if (!raw) return null
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as NonNullable<StoreOrderItem["styleDesign"]>
    } catch {
      return null
    }
  }
  return raw
}

function mergeStyleAttributes(
  styleDesign: StoreOrderItem["styleDesign"],
  configAttributes: GetStylingConfigData["getStylingConfig"]
): MergedAttribute[] {
  const design = normalizeStyleDesign(styleDesign)
  const attrs = configAttributes?.attributes ?? []
  if (!design?.styleAttributes?.length || !attrs.length) return []

  const merged: MergedAttribute[] = []
  for (const selected of design.styleAttributes) {
    const master = selected.master_name
    if (!master) continue
    const configAttr = attrs.find((a) => a.masterName === master)
    if (!configAttr) continue
    const option = (configAttr.options ?? []).find(
      (o) => o._id === selected.value
    )
    if (!option) continue
    merged.push({
      label: configAttr.label || master,
      sortOrder: configAttr.sortOrder ?? 0,
      masterName: master,
      option: {
        ...option,
        image: option.image || selected.image || null,
        name: option.name || selected.name || null,
      },
    })
  }
  return merged.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function StyleFormView({
  open,
  onOpenChange,
  target,
}: StyleFormViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)

  const item = target?.item
  const catId = item
    ? resolveProductCatId(item.itemName, item.itemCatId)
    : null
  const styleDesign = normalizeStyleDesign(item?.styleDesign)
  const canShow = hasStyleDesign(styleDesign)

  const { data, loading, error } = useQuery<
    GetStylingConfigData,
    GetStylingConfigVars
  >(GET_STYLING_CONFIG, {
    variables: { catId: catId ?? "" },
    skip: !open || !catId,
    fetchPolicy: "cache-first",
  })

  const merged = useMemo(
    () => mergeStyleAttributes(styleDesign, data?.getStylingConfig ?? null),
    [styleDesign, data?.getStylingConfig]
  )

  const categoryImage = data?.getStylingConfig?.image?.trim() || null
  const note = styleDesign?.note?.trim() || ""
  const handDesign = styleDesign?.handDesign?.trim() || ""
  const monogram = styleDesign?.monogramLetter?.trim() || ""

  const fabricUrl = item?.fabricImage?.trim() || ""
  const refUrl = item?.referenceImage?.trim() || ""

  const openGallery = (images: string[], index: number) => {
    if (!images.length) return
    setGalleryImages(images)
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700")
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Styling form</title>
      <style>
        body { font-family: system-ui, sans-serif; color: #1c2430; margin: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #c5d8e3; padding: 8px; text-align: left; vertical-align: top; font-size: 12px; }
        th { background: #d5e6ef; }
        img { max-width: 120px; max-height: 120px; object-fit: contain; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        .meta { color: #5a6b78; font-size: 12px; margin-bottom: 12px; }
        .note { white-space: pre-wrap; }
      </style></head><body>${html}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
          showCloseButton={false}
        >
          <DialogHeader className="border-border flex shrink-0 flex-row items-start justify-between gap-3 border-b px-4 py-3 text-left">
            <div className="min-w-0">
              <DialogTitle className="truncate text-base">
                {item?.itemName || "Styling form"}
                {item?.itemNumber != null && item.itemNumber !== ""
                  ? ` · #${item.itemNumber}`
                  : ""}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
                View selected style attributes for this line item
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                disabled={!canShow || loading}
                onClick={handlePrint}
              >
                <PrinterIcon className="size-3.5" />
                Print
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-8"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!canShow ? (
              <p className="text-muted-foreground text-sm">
                No styling information found for this item.
              </p>
            ) : null}

            {canShow && !catId ? (
              <p className="text-destructive text-sm">
                Could not resolve product category for styling config.
              </p>
            ) : null}

            {canShow && catId && loading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading styling config…
              </div>
            ) : null}

            {error ? (
              <p className="text-destructive text-sm">{error.message}</p>
            ) : null}

            {canShow && catId && !loading && !error ? (
              <div ref={printRef} className="space-y-4">
                <h1 className="text-lg font-semibold tracking-tight">
                  {item?.itemName}
                  {item?.itemNumber != null && item.itemNumber !== ""
                    ? ` (${item.itemNumber})`
                    : ""}
                </h1>

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Product</th>
                        <th className="px-3 py-2 font-semibold">Order no.</th>
                        <th className="px-3 py-2 font-semibold">Customer</th>
                        <th className="px-3 py-2 font-semibold">Stylist</th>
                        <th className="px-3 py-2 font-semibold">Order date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-3 py-2">
                          {item?.itemName || "—"}
                          {item?.itemNumber != null && item.itemNumber !== ""
                            ? ` (${item.itemNumber})`
                            : ""}
                        </td>
                        <td className="px-3 py-2">
                          {target?.orderNo != null ? String(target.orderNo) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {target?.customerName || "—"}
                          {target?.customerId
                            ? ` · ${target.customerId}`
                            : ""}
                        </td>
                        <td className="px-3 py-2">
                          {target?.stylistName || "—"}
                        </td>
                        <td className="px-3 py-2">
                          {formatStoreOrderDate(target?.orderDate)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  {categoryImage ? (
                    <button
                      type="button"
                      className="border-border size-28 shrink-0 overflow-hidden rounded-lg border bg-white"
                      onClick={() => openGallery([categoryImage], 0)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={categoryImage}
                        alt=""
                        className="size-full object-contain p-2"
                      />
                    </button>
                  ) : null}
                  <div className="min-w-0 flex-1 space-y-2 text-sm">
                    {note ? (
                      <p className="note whitespace-pre-wrap rounded-lg border bg-muted/20 px-3 py-2">
                        {note}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-xs">No styling note</p>
                    )}
                    {handDesign ? (
                      <p className="text-xs">
                        <span className="text-muted-foreground">Hand design: </span>
                        {handDesign}
                      </p>
                    ) : null}
                    {monogram ? (
                      <p className="text-xs">
                        <span className="text-muted-foreground">Monogram: </span>
                        {monogram}
                      </p>
                    ) : null}
                  </div>
                </div>

                {merged.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {merged.map((row, index) => {
                      const img = row.option.image?.trim() || ""
                      return (
                        <div
                          key={`${row.masterName}-${row.option._id ?? index}`}
                          className="flex gap-3 rounded-lg border bg-card p-3"
                        >
                          <div className="text-muted-foreground w-6 shrink-0 pt-1 text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold tracking-wide uppercase text-[#2f6f8f]">
                              {row.label}
                            </p>
                            <p className="mt-0.5 text-sm font-medium">
                              {row.option.name || "—"}
                            </p>
                          </div>
                          {img ? (
                            <button
                              type="button"
                              className="border-border size-20 shrink-0 overflow-hidden rounded-md border bg-white"
                              onClick={() =>
                                openGallery(
                                  merged
                                    .map((m) => m.option.image?.trim() || "")
                                    .filter(Boolean),
                                  Math.max(
                                    0,
                                    merged
                                      .map((m) => m.option.image?.trim() || "")
                                      .filter(Boolean)
                                      .indexOf(img)
                                  )
                                )
                              }
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={row.option.name || row.label}
                                className="size-full object-contain p-1"
                              />
                            </button>
                          ) : (
                            <div className="bg-muted text-muted-foreground flex size-20 shrink-0 items-center justify-center rounded-md text-[10px]">
                              No image
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No matching style attributes for this category config.
                  </p>
                )}

                {(fabricUrl || refUrl) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {fabricUrl ? (
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-3 rounded-lg border bg-card p-3 text-left",
                          "hover:ring-1 hover:ring-[#2f6f8f]"
                        )}
                        onClick={() =>
                          openGallery(
                            [fabricUrl, refUrl].filter(Boolean),
                            0
                          )
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fabricUrl}
                          alt="Fabric"
                          className="size-24 rounded-md border object-cover"
                        />
                        <span className="text-sm font-medium">Fabric image</span>
                      </button>
                    ) : null}
                    {refUrl ? (
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-3 rounded-lg border bg-card p-3 text-left",
                          "hover:ring-1 hover:ring-[#2f6f8f]"
                        )}
                        onClick={() =>
                          openGallery(
                            [fabricUrl, refUrl].filter(Boolean),
                            fabricUrl ? 1 : 0
                          )
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={refUrl}
                          alt="Reference"
                          className="size-24 rounded-md border object-cover"
                        />
                        <span className="text-sm font-medium">Reference image</span>
                      </button>
                    ) : null}
                  </div>
                )}
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
        ariaLabel="Styling form images"
      />
    </>
  )
}
