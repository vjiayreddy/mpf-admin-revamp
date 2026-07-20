"use client"

import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import {
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

import { DesignSummaryBootas } from "@/components/embroidery/design-summary/bootas"
import { DesignSummaryHeader } from "@/components/embroidery/design-summary/header"
import { DesignSummaryImages } from "@/components/embroidery/design-summary/images"
import { DesignSummaryMaterials } from "@/components/embroidery/design-summary/materials"
import { DesignSummaryMonograms } from "@/components/embroidery/design-summary/monograms"
import { DesignSummaryWorkDetails } from "@/components/embroidery/design-summary/work-details"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_EMBROIDERY_BY_ID,
  type EmbroideryDetail,
  type GetEmbroideryByIdData,
  type GetEmbroideryByIdVars,
} from "@/lib/apollo/queries/embroidery"
import {
  exportEmbroideryDesignPdf,
  type DesignPdfAction,
} from "@/lib/embroidery/download-design-pdf"
import { notify } from "@/lib/notify"

type EmbroideryDesignSummaryDialogProps = {
  embroideryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmbroideryDesignSummaryDialog({
  embroideryId,
  open,
  onOpenChange,
}: EmbroideryDesignSummaryDialogProps) {
  const [pdfBusy, setPdfBusy] = useState(false)

  const [fetchDetail, { data, loading, error }] = useLazyQuery<
    GetEmbroideryByIdData,
    GetEmbroideryByIdVars
  >(GET_EMBROIDERY_BY_ID, { fetchPolicy: "network-only" })

  useEffect(() => {
    if (!open || !embroideryId) return
    setPdfBusy(false)
    void fetchDetail({ variables: { id: embroideryId } })
  }, [open, embroideryId, fetchDetail])

  const row: EmbroideryDetail | undefined = data?.getEmbroideryById

  const runPdfExport = async (action: DesignPdfAction) => {
    if (!row || pdfBusy) return
    setPdfBusy(true)
    try {
      await exportEmbroideryDesignPdf(row, action)
      notify.success(
        action === "open" ? "PDF opened in a new tab" : "PDF downloaded"
      )
    } catch (err) {
      notify.fromError(err, "Failed to generate PDF")
    } finally {
      setPdfBusy(false)
    }
  }

  const title = row?.embroideryReqNo
    ? `Embroidery design · ${row.embroideryReqNo}`
    : "Embroidery design"

  const subtitle = row
    ? [
        row.storeOrderProductNumber,
        row.fabricName && `Fabric: ${row.fabricName}`,
        row.fabricColor && `Color: ${row.fabricColor}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Review design details, then download or open a PDF to print."

  const pdfDisabled = !row || loading || pdfBusy

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(96vh,56rem)] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="bg-background/95 supports-backdrop-filter:bg-background/80 shrink-0 border-b px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-0 sm:pr-2">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="truncate text-base sm:text-lg">
                {title}
              </DialogTitle>
              <DialogDescription className="line-clamp-2 text-xs sm:text-sm">
                {subtitle}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {row?._id ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    window.open(
                      `/embroidery/form?id=${encodeURIComponent(row._id)}`,
                      "_blank"
                    )
                  }}
                >
                  <ExternalLinkIcon className="size-3.5" />
                  Ops form
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                className="h-8"
                disabled={pdfDisabled}
                onClick={() => void runPdfExport("download")}
              >
                {pdfBusy ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <DownloadIcon className="size-3.5" />
                )}
                {pdfBusy ? "Generating…" : "Download PDF"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={pdfDisabled}
                onClick={() => void runPdfExport("open")}
              >
                <FileTextIcon className="size-3.5" />
                Open PDF
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
          </div>
        </DialogHeader>

        <div className="bg-muted/40 min-h-0 flex-1 overflow-y-auto">
          {loading && !row ? (
            <div className="mx-auto flex max-w-5xl flex-col gap-4 p-5 sm:p-6">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : null}
          {error ? (
            <p className="text-destructive p-6 text-sm" role="alert">
              Failed to load embroidery design details.
            </p>
          ) : null}
          {row ? (
            <div className="mx-auto flex max-w-5xl flex-col gap-6 p-5 sm:p-6">
              <DesignSummaryHeader row={row} />
              <DesignSummaryImages row={row} />
              <DesignSummaryWorkDetails row={row} />
              <DesignSummaryBootas bootas={row.bootas} />
              <DesignSummaryMonograms monograms={row.monograms} />
              <DesignSummaryMaterials samples={row.workMaterialSamples} />
              <p className="text-muted-foreground pb-2 text-center text-[11px]">
                MyPerfectFit · Embroidery design summary
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
