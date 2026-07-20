"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  EMB_STATUS_OPTIONS,
  MARKING_STATUS_OPTIONS,
  PAPER_STATUS_OPTIONS,
  SAMPLE_STATUS_OPTIONS,
} from "@/config/embroidery-status"
import { useWorkshopsByType } from "@/hooks/use-workshops-by-type"
import { extractDateFormat, isoToDateInput } from "@/lib/appointments/date-payload"
import {
  SAVE_EMBROIDERY,
  type EmbroideryListRow,
  type EmbroideryTimestamp,
  type SaveEmbroideryData,
  type SaveEmbroideryVars,
} from "@/lib/apollo/queries/embroidery"
import {
  UPDATE_STORE_ORDER_ITEM_ATTRIBUTES,
  type UpdateStoreOrderItemAttributesData,
  type UpdateStoreOrderItemAttributesVars,
} from "@/lib/apollo/queries/store-orders"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type FormValues = {
  trialDate: string
  markingExpectedDate: string
  embReadyDate: string
  stitchingWorkshopId: string
  embStatus: string
  markingStatus: string
  sampleStatus: string
  paperStatus: string
  embRemark: string
}

export type EmbroideryUpdateDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: EmbroideryListRow | null
  onUpdated?: (id: string, patch: Partial<EmbroideryListRow>) => void
}

function toTimestamp(dateInput: string): EmbroideryTimestamp {
  if (!dateInput.trim()) return null
  return extractDateFormat(new Date(`${dateInput}T00:00:00`).toISOString())
}

function emptyToNull(value: string) {
  return value.trim() ? value : null
}

export function EmbroideryUpdateDetailsDialog({
  open,
  onOpenChange,
  row,
  onUpdated,
}: EmbroideryUpdateDetailsDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { workshops, loading: workshopsLoading } = useWorkshopsByType(
    "STITCHING",
    open
  )

  const [saveEmbroidery, { loading: savingEmb }] = useMutation<
    SaveEmbroideryData,
    SaveEmbroideryVars
  >(SAVE_EMBROIDERY)

  const [updateItemAttrs, { loading: savingAttrs }] = useMutation<
    UpdateStoreOrderItemAttributesData,
    UpdateStoreOrderItemAttributesVars
  >(UPDATE_STORE_ORDER_ITEM_ATTRIBUTES)

  const saving = savingEmb || savingAttrs

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      trialDate: "",
      markingExpectedDate: "",
      embReadyDate: "",
      stitchingWorkshopId: "",
      embStatus: "",
      markingStatus: "PENDING",
      sampleStatus: "",
      paperStatus: "",
      embRemark: "",
    },
  })

  useEffect(() => {
    if (!open || !row) return
    setSubmitError(null)
    reset({
      trialDate: isoToDateInput(
        row.orderItemAttributes?.trialDate?.timestamp ?? null
      ),
      markingExpectedDate: isoToDateInput(
        row.markingExpectedDate?.timestamp ?? null
      ),
      embReadyDate: isoToDateInput(row.embReadyDate?.timestamp ?? null),
      stitchingWorkshopId: row.orderItemAttributes?.stitchingWorkshopId ?? "",
      embStatus: row.embStatus ?? "",
      markingStatus: row.markingStatus || "PENDING",
      sampleStatus: row.sampleStatus ?? "",
      paperStatus: row.paperStatus ?? "",
      embRemark: row.embRemark ?? "",
    })
  }, [open, row, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!row?._id) return
    setSubmitError(null)

    const embReadyDate = toTimestamp(values.embReadyDate)
    const markingExpectedDate = toTimestamp(values.markingExpectedDate)
    const trialDate = toTimestamp(values.trialDate)

    const selectedWorkshop = workshops.find(
      (w) => w._id === values.stitchingWorkshopId
    )
    const stitchingWorkshopId = selectedWorkshop?._id ?? null
    const stitchingWorkshopName =
      selectedWorkshop?.name ??
      selectedWorkshop?.label ??
      null

    const embroideryBody = {
      embReadyDate,
      markingExpectedDate,
      embStatus: emptyToNull(values.embStatus),
      markingStatus: emptyToNull(values.markingStatus),
      sampleStatus: emptyToNull(values.sampleStatus),
      paperStatus: emptyToNull(values.paperStatus),
      embRemark: emptyToNull(values.embRemark),
    }

    const attributeVariables: UpdateStoreOrderItemAttributesVars["attributes"] =
      {}

    if (values.trialDate.trim()) {
      attributeVariables.trialDate = trialDate
    }
    if (stitchingWorkshopId) {
      attributeVariables.stitchingWorkshopId = stitchingWorkshopId
      attributeVariables.stitchingWorkshopName = stitchingWorkshopName
    }

    const hasAttributeUpdate = Object.keys(attributeVariables).length > 0

    try {
      const promises: Promise<unknown>[] = [
        saveEmbroidery({
          variables: {
            id: row._id,
            body: embroideryBody,
          },
        }),
      ]

      if (hasAttributeUpdate && row.storeOrderId && row.storeOrderProductId) {
        promises.push(
          updateItemAttrs({
            variables: {
              orderId: row.storeOrderId,
              orderItemId: row.storeOrderProductId,
              attributes: attributeVariables,
            },
          })
        )
      }

      await Promise.all(promises)

      const patch: Partial<EmbroideryListRow> = {
        embReadyDate,
        markingExpectedDate,
        embStatus: embroideryBody.embStatus,
        markingStatus: embroideryBody.markingStatus,
        sampleStatus: embroideryBody.sampleStatus,
        paperStatus: embroideryBody.paperStatus,
        embRemark: embroideryBody.embRemark,
      }

      if (hasAttributeUpdate) {
        patch.orderItemAttributes = {
          ...(row.orderItemAttributes ?? {}),
          ...(values.trialDate.trim() ? { trialDate } : {}),
          ...(stitchingWorkshopId
            ? {
                stitchingWorkshopId,
                stitchingWorkshopName,
              }
            : {}),
        }
      }

      onUpdated?.(row._id, patch)
      onOpenChange(false)
      notify.success("Embroidery details updated")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update embroidery details"
      setSubmitError(msg)
      notify.fromError(err, "Failed to update embroidery details")
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Update embroidery details</DialogTitle>
          <DialogDescription className="mt-1">
            {row?.storeOrderProductNumber
              ? `Product ${row.storeOrderProductNumber}`
              : "Product —"}
            {row?.customerName ? ` · ${row.customerName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <div className="flex max-h-[min(70vh,36rem)] flex-col gap-6 overflow-y-auto px-6 py-5">
            <section className="flex flex-col gap-4">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Dates
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emb-trial-date">Trial date</Label>
                  <Input
                    id="emb-trial-date"
                    type="date"
                    disabled={saving}
                    {...register("trialDate")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emb-marking-date">Marking expected date</Label>
                  <Input
                    id="emb-marking-date"
                    type="date"
                    disabled={saving}
                    {...register("markingExpectedDate")}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="emb-ready-date">Emb completion date</Label>
                  <Input
                    id="emb-ready-date"
                    type="date"
                    disabled={saving}
                    {...register("embReadyDate")}
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Workshop
              </h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="emb-stitching-workshop">
                  Stitching workshop
                </Label>
                <select
                  id="emb-stitching-workshop"
                  className={selectClass}
                  disabled={saving || workshopsLoading}
                  {...register("stitchingWorkshopId")}
                >
                  <option value="">
                    {workshopsLoading ? "Loading workshops…" : "Select workshop…"}
                  </option>
                  {row?.orderItemAttributes?.stitchingWorkshopId &&
                  !workshops.some(
                    (w) => w._id === row.orderItemAttributes?.stitchingWorkshopId
                  ) ? (
                    <option value={row.orderItemAttributes.stitchingWorkshopId}>
                      {row.orderItemAttributes.stitchingWorkshopName ||
                        row.orderItemAttributes.stitchingWorkshopId}
                    </option>
                  ) : null}
                  {workshops.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name || w.label || w._id}
                    </option>
                  ))}
                </select>
                {!workshopsLoading && workshops.length === 0 ? (
                  <p className="text-muted-foreground text-xs">
                    No stitching workshops found.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Status
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emb-status">Emb status</Label>
                  <select
                    id="emb-status"
                    className={selectClass}
                    disabled={saving}
                    {...register("embStatus")}
                  >
                    <option value="">Select…</option>
                    {EMB_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emb-marking-status">Marking status</Label>
                  <select
                    id="emb-marking-status"
                    className={selectClass}
                    disabled={saving}
                    {...register("markingStatus")}
                  >
                    <option value="">Select…</option>
                    {MARKING_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emb-sample-status">Sample status</Label>
                  <select
                    id="emb-sample-status"
                    className={selectClass}
                    disabled={saving}
                    {...register("sampleStatus")}
                  >
                    <option value="">Select…</option>
                    {SAMPLE_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="emb-paper-status">Paper status</Label>
                  <select
                    id="emb-paper-status"
                    className={selectClass}
                    disabled={saving}
                    {...register("paperStatus")}
                  >
                    <option value="">Select…</option>
                    {PAPER_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Notes
              </h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="emb-remark">Emb remark</Label>
                <Textarea
                  id="emb-remark"
                  rows={4}
                  placeholder="Enter embroidery remark"
                  disabled={saving}
                  className="min-h-24 resize-y"
                  {...register("embRemark")}
                />
              </div>
            </section>

            {submitError ? (
              <p className="text-destructive text-sm" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>

          <DialogFooter className="justify-end px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !row?._id}>
              {saving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              {saving ? "Updating…" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
