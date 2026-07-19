"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { ImageOffIcon, PlayIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Button } from "@/components/ui/button"
import type {
  NestedOrderTrial,
  OrderTrialProduct,
  OrderTrialRow,
} from "@/lib/apollo/queries/trial"
import { cn } from "@/lib/utils"

type TrialProductGridRow = OrderTrialProduct & { __rowId: string }

type TrialProductsTableProps = {
  data?: OrderTrialRow | NestedOrderTrial | null
  measurementStatus?: string | null
}

type ProductGridContext = {
  measurementStatus?: string | null
  onOpenImages: (urls: string[], start?: number) => void
  onOpenVideo: (url: string) => void
}

function CellCenter({ children }: { children: ReactNode }) {
  return <div className="flex w-full items-center">{children}</div>
}

function StatusPill({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className="bg-muted inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium">
      {value}
    </span>
  )
}

function NoImagePlaceholder({ label }: { label: string }) {
  return (
    <span
      className="border-muted-foreground/40 bg-muted text-muted-foreground flex size-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed"
      title={label}
      aria-label={label}
    >
      <ImageOffIcon className="size-3 opacity-70" aria-hidden />
      <span className="text-[7px] leading-none font-medium tracking-wide uppercase">
        No image
      </span>
    </span>
  )
}

function ThumbCell({
  url,
  label,
  overlay,
  onPreview,
}: {
  url?: string | null
  label: string
  overlay?: string
  onPreview?: () => void
}) {
  const src = url?.trim() || ""
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = Boolean(src) && failedSrc === src

  if (!src || failed) {
    return <NoImagePlaceholder label={`No ${label.toLowerCase()}`} />
  }

  return (
    <button
      type="button"
      className="border-border relative size-10 shrink-0 overflow-hidden rounded-md border object-cover"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onPreview?.()
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN URLs vary */}
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        loading="lazy"
        onError={() => setFailedSrc(src)}
      />
      {overlay ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px] font-semibold text-white">
          {overlay}
        </span>
      ) : null}
    </button>
  )
}

function FabricCell(params: ICellRendererParams<TrialProductGridRow>) {
  const ctx = params.context as ProductGridContext
  const url = params.data?.fabricImageLink
  return (
    <CellCenter>
      <ThumbCell
        url={url}
        label="Fabric image"
        onPreview={() => url && ctx.onOpenImages([url])}
      />
    </CellCenter>
  )
}

function TrailImagesCell(params: ICellRendererParams<TrialProductGridRow>) {
  const ctx = params.context as ProductGridContext
  const trialImages = (params.data?.trialImageLinks ?? []).filter(Boolean)
  return (
    <CellCenter>
      <ThumbCell
        url={trialImages[0]}
        label="Trail images"
        overlay={trialImages.length > 1 ? `${trialImages.length}+` : undefined}
        onPreview={() => ctx.onOpenImages(trialImages)}
      />
    </CellCenter>
  )
}

function VideoCell(params: ICellRendererParams<TrialProductGridRow>) {
  const ctx = params.context as ProductGridContext
  const url = params.data?.trialVideoLink?.trim()
  if (!url) {
    return (
      <CellCenter>
        <span className="text-muted-foreground text-xs">—</span>
      </CellCenter>
    )
  }
  return (
    <CellCenter>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={(e) => {
          e.stopPropagation()
          ctx.onOpenVideo(url)
        }}
      >
        <PlayIcon className="size-3.5" />
        Play
      </Button>
    </CellCenter>
  )
}

function MeasurementCell(params: ICellRendererParams<TrialProductGridRow>) {
  const ctx = params.context as ProductGridContext
  return (
    <CellCenter>
      <StatusPill value={ctx.measurementStatus} />
    </CellCenter>
  )
}

function NoteCell(params: ICellRendererParams<TrialProductGridRow>) {
  const note = params.data?.trialNote?.trim()
  if (!note) {
    return (
      <CellCenter>
        <span className="text-muted-foreground text-xs">—</span>
      </CellCenter>
    )
  }
  return (
    <CellCenter>
      <span className="line-clamp-2 text-sm leading-snug" title={note}>
        {note}
      </span>
    </CellCenter>
  )
}

function NameCell(params: ICellRendererParams<TrialProductGridRow>) {
  const name = params.data?.name?.trim()
  return (
    <CellCenter>
      <span className={cn("truncate text-sm", !name && "text-muted-foreground")}>
        {name || "—"}
      </span>
    </CellCenter>
  )
}

function ProductIdCell(params: ICellRendererParams<TrialProductGridRow>) {
  const value = params.data?.itemNumber
  const text =
    value == null || value === "" ? "—" : String(value)
  return (
    <CellCenter>
      <span
        className={cn(
          "font-mono text-sm font-semibold",
          text === "—" && "text-muted-foreground"
        )}
      >
        {text}
      </span>
    </CellCenter>
  )
}

export function TrialProductsTable({
  data,
  measurementStatus,
}: TrialProductsTableProps) {
  const products = data?.products ?? []
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const openImages = useCallback((urls: string[], start = 0) => {
    const cleaned = urls.filter(Boolean)
    if (!cleaned.length) return
    setGalleryImages(cleaned)
    setGalleryIndex(start)
    setGalleryOpen(true)
  }, [])

  const openVideo = useCallback((url: string) => {
    setVideoUrl(url)
  }, [])

  const rows = useMemo<TrialProductGridRow[]>(
    () =>
      products.map((item, index) => ({
        ...item,
        __rowId: `${item.itemNumber ?? "item"}-${item.catId ?? "cat"}-${index}`,
      })),
    [products]
  )

  const context = useMemo<ProductGridContext>(
    () => ({
      measurementStatus,
      onOpenImages: openImages,
      onOpenVideo: openVideo,
    }),
    [measurementStatus, openImages, openVideo]
  )

  const defaultColDef = useMemo<ColDef<TrialProductGridRow>>(
    () => ({
      // Fixed widths → horizontal scroll instead of stretching columns.
      flex: null,
      resizable: true,
      sortable: true,
      filter: false,
    }),
    []
  )

  const columnDefs = useMemo<ColDef<TrialProductGridRow>[]>(
    () => [
      {
        colId: "itemNumber",
        field: "itemNumber",
        headerName: "Product ID",
        width: 120,
        minWidth: 100,
        filter: true,
        cellRenderer: ProductIdCell,
      },
      {
        colId: "fabric",
        headerName: "Fabric",
        width: 88,
        minWidth: 80,
        sortable: false,
        filter: false,
        cellRenderer: FabricCell,
      },
      {
        colId: "trailImages",
        headerName: "Trail images",
        width: 110,
        minWidth: 90,
        sortable: false,
        filter: false,
        cellRenderer: TrailImagesCell,
      },
      {
        colId: "name",
        field: "name",
        headerName: "Pro. Name",
        width: 160,
        minWidth: 120,
        filter: true,
        cellRenderer: NameCell,
        tooltipValueGetter: (p) => p.data?.name || null,
      },
      {
        colId: "video",
        headerName: "Video",
        width: 100,
        minWidth: 90,
        sortable: false,
        filter: false,
        cellRenderer: VideoCell,
      },
      {
        colId: "measurement",
        headerName: "Measurements",
        width: 130,
        minWidth: 110,
        sortable: false,
        filter: false,
        cellRenderer: MeasurementCell,
      },
      {
        colId: "note",
        field: "trialNote",
        headerName: "Note",
        width: 220,
        minWidth: 160,
        cellRenderer: NoteCell,
        tooltipValueGetter: (p) => p.data?.trialNote || null,
      },
    ],
    []
  )

  if (!products.length) {
    return (
      <p className="text-muted-foreground text-sm">No trail products yet.</p>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Trail Products</h3>
      <DataGrid<TrialProductGridRow>
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => params.data.__rowId}
        getRowHeight={() => 56}
        context={context}
        domLayout="autoHeight"
        alwaysShowHorizontalScroll
        className="mpf-trial-products-grid rounded-lg"
      />

      <ReceiptImagePreview
        open={galleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
        onOpenChange={setGalleryOpen}
        ariaLabel="Trail product images"
      />

      {videoUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal
          aria-label="Trail video"
          onClick={() => setVideoUrl(null)}
        >
          <div
            className="bg-background max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={videoUrl}
              controls
              autoPlay
              className="max-h-[80vh] w-full"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVideoUrl(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
