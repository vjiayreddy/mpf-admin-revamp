"use client"

import { useMemo, useRef, useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import { QualityCheckChecklist } from "@/components/quality-check/quality-check-checklist"
import { QualityCheckHeader } from "@/components/quality-check/quality-check-header"
import { QualityCheckSummary } from "@/components/quality-check/quality-check-summary"
import { QcMeasurementCompareTable } from "@/components/quality-check/qc-measurement-compare-table"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  GET_ORDER_QUALITY_CHECK_BY_ID,
  type GetOrderQualityCheckByIdData,
  type GetOrderQualityCheckByIdVars,
} from "@/lib/apollo/queries/quality-check"
import {
  GET_USER_MEASUREMENTS,
  type GetUserMeasurementsData,
  type GetUserMeasurementsVars,
} from "@/lib/apollo/queries/measurements"
import { resolveQcCompareLayout } from "@/lib/quality-check/compare-registry"
import { resolveProductCatId } from "@/lib/track-orders/product-cat-id"

export type QualityCheckViewTarget = {
  orderQualityCheckId: string
  orderId?: string
  orderNo?: string | number | null
  customerName?: string | null
  itemName?: string | null
  itemNumber?: string | number | null
}

export type QualityCheckViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: QualityCheckViewTarget | null
}

function formatTimestamp(ts?: string | null): string | null {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function QualityCheckView({
  open,
  onOpenChange,
  target,
}: QualityCheckViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)

  const qcId = target?.orderQualityCheckId?.trim() || ""
  const canFetchQc = open && Boolean(qcId)

  const {
    data: qcData,
    loading: qcLoading,
    error: qcError,
  } = useQuery<GetOrderQualityCheckByIdData, GetOrderQualityCheckByIdVars>(
    GET_ORDER_QUALITY_CHECK_BY_ID,
    {
      variables: { orderQualityCheckId: qcId },
      skip: !canFetchQc,
      fetchPolicy: "cache-first",
    }
  )

  const qc = qcData?.getOrderQualityCheckById ?? null

  const matchedItem = useMemo(() => {
    const items = qc?.storeProductOrder?.orderItems ?? []
    const itemNumber = qc?.itemNumber
    if (itemNumber == null) return items[0] ?? null
    return (
      items.find((i) => String(i?.itemNumber ?? "") === String(itemNumber)) ??
      items[0] ??
      null
    )
  }, [qc])

  const catId =
    qc?.catId?.trim() ||
    resolveProductCatId(
      matchedItem?.itemName || qc?.name,
      matchedItem?.itemCatId
    ) ||
    ""

  const userId = qc?.userId?.trim() || ""
  const canFetchMeasurements = canFetchQc && Boolean(userId && catId) && !qcLoading && Boolean(qc)

  const {
    data: measurementsData,
    loading: measurementsLoading,
    error: measurementsError,
  } = useQuery<GetUserMeasurementsData, GetUserMeasurementsVars>(
    GET_USER_MEASUREMENTS,
    {
      variables: { userId, catId, page: 1, limit: 1 },
      skip: !canFetchMeasurements,
      fetchPolicy: "cache-first",
    }
  )

  const measurement = measurementsData?.getUserMeasurements?.[0] ?? null
  const compareRows = useMemo(
    () => resolveQcCompareLayout(catId, measurement?.options),
    [catId, measurement?.options]
  )

  const clientName =
    [
      qc?.storeProductOrder?.customerFirstName,
      qc?.storeProductOrder?.customerLastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    target?.customerName ||
    null

  const title = `QC · ${qc?.name || target?.itemName || "Quality check"}${
    qc?.itemNumber != null && qc.itemNumber !== ""
      ? ` #${qc.itemNumber}`
      : target?.itemNumber != null
        ? ` #${target.itemNumber}`
        : ""
  }`

  const images = useMemo(() => {
    const list: Array<{ label: string; url: string }> = []
    const push = (label: string, url?: string | null) => {
      const trimmed = url?.trim()
      if (trimmed) list.push({ label, url: trimmed })
    }
    push("Fabric", matchedItem?.fabricImage)
    push("Style", matchedItem?.styleDesignImage)
    push("Product", qc?.productImage)
    return list
  }, [matchedItem, qc?.productImage])

  const openGallery = (imgs: string[], index: number) => {
    if (!imgs.length) return
    setGalleryImages(imgs)
    setGalleryInitialIndex(index)
    setGalleryOpen(true)
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const win = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=900,height=700"
    )
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: system-ui, sans-serif; color: #1c2430; margin: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #c5d8e3; padding: 6px 8px; font-size: 11px; vertical-align: top; }
        th { background: #d5e6ef; }
        img { max-width: 160px; max-height: 160px; object-fit: contain; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        h3 { font-size: 14px; margin: 12px 0 6px; }
      </style></head><body>${html}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  const loading = qcLoading || (canFetchMeasurements && measurementsLoading)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Quality check details for this order item
          </DialogDescription>

          <QualityCheckHeader
            title={title}
            subtitle={clientName}
            status={qc?.qualityCheckStatus}
            printDisabled={!qc || loading}
            onPrint={handlePrint}
            onClose={() => onOpenChange(false)}
          />

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!qcId ? (
              <p className="text-muted-foreground text-sm">
                Missing quality check id.
              </p>
            ) : null}

            {canFetchQc && qcLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading quality check…
              </div>
            ) : null}

            {qcError ? (
              <p className="text-destructive text-sm">{qcError.message}</p>
            ) : null}

            {canFetchQc && !qcLoading && !qcError && !qc ? (
              <p className="text-muted-foreground text-sm">
                Quality check not found.
              </p>
            ) : null}

            {qc && !qcLoading ? (
              <div ref={printRef} className="space-y-5">
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

                <QualityCheckSummary
                  clientName={clientName}
                  orderNo={
                    qc.storeProductOrder?.orderNo ?? target?.orderNo ?? null
                  }
                  orderDate={formatTimestamp(
                    qc.storeProductOrder?.orderDate?.timestamp
                  )}
                  trialDate={formatTimestamp(
                    qc.storeProductOrder?.trialDate?.timestamp
                  )}
                  stylistName={qc.stylist?.name}
                  itemName={matchedItem?.itemName || qc.name}
                  itemNumber={qc.itemNumber}
                  itemColor={matchedItem?.itemColor}
                  qualityCheckNote={qc.qualityCheckNote}
                  images={images}
                  onImageClick={openGallery}
                />

                <QualityCheckChecklist source={qc} />

                {measurementsError ? (
                  <p className="text-destructive text-sm">
                    {measurementsError.message}
                  </p>
                ) : null}

                {canFetchMeasurements && measurementsLoading ? (
                  <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
                    <Loader2Icon className="size-4 animate-spin" />
                    Loading measurements…
                  </div>
                ) : null}

                {!canFetchMeasurements && !measurementsLoading ? (
                  <p className="text-muted-foreground text-sm">
                    Could not resolve customer or category for measurement
                    comparison.
                  </p>
                ) : null}

                {canFetchMeasurements &&
                !measurementsLoading &&
                !measurementsError ? (
                  measurement?.options?.length ? (
                    <QcMeasurementCompareTable
                      rows={compareRows}
                      options={measurement.options}
                      actualMeasurement={qc.actualMeasurement}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No saved measurements found for this category.
                    </p>
                  )
                ) : null}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <ReceiptImagePreview
        open={galleryOpen}
        images={galleryImages}
        initialIndex={galleryInitialIndex}
        onOpenChange={setGalleryOpen}
        ariaLabel="Quality check images"
      />
    </>
  )
}

/** Build the QC create/edit form href (same-tab navigation). */
export function qualityCheckFormHref(params: {
  orderId?: string | null
  orderItemId?: string | null
  orderItemNumber?: string | number | null
  qcItemId?: string | null
}): string {
  const search = new URLSearchParams()
  if (params.qcItemId) search.set("qcItemId", params.qcItemId)
  if (params.orderId) search.set("orderId", params.orderId)
  if (params.orderItemId) search.set("orderItemId", params.orderItemId)
  if (params.orderItemNumber != null && params.orderItemNumber !== "") {
    search.set("orderItemNumber", String(params.orderItemNumber))
  }
  const qs = search.toString()
  return qs ? `/quality-check/form?${qs}` : "/quality-check/form"
}

/** Navigate to QC form in the same tab. Prefer router.push(qualityCheckFormHref(...)). */
export function openQualityCheckEdit(params: {
  orderId?: string | null
  orderItemId?: string | null
  orderItemNumber?: string | number | null
  qcItemId: string
}) {
  window.location.assign(qualityCheckFormHref(params))
}
