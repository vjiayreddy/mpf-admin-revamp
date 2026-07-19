"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { TrialProductsTable } from "@/components/trial/trial-products-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  TRIAL_DECISION_OPTIONS,
  TRIAL_MEASUREMENT_STATUS_OPTIONS,
  TRIAL_RATING_OPTIONS,
  TRIAL_STATUS_OPTIONS,
} from "@/config/trial-filters"
import type { TrialStoreOrderRow } from "@/lib/apollo/queries/store-orders"
import {
  GET_ORDER_TRIAL_BY_ID,
  UPDATE_ORDER_TRIAL,
  type GetOrderTrialByIdData,
  type GetOrderTrialByIdVars,
  type NestedOrderTrial,
  type OrderTrialRow,
  type UpdateOrderTrialData,
  type UpdateOrderTrialVars,
} from "@/lib/apollo/queries/trial"
import { customerFullName, formatStoreOrderDate } from "@/lib/track-orders/format"
import { buildQuickUpdatePayload } from "@/lib/trial/build-trial-payload"
import { openTrialWhatsAppShare } from "@/lib/trial/whatsapp-share"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

export type QuickTrialViewTarget =
  | { kind: "order"; order: TrialStoreOrderRow }
  | { kind: "trial"; trial: OrderTrialRow }
  | { kind: "trialId"; trialId: string }

type FormState = {
  trialStatus: string
  trialRating: string
  trialDecision: string
  measurementStatus: string
  note: string
}

export type QuickTrialViewProps = {
  open: boolean
  target: QuickTrialViewTarget | null
  onOpenChange: (open: boolean) => void
  /** Show full-form "Edit trail info" button. Default `true`. */
  showEditButton?: boolean
  /** Show quick-update fields + Update. Default `true`. */
  showUpdate?: boolean
  /** Show WhatsApp share. Default `true`. */
  showWhatsApp?: boolean
  /** Override edit navigation (defaults to `/trial/form?trailId=`). */
  onEdit?: (trialId: string) => void
  onUpdated?: (args: {
    trialId: string
    orderId?: string | null
    patch: Partial<NestedOrderTrial>
  }) => void
}

function formFromTrial(trial: NestedOrderTrial | OrderTrialRow): FormState {
  return {
    trialStatus: trial.trialStatus || "",
    trialRating: trial.trialRating || "",
    trialDecision: trial.trialDecision || "",
    measurementStatus: trial.measurementStatus || "",
    note: trial.note || "",
  }
}

function resolveTrialFromTarget(
  target: QuickTrialViewTarget | null,
  fetched: OrderTrialRow | null
): NestedOrderTrial | OrderTrialRow | null {
  if (!target) return null
  if (target.kind === "order") return target.order.orderTrial ?? null
  if (target.kind === "trial") return target.trial
  return fetched
}

/**
 * Reusable trail/trial quick view dialog.
 * Open from Trial module, Track Orders, or anywhere with order / trial / trialId.
 */
export function QuickTrialView({
  open,
  target,
  onOpenChange,
  showEditButton = true,
  showUpdate = true,
  showWhatsApp = true,
  onEdit,
  onUpdated,
}: QuickTrialViewProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormState | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fetchedTrial, setFetchedTrial] = useState<OrderTrialRow | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [fetchTrial, { loading: loadingTrial }] = useLazyQuery<
    GetOrderTrialByIdData,
    GetOrderTrialByIdVars
  >(GET_ORDER_TRIAL_BY_ID, { fetchPolicy: "no-cache" })
  const fetchTrialRef = useRef(fetchTrial)
  fetchTrialRef.current = fetchTrial

  const [updateTrial, { loading: updating }] = useMutation<
    UpdateOrderTrialData,
    UpdateOrderTrialVars
  >(UPDATE_ORDER_TRIAL)

  const trialIdToFetch =
    open && target?.kind === "trialId" ? target.trialId : null
  const seededForTrialIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open) {
      setForm(null)
      setSubmitError(null)
      setFetchedTrial(null)
      setLoadError(null)
      seededForTrialIdRef.current = null
      return
    }

    if (!trialIdToFetch) return

    let cancelled = false
    setLoadError(null)
    setFetchedTrial(null)
    seededForTrialIdRef.current = null
    void fetchTrialRef.current({ variables: { orderTrialId: trialIdToFetch } })
      .then((result) => {
        if (cancelled) return
        const next = result.data?.getOrderTrialById ?? null
        if (!next) {
          setLoadError("Trail details not found")
          return
        }
        setFetchedTrial(next)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load trail"
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, trialIdToFetch])

  const trial = useMemo(
    () => resolveTrialFromTarget(target, fetchedTrial),
    [target, fetchedTrial]
  )

  useEffect(() => {
    if (!open || !trial?._id) return
    // Seed once per open/trial — never overwrite while the user is editing.
    if (seededForTrialIdRef.current === trial._id) return
    seededForTrialIdRef.current = trial._id
    setForm(formFromTrial(trial))
    setSubmitError(null)
  }, [open, trial])

  const header = useMemo(() => {
    if (!target || !trial) return null

    if (target.kind === "order") {
      return {
        clientName: customerFullName(
          target.order.customerFirstName,
          target.order.customerLastName
        ),
        stylist: target.order.stylist?.[0]?.name || "—",
        orderNo: target.order.orderNo ?? "—",
        orderDate: formatStoreOrderDate(target.order.orderDate),
        orderTrialDate: formatStoreOrderDate(target.order.trialDate),
        actualTrialDate: formatStoreOrderDate(trial.trialDate),
        deliveryDate: formatStoreOrderDate(trial.deliveryDate),
        trialBy: trial.trialBy || "—",
        status: trial.trialStatus || "—",
        decision: trial.trialDecision || "—",
        rating: trial.trialRating || "—",
        measurement: trial.measurementStatus || "—",
        note: trial.note || "—",
      }
    }

    const row =
      target.kind === "trial"
        ? target.trial
        : (fetchedTrial as OrderTrialRow | null)

    if (!row) return null

    return {
      clientName: customerFullName(
        row.storeProductOrder?.customerFirstName,
        row.storeProductOrder?.customerLastName
      ),
      stylist:
        row.stylist?.name || row.storeProductOrder?.stylist?.[0]?.name || "—",
      orderNo: row.storeProductOrder?.orderNo ?? "—",
      orderDate: formatStoreOrderDate(row.storeProductOrder?.orderDate),
      orderTrialDate: formatStoreOrderDate(row.storeProductOrder?.trialDate),
      actualTrialDate: formatStoreOrderDate(row.trialDate),
      deliveryDate: formatStoreOrderDate(row.deliveryDate),
      trialBy: row.trialBy || "—",
      status: row.trialStatus || "—",
      decision: row.trialDecision || "—",
      rating: row.trialRating || "—",
      measurement: row.measurementStatus || "—",
      note: row.note || "—",
    }
  }, [target, trial, fetchedTrial])

  const handleUpdate = async () => {
    if (!target || !trial?._id || !form) return
    setSubmitError(null)

    // Snapshot before await — a late refetch must not change what we save/patch.
    const trialIdSnapshot = trial._id
    const fieldsSnapshot: FormState = { ...form }
    const trialSnapshot = trial

    let orderId = ""
    let userId: string | null | undefined
    let stylistId: string | null | undefined
    let fallbackTrialDate = null as TrialStoreOrderRow["trialDate"]

    if (target.kind === "order") {
      orderId = target.order._id
      userId = target.order.userId
      stylistId = target.order.stylist?.[0]?._id
      fallbackTrialDate = target.order.trialDate
    } else {
      const row =
        target.kind === "trial" ? target.trial : fetchedTrial
      orderId = row?.storeProductOrder?._id || row?.orderId || ""
      userId = row?.storeProductOrder?.userId || row?.userId
      stylistId =
        row?.stylistId || row?.storeProductOrder?.stylist?.[0]?._id
    }

    if (!orderId) {
      setSubmitError("Missing order id for this trial.")
      return
    }

    try {
      await updateTrial({
        variables: {
          orderTrialId: trialIdSnapshot,
          orderTrial: buildQuickUpdatePayload({
            orderId,
            userId,
            stylistId,
            trial: trialSnapshot,
            fields: fieldsSnapshot,
            fallbackTrialDate,
            fallbackDeliveryDate: null,
          }),
        },
      })
      onUpdated?.({
        trialId: trialIdSnapshot,
        orderId,
        patch: { ...fieldsSnapshot },
      })
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update trial"
      )
    }
  }

  const handleEdit = () => {
    if (!trial?._id) return
    onOpenChange(false)
    if (onEdit) {
      onEdit(trial._id)
      return
    }
    router.push(`/trial/form?trailId=${trial._id}`)
  }

  const loading = Boolean(trialIdToFetch) && loadingTrial && !fetchedTrial
  const showActions = showUpdate || showEditButton || showWhatsApp

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Trail details</DialogTitle>
          <DialogDescription>
            {header
              ? `Order ${header.orderNo} · ${header.clientName}`
              : "View trail information"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading trail…
            </div>
          ) : null}

          {loadError ? (
            <p className="text-destructive text-sm">{loadError}</p>
          ) : null}

          {!loading && !loadError && (!trial || !header) ? (
            <p className="text-muted-foreground text-sm">
              No trail data available.
            </p>
          ) : null}

          {!loading && trial && header && form ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-medium">Client:</span> {header.clientName}
                </p>
                <p>
                  <span className="font-medium">Stylist:</span> {header.stylist}
                </p>
                <p>
                  <span className="font-medium">Order No:</span> {header.orderNo}
                </p>
                <p>
                  <span className="font-medium">Order date:</span>{" "}
                  {header.orderDate}
                </p>
                <p>
                  <span className="font-medium">Order trail date:</span>{" "}
                  {header.orderTrialDate}
                </p>
                <p>
                  <span className="font-medium">Actual trail date:</span>{" "}
                  {header.actualTrialDate}
                </p>
                <p>
                  <span className="font-medium">Delivery:</span>{" "}
                  {header.deliveryDate}
                </p>
                <p>
                  <span className="font-medium">Trail by:</span> {header.trialBy}
                </p>
                {!showUpdate ? (
                  <>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {header.status}
                    </p>
                    <p>
                      <span className="font-medium">Decision:</span>{" "}
                      {header.decision}
                    </p>
                    <p>
                      <span className="font-medium">Rating:</span>{" "}
                      {header.rating}
                    </p>
                    <p>
                      <span className="font-medium">Measurement:</span>{" "}
                      {header.measurement}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-medium">Note:</span> {header.note}
                    </p>
                  </>
                ) : null}
              </div>

              <TrialProductsTable
                data={trial}
                measurementStatus={trial.measurementStatus}
              />

              {showUpdate ? (
                <fieldset className="space-y-3 rounded-lg border p-3">
                  <legend className="px-1 text-sm font-semibold">
                    Update info
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="qtv-status">Trail status</Label>
                      <select
                        id="qtv-status"
                        className={selectClass}
                        value={form.trialStatus}
                        onChange={(e) =>
                          setForm((f) =>
                            f ? { ...f, trialStatus: e.target.value } : f
                          )
                        }
                      >
                        <option value="">Select</option>
                        {TRIAL_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qtv-rating">Trail rating</Label>
                      <select
                        id="qtv-rating"
                        className={selectClass}
                        value={form.trialRating}
                        onChange={(e) =>
                          setForm((f) =>
                            f ? { ...f, trialRating: e.target.value } : f
                          )
                        }
                      >
                        <option value="">Select</option>
                        {TRIAL_RATING_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qtv-decision">Trail decision</Label>
                      <select
                        id="qtv-decision"
                        className={selectClass}
                        value={form.trialDecision}
                        onChange={(e) =>
                          setForm((f) =>
                            f ? { ...f, trialDecision: e.target.value } : f
                          )
                        }
                      >
                        <option value="">Select</option>
                        {TRIAL_DECISION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qtv-measurement">Measurements</Label>
                      <select
                        id="qtv-measurement"
                        className={selectClass}
                        value={form.measurementStatus}
                        onChange={(e) =>
                          setForm((f) =>
                            f
                              ? { ...f, measurementStatus: e.target.value }
                              : f
                          )
                        }
                      >
                        <option value="">Select</option>
                        {TRIAL_MEASUREMENT_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="qtv-note">Summary note</Label>
                      <Textarea
                        id="qtv-note"
                        rows={3}
                        value={form.note}
                        onChange={(e) =>
                          setForm((f) =>
                            f ? { ...f, note: e.target.value } : f
                          )
                        }
                      />
                    </div>
                  </div>
                  {submitError ? (
                    <p className="text-destructive text-sm">{submitError}</p>
                  ) : null}
                </fieldset>
              ) : null}
            </div>
          ) : null}
        </div>

        {showActions ? (
          <DialogFooter className="justify-end gap-2">
            {showWhatsApp ? (
              <Button
                type="button"
                variant="secondary"
                disabled={!trial?._id}
                onClick={() => trial?._id && openTrialWhatsAppShare(trial._id)}
              >
                WhatsApp
              </Button>
            ) : null}
            {showEditButton ? (
              <Button
                type="button"
                variant="outline"
                disabled={!trial?._id}
                onClick={handleEdit}
              >
                Edit trail info
              </Button>
            ) : null}
            {showUpdate ? (
              <Button
                type="button"
                disabled={!trial || updating}
                onClick={() => void handleUpdate()}
              >
                {updating ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            ) : null}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

/** @deprecated Prefer `QuickTrialView` — kept as alias for existing imports. */
export const QuickTrialSheet = QuickTrialView
export type QuickTrialSheetTarget = QuickTrialViewTarget
export type QuickTrialSheetProps = QuickTrialViewProps
