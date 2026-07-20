"use client"

import { useState } from "react"
import { EyeIcon, PencilIcon } from "lucide-react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"

import { EmbroideryRowActions } from "@/components/embroidery/embroidery-row-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getEmbroideryStatusLabel } from "@/config/embroidery-status"
import type { EmbroideryListRow } from "@/lib/apollo/queries/embroidery"
import {
  firstImageUrl,
  firstName,
  formatEmbroideryDate,
  formatWorkType,
  hasEmbroideryDesignData,
} from "@/lib/embroidery/format"
import { cn } from "@/lib/utils"

function EditableDateCell({
  label,
  onEdit,
}: {
  label: string
  onEdit: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 max-w-full gap-1 px-2 text-xs font-normal"
      onClick={(e) => {
        e.stopPropagation()
        onEdit()
      }}
    >
      <span className="truncate">{label}</span>
      <PencilIcon className="size-3 shrink-0 text-orange-500" />
    </Button>
  )
}

function ImageThumb({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) {
  const [open, setOpen] = useState(false)
  if (!src) return <span className="text-muted-foreground">—</span>
  return (
    <>
      <button
        type="button"
        className="border-border my-0.5 block size-9 shrink-0 overflow-hidden rounded-sm border"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        aria-label={`View ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="size-full object-cover" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

type EmbroideryColumnsArgs = {
  onOpenOpsForm: (row: EmbroideryListRow) => void
  onOpenDesign: (row: EmbroideryListRow) => void
  onUpdateDetails: (row: EmbroideryListRow) => void
}

export function buildEmbroideryColumnDefs({
  onOpenOpsForm,
  onOpenDesign,
  onUpdateDetails,
}: EmbroideryColumnsArgs): ColDef<EmbroideryListRow>[] {
  return [
    {
      colId: "more",
      headerName: "More",
      minWidth: 70,
      maxWidth: 80,
      pinned: "left",
      lockPosition: "left",
      sortable: false,
      filter: false,
      suppressMovable: true,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => {
        const row = params.data
        if (!row) return null
        return (
          <EmbroideryRowActions
            row={row}
            onOpenOpsForm={onOpenOpsForm}
            onOpenDesign={onOpenDesign}
            onUpdateDetails={onUpdateDetails}
          />
        )
      },
    },
    {
      colId: "embroideryReqNo",
      headerName: "E.No",
      field: "embroideryReqNo",
      minWidth: 100,
      pinned: "left",
      valueFormatter: (p) => p.value || "—",
    },
    {
      colId: "storeOrderProductNumber",
      headerName: "Product No",
      field: "storeOrderProductNumber",
      minWidth: 130,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => {
        const row = params.data
        if (!row) return null
        return (
          <button
            type="button"
            className="text-primary truncate font-medium hover:underline"
            onClick={(e) => {
              e.stopPropagation()
              onOpenOpsForm(row)
            }}
          >
            {row.storeOrderProductNumber || "—"}
          </button>
        )
      },
    },
    {
      colId: "embDesignForm",
      headerName: "Design",
      minWidth: 90,
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => {
        const row = params.data
        if (!row) return null
        const hasDesign = hasEmbroideryDesignData(row)
        return (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label={
              hasDesign
                ? "View embroidery design (design data present)"
                : "View embroidery design"
            }
            onClick={(e) => {
              e.stopPropagation()
              onOpenDesign(row)
            }}
          >
            <EyeIcon
              className={cn(
                "size-4",
                hasDesign
                  ? "text-orange-500"
                  : "text-muted-foreground"
              )}
            />
          </Button>
        )
      },
    },
    {
      colId: "customerName",
      headerName: "Customer",
      field: "customerName",
      minWidth: 160,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        p.data?.customerName || "—",
    },
    {
      colId: "stylist",
      headerName: "Stylist",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        firstName(p.data?.stylist),
    },
    {
      colId: "orderDate",
      headerName: "Order Date",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        formatEmbroideryDate(p.data?.orderDate),
    },
    {
      colId: "orderTrialDate",
      headerName: "Order Trial",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        formatEmbroideryDate(p.data?.storeOrder?.trialDate),
    },
    {
      colId: "trialDate",
      headerName: "Item Trial",
      minWidth: 150,
      sortable: false,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => {
        const row = params.data
        if (!row) return null
        const label = formatEmbroideryDate(
          row.orderItemAttributes?.trialDate ?? row.trialDate
        )
        return (
          <EditableDateCell
            label={label === "—" ? "Update" : label}
            onEdit={() => onUpdateDetails(row)}
          />
        )
      },
    },
    {
      colId: "markingExpectedDate",
      headerName: "Marking Expected",
      minWidth: 160,
      sortable: false,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => {
        const row = params.data
        if (!row) return null
        const label = formatEmbroideryDate(row.markingExpectedDate)
        return (
          <EditableDateCell
            label={label === "—" ? "Update" : label}
            onEdit={() => onUpdateDetails(row)}
          />
        )
      },
    },
    {
      colId: "embReadyDate",
      headerName: "Emb Completion",
      minWidth: 130,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        formatEmbroideryDate(p.data?.embReadyDate),
    },
    {
      colId: "orderStatus",
      headerName: "Order Status",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        p.data?.storeOrder?.orderStatus || p.data?.orderStatus || "—",
    },
    {
      colId: "studio",
      headerName: "Studio",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        firstName(p.data?.studio),
    },
    {
      colId: "fabricImage",
      headerName: "Fabric",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => (
        <ImageThumb
          src={firstImageUrl(
            params.data?.fabricImage,
            params.data?.orderItemAttributes?.fabricImage
          )}
          alt="Fabric"
        />
      ),
    },
    {
      colId: "referenceImage",
      headerName: "Reference",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => (
        <ImageThumb
          src={firstImageUrl(
            params.data?.referenceImage,
            params.data?.orderItemAttributes?.referenceImage
          )}
          alt="Reference"
        />
      ),
    },
    {
      colId: "designReferencesImageUrls",
      headerName: "Emb Ref",
      minWidth: 80,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<EmbroideryListRow>) => (
        <ImageThumb
          src={firstImageUrl(params.data?.designReferencesImageUrls)}
          alt="Embroidery reference"
        />
      ),
    },
    {
      colId: "workType",
      headerName: "Work Type",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        formatWorkType(p.data?.workType),
    },
    {
      colId: "stitchingWorkshop",
      headerName: "Stitching Workshop",
      minWidth: 150,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        p.data?.orderItemAttributes?.stitchingWorkshopName || "—",
    },
    {
      colId: "embStatus",
      headerName: "Emb Status",
      minWidth: 130,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        getEmbroideryStatusLabel("embStatus", p.data?.embStatus),
    },
    {
      colId: "markingStatus",
      headerName: "Marking",
      minWidth: 130,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        getEmbroideryStatusLabel("markingStatus", p.data?.markingStatus),
    },
    {
      colId: "sampleStatus",
      headerName: "Sample",
      minWidth: 140,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        getEmbroideryStatusLabel("sampleStatus", p.data?.sampleStatus),
    },
    {
      colId: "paperStatus",
      headerName: "Paper",
      minWidth: 130,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        getEmbroideryStatusLabel("paperStatus", p.data?.paperStatus),
    },
    {
      colId: "approvalStatus",
      headerName: "Approval",
      minWidth: 120,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        getEmbroideryStatusLabel("approvalStatus", p.data?.approvalStatus),
    },
    {
      colId: "qcStatus",
      headerName: "QC",
      minWidth: 110,
      valueGetter: (p: ValueGetterParams<EmbroideryListRow>) =>
        getEmbroideryStatusLabel("qcStatus", p.data?.qcStatus),
    },
    {
      colId: "embRemark",
      headerName: "Remark",
      field: "embRemark",
      minWidth: 160,
      valueFormatter: (p) => p.value || "—",
    },
  ]
}
