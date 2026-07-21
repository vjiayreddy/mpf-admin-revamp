"use client"

import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { FileTextIcon } from "lucide-react"

import {
  formatProductLabel,
  type OrderFormItem,
} from "@/lib/orders/form"
import { formatRupees } from "@/lib/track-orders/format"
import { cn } from "@/lib/utils"

export type OrderViewItemImagePreviewHandler = (
  images: string[],
  index: number
) => void

export type OrderViewItemColumnHandlers = {
  onPreview?: OrderViewItemImagePreviewHandler
  onViewStyling: (item: OrderFormItem) => void
  onViewEmbroidery: (item: OrderFormItem) => void
}

function itemImageUrls(item: OrderFormItem): string[] {
  const urls: string[] = []
  const push = (url?: string | null) => {
    const trimmed = url?.trim()
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
  }
  push(item.fabricImage)
  push(item.referenceImage)
  push(item.fitImage)
  return urls
}

function formatDateInput(value?: string | null) {
  if (!value?.trim()) return "—"
  const date = new Date(`${value.trim()}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function hasStyleDesign(item?: OrderFormItem | null) {
  if (!item?.styleDesign) return false
  const s = item.styleDesign
  if (s.handDesign?.trim() || s.monogramLetter?.trim() || s.note?.trim()) {
    return true
  }
  return (s.styleAttributes ?? []).some(
    (a) => a?.name?.trim() || a?.value?.trim() || a?.image?.trim()
  )
}

function hasEmbDesign(item?: OrderFormItem | null) {
  return Boolean(
    item?.embDetails?.embroideryId?.trim() || item?.embDesignDetails?.trim()
  )
}

function DesignIconButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string
  active: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={!onClick}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border bg-muted/40 text-muted-foreground",
        onClick && active && "cursor-pointer",
        !onClick && "cursor-default"
      )}
    >
      {children}
    </button>
  )
}

function ThumbCell({
  params,
  imageField,
  onPreview,
}: {
  params: ICellRendererParams<OrderFormItem>
  imageField: "fabricImage" | "referenceImage" | "fitImage"
  onPreview?: OrderViewItemImagePreviewHandler
}) {
  const item = params.data
  const src = item?.[imageField]?.trim() || ""

  if (!src) {
    return <span className="text-muted-foreground text-xs">—</span>
  }

  const images = item ? itemImageUrls(item) : [src]
  const index = Math.max(0, images.indexOf(src))

  return (
    <button
      type="button"
      className="border-border mt-1 size-7 overflow-hidden rounded border"
      title="View image"
      onClick={(e) => {
        e.stopPropagation()
        onPreview?.(images.length ? images : [src], index >= 0 ? index : 0)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" loading="lazy" />
    </button>
  )
}

/** Read-only product columns for the order details modal. */
export function buildOrderViewItemColumnDefs(
  handlers: OrderViewItemColumnHandlers
): ColDef<OrderFormItem>[] {
  const { onPreview, onViewStyling, onViewEmbroidery } = handlers

  return [
    {
      headerName: "Product",
      field: "itemName",
      minWidth: 130,
      flex: 1.1,
      valueFormatter: (p) =>
        p.value ? formatProductLabel(String(p.value)) : "—",
    },
    {
      headerName: "P.No",
      field: "itemNumber",
      minWidth: 100,
      valueFormatter: (p) =>
        p.value == null || p.value === "" ? "—" : String(p.value),
    },
    {
      headerName: "Emb",
      colId: "embDesign",
      minWidth: 90,
      maxWidth: 110,
      sortable: false,
      filter: false,
      valueGetter: (p: ValueGetterParams<OrderFormItem>) => {
        if (hasEmbDesign(p.data)) {
          return p.data?.embDetails?.embroideryId?.trim() || "Draft"
        }
        return p.data?.hasEmbroidary ? "Yes" : "No"
      },
      cellRenderer: (p: ICellRendererParams<OrderFormItem>) => {
        const row = p.data
        if (!row) return null

        if (hasEmbDesign(row)) {
          const embId = row.embDetails?.embroideryId?.trim()
          const status = row.embDetails?.embStatus?.trim()
          const title = embId
            ? status
              ? `View embroidery · ${embId} · ${status}`
              : `View embroidery · ${embId}`
            : "View embroidery draft details"
          return (
            <div className="flex items-center gap-1.5 py-0.5">
              <DesignIconButton
                title={title}
                active
                onClick={() => onViewEmbroidery(row)}
              >
                <FileTextIcon className="size-4" />
              </DesignIconButton>
            </div>
          )
        }

        const yes = Boolean(row.hasEmbroidary)
        return (
          <span
            className={cn(
              "inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium",
              yes
                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {yes ? "Yes" : "No"}
          </span>
        )
      },
    },
    {
      headerName: "Color",
      field: "itemColor",
      minWidth: 90,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "FabCode",
      field: "fabricCode",
      minWidth: 100,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "Fab Pic",
      colId: "fabricImage",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<OrderFormItem>) => (
        <ThumbCell params={p} imageField="fabricImage" onPreview={onPreview} />
      ),
    },
    {
      headerName: "Ref Pic",
      colId: "referenceImage",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<OrderFormItem>) => (
        <ThumbCell
          params={p}
          imageField="referenceImage"
          onPreview={onPreview}
        />
      ),
    },
    {
      headerName: "Fit Pic",
      colId: "fitImage",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<OrderFormItem>) => (
        <ThumbCell params={p} imageField="fitImage" onPreview={onPreview} />
      ),
    },
    {
      headerName: "Styling",
      colId: "styleDesign",
      minWidth: 90,
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<OrderFormItem>) => {
        const row = p.data
        if (!row) return null
        const active = hasStyleDesign(row)
        return (
          <DesignIconButton
            title={active ? "View styling details" : "No styling set"}
            active={active}
            onClick={active ? () => onViewStyling(row) : undefined}
          >
            <FileTextIcon
              className={cn("size-4", !active && "opacity-50")}
            />
          </DesignIconButton>
        )
      },
    },
    {
      headerName: "Ready",
      colId: "readyDate",
      minWidth: 110,
      valueGetter: (p: ValueGetterParams<OrderFormItem>) =>
        formatDateInput(p.data?.readyDate),
    },
    {
      headerName: "Trial",
      colId: "trialDate",
      minWidth: 110,
      valueGetter: (p: ValueGetterParams<OrderFormItem>) =>
        formatDateInput(p.data?.trialDate),
    },
    {
      headerName: "Occasion",
      field: "occasion",
      minWidth: 110,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "Price",
      field: "itemPrice",
      minWidth: 100,
      type: "rightAligned",
      valueFormatter: (p) => formatRupees(Number(p.value) || 0),
    },
  ]
}
