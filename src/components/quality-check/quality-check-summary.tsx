"use client"

import { ExpandIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type QualityCheckImage = {
  label: string
  url: string
}

export type QualityCheckSummaryProps = {
  clientName?: string | null
  orderNo?: string | number | null
  orderDate?: string | null
  trialDate?: string | null
  stylistName?: string | null
  itemName?: string | null
  itemNumber?: string | number | null
  itemColor?: string | null
  qualityCheckNote?: string | null
  images: QualityCheckImage[]
  onImageClick?: (images: string[], index: number) => void
  className?: string
}

export function QualityCheckSummary({
  clientName,
  orderNo,
  orderDate,
  trialDate,
  stylistName,
  itemName,
  itemNumber,
  itemColor,
  qualityCheckNote,
  images,
  onImageClick,
  className,
}: QualityCheckSummaryProps) {
  const gallery = images.map((img) => img.url)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-xs">
          <tbody>
            <tr className="border-b">
              <td className="text-muted-foreground w-36 px-3 py-2">Client</td>
              <td className="px-3 py-2 font-medium">{clientName || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-3 py-2">Order no.</td>
              <td className="px-3 py-2 font-medium">
                {orderNo != null ? String(orderNo) : "—"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-3 py-2">Order date</td>
              <td className="px-3 py-2 font-medium">{orderDate || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-3 py-2">Trial date</td>
              <td className="px-3 py-2 font-medium">{trialDate || "—"}</td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-3 py-2">Product</td>
              <td className="px-3 py-2 font-medium">
                {itemName || "—"}
                {itemNumber != null && itemNumber !== ""
                  ? ` · #${itemNumber}`
                  : ""}
                {itemColor ? ` · ${itemColor}` : ""}
              </td>
            </tr>
            <tr className="border-b">
              <td className="text-muted-foreground px-3 py-2">Stylist</td>
              <td className="px-3 py-2 font-medium">{stylistName || "—"}</td>
            </tr>
            <tr>
              <td className="text-muted-foreground px-3 py-2 align-top">
                QC note
              </td>
              <td className="px-3 py-2 whitespace-pre-wrap">
                {qualityCheckNote?.trim() || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div className="bg-muted/50 mb-2 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
          Images
        </div>
        {images.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={`${image.label}-${image.url}`}
                type="button"
                className="group border-border bg-muted/20 hover:border-foreground/30 focus-visible:ring-ring relative flex flex-col overflow-hidden rounded-lg border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => onImageClick?.(gallery, index)}
              >
                <div className="bg-background flex h-40 w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.label}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="border-border flex items-center justify-between border-t px-2.5 py-1.5">
                  <span className="text-xs font-medium">{image.label}</span>
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                    <ExpandIcon className="size-3" />
                    Enlarge
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">No images</p>
        )}
      </div>
    </div>
  )
}
