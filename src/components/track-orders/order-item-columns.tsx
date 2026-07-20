"use client"

import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { CheckIcon, PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { StoreOrderItem } from "@/lib/apollo/queries/store-orders"
import { formatStoreOrderDate } from "@/lib/track-orders/format"
import { cn } from "@/lib/utils"

export type OrderItemImagePreviewHandler = (images: string[], index: number) => void

export type OrderItemColumnHandlers = {
  onPreview?: OrderItemImagePreviewHandler
  onEditItem?: (item: StoreOrderItem) => void
  onEditProductionStatus?: (item: StoreOrderItem) => void
}

function itemImageUrls(item: StoreOrderItem): string[] {
  const urls: string[] = []
  const push = (url?: string | null) => {
    const trimmed = url?.trim()
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
  }
  push(item.readyItemImage)
  push(item.referenceImage)
  push(item.fabricImage)
  push(item.fitImage)
  return urls
}

function ThumbCell(
  params: ICellRendererParams<StoreOrderItem> & {
    field: keyof StoreOrderItem
    onPreview?: OrderItemImagePreviewHandler
  }
) {
  const url = params.data?.[params.field]
  const src = typeof url === "string" ? url.trim() : ""
  if (!src) {
    return <span className="text-muted-foreground text-xs">—</span>
  }
  const images = params.data ? itemImageUrls(params.data) : [src]
  const index = Math.max(0, images.indexOf(src))
  return (
    <button
      type="button"
      className="border-border size-9 overflow-hidden rounded border"
      title="View image"
      onClick={(e) => {
        e.stopPropagation()
        params.onPreview?.(images.length ? images : [src], index >= 0 ? index : 0)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" loading="lazy" />
    </button>
  )
}

function StatusPill({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className="bg-muted inline-flex max-w-full truncate rounded-md px-1.5 py-0.5 text-xs font-medium">
      {value}
    </span>
  )
}

function workshopsLabel(item?: StoreOrderItem | null) {
  if (!item) return "—"
  const parts = [
    item.itemWorkshopName && `Item: ${item.itemWorkshopName}`,
    item.fabricWorkshopName && `Fabric: ${item.fabricWorkshopName}`,
    item.embroideryWorkshopName && `Emb: ${item.embroideryWorkshopName}`,
    item.dyingWorkshopName && `Dying: ${item.dyingWorkshopName}`,
    item.stitchingWorkshopName && `Stitch: ${item.stitchingWorkshopName}`,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

export function buildOrderItemColumnDefs(
  handlers: OrderItemColumnHandlers = {}
): ColDef<StoreOrderItem>[] {
  const { onPreview, onEditItem, onEditProductionStatus } = handlers

  return [
    {
      headerName: "Prod.",
      field: "productionStatus",
      minWidth: 110,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => {
        const status = p.data?.productionStatus
        if (!status) {
          return (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                if (p.data) onEditProductionStatus?.(p.data)
              }}
            >
              Set…
            </button>
          )
        }
        const urgent = status.toUpperCase() === "URGENT"
        return (
          <button
            type="button"
            className={cn(
              "inline-flex max-w-full truncate rounded-md px-1.5 py-0.5 text-xs font-medium",
              urgent
                ? "bg-destructive/15 text-destructive"
                : "bg-muted text-foreground",
              "hover:ring-ring hover:ring-1"
            )}
            onClick={(e) => {
              e.stopPropagation()
              if (p.data) onEditProductionStatus?.(p.data)
            }}
          >
            {status}
          </button>
        )
      },
    },
    {
      headerName: "Product",
      field: "itemName",
      minWidth: 130,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "Item no.",
      field: "itemNumber",
      minWidth: 100,
      valueFormatter: (p) =>
        p.value == null || p.value === "" ? "—" : String(p.value),
    },
    {
      headerName: "Color",
      field: "itemColor",
      minWidth: 90,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "Fab code",
      field: "fabricCode",
      minWidth: 100,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "Ready img",
      colId: "readyItemImage",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => (
        <ThumbCell {...p} field="readyItemImage" onPreview={onPreview} />
      ),
    },
    {
      headerName: "Ref img",
      colId: "referenceImage",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => (
        <ThumbCell {...p} field="referenceImage" onPreview={onPreview} />
      ),
    },
    {
      headerName: "Fab img",
      colId: "fabricImage",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => (
        <ThumbCell {...p} field="fabricImage" onPreview={onPreview} />
      ),
    },
    {
      headerName: "Ready",
      minWidth: 110,
      valueGetter: (p: ValueGetterParams<StoreOrderItem>) =>
        formatStoreOrderDate(p.data?.readyDate),
    },
    {
      headerName: "Trial",
      minWidth: 110,
      valueGetter: (p: ValueGetterParams<StoreOrderItem>) =>
        formatStoreOrderDate(p.data?.trialDate),
    },
    {
      headerName: "Meas.",
      field: "measurementApprovalStatus",
      minWidth: 110,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => (
        <StatusPill value={p.data?.measurementApprovalStatus} />
      ),
    },
    {
      headerName: "Outfit",
      field: "outfitStatus",
      minWidth: 120,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => (
        <StatusPill value={p.data?.outfitStatus} />
      ),
    },
    {
      headerName: "Workshops",
      minWidth: 180,
      flex: 1.2,
      valueGetter: (p: ValueGetterParams<StoreOrderItem>) =>
        workshopsLabel(p.data),
      tooltipValueGetter: (p) => workshopsLabel(p.data),
    },
    {
      headerName: "Emb",
      field: "hasEmbroidary",
      minWidth: 70,
      maxWidth: 80,
      valueGetter: (p: ValueGetterParams<StoreOrderItem>) =>
        p.data?.hasEmbroidary ? 1 : 0,
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => {
        if (!p.data?.hasEmbroidary) return <span>No</span>
        return (
          <CheckIcon
            className="size-4 text-emerald-700 dark:text-emerald-400"
            aria-label="Has embroidery"
          />
        )
      },
    },
    {
      headerName: "Note",
      field: "trackingNote",
      minWidth: 140,
      valueFormatter: (p) => p.value || "—",
    },
    {
      headerName: "",
      colId: "itemActions",
      minWidth: 84,
      maxWidth: 96,
      sortable: false,
      filter: false,
      pinned: "right",
      cellRenderer: (p: ICellRendererParams<StoreOrderItem>) => {
        if (!p.data) return null
        return (
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="h-7 gap-1 px-2"
            onClick={(e) => {
              e.stopPropagation()
              onEditItem?.(p.data!)
            }}
          >
            <PencilIcon className="size-3.5" />
            Edit
          </Button>
        )
      },
    },
  ]
}
