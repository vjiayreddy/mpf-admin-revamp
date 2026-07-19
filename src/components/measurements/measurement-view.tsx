"use client"

import { useMemo, useRef, useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import { MeasurementBodySummary } from "@/components/measurements/measurement-body-summary"
import { MeasurementCategoryTable } from "@/components/measurements/measurement-category-table"
import { MeasurementViewHeader } from "@/components/measurements/measurement-view-header"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  GET_BODY_PROFILE,
  type GetBodyProfileData,
  type GetBodyProfileVars,
} from "@/lib/apollo/queries/body-profile"
import {
  GET_USER_MEASUREMENTS,
  type GetUserMeasurementsData,
  type GetUserMeasurementsVars,
} from "@/lib/apollo/queries/measurements"
import { resolveMeasurementCategory } from "@/lib/measurements/category-registry"
import { hasMeasurementOptions } from "@/lib/measurements/has-measurement-options"

export type MeasurementViewTarget = {
  userId: string
  catId: string
  orderId?: string
  orderNo?: string | number | null
  customerName?: string | null
  customerId?: string | null
  itemName?: string | null
  stylistName?: string | null
}

export type MeasurementViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: MeasurementViewTarget | null
}

export function MeasurementView({
  open,
  onOpenChange,
  target,
}: MeasurementViewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)

  const userId = target?.userId?.trim() || ""
  const catId = target?.catId?.trim() || ""
  const canFetch = open && Boolean(userId && catId)

  const {
    data: measurementsData,
    loading: measurementsLoading,
    error: measurementsError,
  } = useQuery<GetUserMeasurementsData, GetUserMeasurementsVars>(
    GET_USER_MEASUREMENTS,
    {
      variables: { userId, catId, page: 1, limit: 1 },
      skip: !canFetch,
      fetchPolicy: "cache-first",
    }
  )

  const {
    data: bodyData,
    loading: bodyLoading,
    error: bodyError,
  } = useQuery<GetBodyProfileData, GetBodyProfileVars>(GET_BODY_PROFILE, {
    variables: { userId },
    skip: !canFetch,
    fetchPolicy: "cache-first",
  })

  const measurement = measurementsData?.getUserMeasurements?.[0] ?? null
  const bodyProfile = bodyData?.getBodyProfile?.[0] ?? null

  const category = useMemo(
    () => resolveMeasurementCategory(catId, measurement?.options),
    [catId, measurement?.options]
  )

  const loading = measurementsLoading || bodyLoading
  const title = `${category.name.toUpperCase()} MEASUREMENTS`
  const subtitle = [
    target?.customerName,
    target?.customerId ? `(${target.customerId})` : null,
    target?.itemName,
  ]
    .filter(Boolean)
    .join(" · ")

  const openGallery = (images: string[], index: number) => {
    if (!images.length) return
    setGalleryImages(images)
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
        th, td { border: 1px solid #c5d8e3; padding: 8px; text-align: center; vertical-align: top; font-size: 12px; }
        th { background: #d5e6ef; }
        img { max-width: 180px; max-height: 240px; object-fit: contain; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        h3 { font-size: 14px; margin: 12px 0 6px; }
        .meta { color: #5a6b78; font-size: 12px; margin-bottom: 12px; }
      </style></head><body>${html}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            View customer measurements for this product category
          </DialogDescription>

          <MeasurementViewHeader
            title={title}
            subtitle={subtitle}
            printDisabled={!canFetch || loading || !measurement}
            onPrint={handlePrint}
            onClose={() => onOpenChange(false)}
          />

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!userId || !catId ? (
              <p className="text-muted-foreground text-sm">
                Missing customer or product category for measurements.
              </p>
            ) : null}

            {canFetch && loading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading measurements…
              </div>
            ) : null}

            {measurementsError ? (
              <p className="text-destructive text-sm">
                {measurementsError.message}
              </p>
            ) : null}
            {bodyError ? (
              <p className="text-destructive text-sm">{bodyError.message}</p>
            ) : null}

            {canFetch && !loading && !measurementsError ? (
              <div ref={printRef} className="space-y-5">
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                {subtitle ? (
                  <p className="meta text-muted-foreground text-xs">{subtitle}</p>
                ) : null}

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Order no.</th>
                        <th className="px-3 py-2 font-semibold">Customer</th>
                        <th className="px-3 py-2 font-semibold">Stylist</th>
                        <th className="px-3 py-2 font-semibold">Measured by</th>
                        <th className="px-3 py-2 font-semibold">Meters</th>
                        <th className="px-3 py-2 font-semibold">Approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-3 py-2">
                          {target?.orderNo != null
                            ? String(target.orderNo)
                            : "—"}
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
                          {measurement?.measuredBy || "—"}
                        </td>
                        <td className="px-3 py-2">
                          {measurement?.noOfMeters ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          {measurement?.approvedStatus || "—"}
                          {measurement?.approvedByStylist?.name
                            ? ` · ${measurement.approvedByStylist.name}`
                            : ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {(measurement?.note || measurement?.remarks) && (
                  <div className="space-y-1 text-xs">
                    {measurement.note ? (
                      <p>
                        <span className="font-semibold">Note: </span>
                        {measurement.note}
                      </p>
                    ) : null}
                    {measurement.remarks ? (
                      <p>
                        <span className="font-semibold">Remarks: </span>
                        {measurement.remarks}
                      </p>
                    ) : null}
                  </div>
                )}

                <MeasurementBodySummary
                  profile={bodyProfile}
                  onPhotoClick={openGallery}
                />

                {!measurement || !hasMeasurementOptions(measurement.options) ? (
                  <p className="text-muted-foreground text-sm">
                    No saved measurements found for this category.
                  </p>
                ) : (
                  <MeasurementCategoryTable
                    title={`${category.name} measurements`}
                    rows={category.rows}
                    options={measurement.options}
                  />
                )}
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
        ariaLabel="Measurement client pictures"
      />
    </>
  )
}

/** Open customer measurement edit page (placeholder route until form ships). */
export function openMeasurementEdit(userId: string, catId: string) {
  const params = new URLSearchParams({
    userId,
    catId,
    tabIndex: "2",
  })
  window.open(`/measurements?${params.toString()}`, "_blank", "noopener,noreferrer")
}
