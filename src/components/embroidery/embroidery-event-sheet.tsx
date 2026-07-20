"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { CheckIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { EMB_ORDER_STATUS_OPTIONS } from "@/config/embroidery-status"
import { extractDateFormat } from "@/lib/appointments/date-payload"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"
import {
  GET_EMBROIDERY_BY_ID,
  SAVE_EMBROIDERY,
  type EmbroideryDetail,
  type GetEmbroideryByIdData,
  type GetEmbroideryByIdVars,
  type SaveEmbroideryData,
  type SaveEmbroideryVars,
} from "@/lib/apollo/queries/embroidery"
import { firstImageUrl, firstName, formatEmbroideryDate } from "@/lib/embroidery/format"
import { notify } from "@/lib/notify"

type EmbroideryEventSheetProps = {
  embroideryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function EmbroideryEventSheet({
  embroideryId,
  open,
  onOpenChange,
  onSaved,
}: EmbroideryEventSheetProps) {
  const router = useRouter()
  const [embTrialDate, setEmbTrialDate] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [fetchDetail, { data, loading, error }] = useLazyQuery<
    GetEmbroideryByIdData,
    GetEmbroideryByIdVars
  >(GET_EMBROIDERY_BY_ID, { fetchPolicy: "network-only" })

  const [saveEmbroidery, { loading: saving }] = useMutation<
    SaveEmbroideryData,
    SaveEmbroideryVars
  >(SAVE_EMBROIDERY)

  const row: EmbroideryDetail | undefined = data?.getEmbroideryById

  useEffect(() => {
    if (!open || !embroideryId) {
      if (!open) {
        setEmbTrialDate("")
        setSubmitError(null)
      }
      return
    }
    void fetchDetail({ variables: { id: embroideryId } })
  }, [open, embroideryId, fetchDetail])

  useEffect(() => {
    if (!row) return
    const trialTs =
      row.embTrialDate?.timestamp || row.trialDate?.timestamp || null
    setEmbTrialDate(isoToDateInput(trialTs))
    setSubmitError(null)
  }, [row])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!embroideryId) return
    setSubmitError(null)

    const iso = dateInputToIso(embTrialDate)
    if (!iso) {
      setSubmitError("Emb trial date is required.")
      return
    }

    try {
      await saveEmbroidery({
        variables: {
          id: embroideryId,
          body: {
            embTrialDate: extractDateFormat(iso),
          },
        },
      })
      notify.success("Emb trial date updated")
      onSaved?.()
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update emb trial date"
      setSubmitError(message)
      notify.fromError(err, "Failed to update emb trial date")
    }
  }

  const openOpsForm = () => {
    if (!embroideryId) return
    onOpenChange(false)
    router.push(`/embroidery/form?id=${encodeURIComponent(embroideryId)}`)
  }

  const orderStatusLabel =
    EMB_ORDER_STATUS_OPTIONS.find((o) => o.value === row?.orderStatus)?.label ??
    row?.orderStatus ??
    "—"

  const productImage = row
    ? firstImageUrl(
        row.fabricImage,
        row.orderItemAttributes?.fabricImage,
        row.referenceImage,
        row.orderItemAttributes?.referenceImage,
        row.designReferencesImageUrls
      )
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Update event</SheetTitle>
          <SheetDescription>
            Update embroidery trial date for this calendar item.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {loading && !row ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading…
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              Failed to load embroidery details.
            </p>
          ) : null}

          {row ? (
            <form
              id="emb-event-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {row.customerName || "—"}
                  {row.storeOrderNo ? ` – ${row.storeOrderNo}` : ""}
                </p>
                {row.embroideryReqNo ? (
                  <p className="text-muted-foreground text-xs">
                    Emb #{row.embroideryReqNo}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emb-event-stylist">Stylist</Label>
                <Input
                  id="emb-event-stylist"
                  value={firstName(row.stylist)}
                  readOnly
                  disabled
                  className="h-9"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emb-event-trial">Trial date</Label>
                <Input
                  id="emb-event-trial"
                  type="date"
                  value={isoToDateInput(row.trialDate?.timestamp ?? null)}
                  disabled
                  className="h-9"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emb-event-emb-trial">Emb trial date</Label>
                <Input
                  id="emb-event-emb-trial"
                  type="date"
                  value={embTrialDate}
                  onChange={(e) => setEmbTrialDate(e.target.value)}
                  className="h-9"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emb-event-order-date">Order date</Label>
                <Input
                  id="emb-event-order-date"
                  value={formatEmbroideryDate(row.orderDate)}
                  readOnly
                  disabled
                  className="h-9"
                />
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Emb</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          {productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={productImage}
                              alt={row.storeOrderProductName || "Product"}
                              className="bg-muted size-12 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div
                              className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-md text-[10px]"
                              aria-hidden
                            >
                              No img
                            </div>
                          )}
                          <span className="min-w-0 break-words">
                            <span className="block">
                              {row.storeOrderProductName || "—"}
                            </span>
                            {row.storeOrderProductNumber ? (
                              <span className="text-muted-foreground block text-xs">
                                {row.storeOrderProductNumber}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <CheckIcon
                          className="size-4 text-emerald-700 dark:text-emerald-400"
                          aria-label="Has embroidery"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emb-event-order-status">Order status</Label>
                <Input
                  id="emb-event-order-status"
                  value={orderStatusLabel}
                  readOnly
                  disabled
                  className="h-9"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emb-event-remark">Remark</Label>
                <Textarea
                  id="emb-event-remark"
                  value={row.markingRemarks || row.embRemark || ""}
                  readOnly
                  disabled
                  rows={3}
                />
              </div>

              {submitError ? (
                <p className="text-destructive text-sm" role="alert">
                  {submitError}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>

        <SheetFooter className="flex-row flex-wrap justify-between gap-2 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!embroideryId}
            onClick={openOpsForm}
          >
            Open update form
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="emb-event-form"
              disabled={saving || loading || !row}
            >
              {saving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
