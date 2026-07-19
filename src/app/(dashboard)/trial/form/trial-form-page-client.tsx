"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PencilIcon } from "lucide-react"

import { TrialAssetsForm } from "@/components/trial/trial-assets-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  TRIAL_DECISION_OPTIONS,
  TRIAL_MEASUREMENT_STATUS_OPTIONS,
  TRIAL_RATING_OPTIONS,
  TRIAL_STATUS_OPTIONS,
} from "@/config/trial-filters"
import { authClient } from "@/lib/auth-client"
import { isoToDateInput } from "@/lib/appointments/date-payload"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type StoreOrderDetail,
} from "@/lib/apollo/queries/store-orders"
import {
  CREATE_ORDER_TRIAL,
  GET_ORDER_TRIAL_BY_ID,
  UPDATE_ORDER_TRIAL,
  type CreateOrderTrialData,
  type CreateOrderTrialVars,
  type GetOrderTrialByIdData,
  type GetOrderTrialByIdVars,
  type OrderTrialProductInput,
  type OrderTrialRow,
  type UpdateOrderTrialData,
  type UpdateOrderTrialVars,
} from "@/lib/apollo/queries/trial"
import { customerFullName, formatStoreOrderDate } from "@/lib/track-orders/format"
import {
  buildCreateOrUpdateTrialPayload,
  productsFromStoreOrder,
  type TrialFormValues,
} from "@/lib/trial/build-trial-payload"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

const sectionClass =
  "bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-xs"

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="space-y-0.5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  )
}

function emptyForm(): TrialFormValues {
  return {
    trialStatus: "",
    trialRating: "",
    trialDecision: "",
    measurementStatus: "",
    trialBy: "",
    note: "",
    trialDate: "",
    deliveryDate: "",
  }
}

function TrialFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const orderIdParam = searchParams.get("orderId")
  const trailIdParam = searchParams.get("trailId")

  const [order, setOrder] = useState<StoreOrderDetail | null>(null)
  const [trial, setTrial] = useState<OrderTrialRow | null>(null)
  const [products, setProducts] = useState<OrderTrialProductInput[]>([])
  const [form, setForm] = useState<TrialFormValues>(emptyForm)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [assetIndex, setAssetIndex] = useState<number | null>(null)

  const [fetchOrder, { loading: loadingOrder }] = useLazyQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, { fetchPolicy: "network-only" })

  const [fetchTrial, { loading: loadingTrial }] = useLazyQuery<
    GetOrderTrialByIdData,
    GetOrderTrialByIdVars
  >(GET_ORDER_TRIAL_BY_ID, { fetchPolicy: "network-only" })

  const [createTrial, { loading: creating }] = useMutation<
    CreateOrderTrialData,
    CreateOrderTrialVars
  >(CREATE_ORDER_TRIAL)

  const [updateTrial, { loading: updating }] = useMutation<
    UpdateOrderTrialData,
    UpdateOrderTrialVars
  >(UPDATE_ORDER_TRIAL)

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    setOrder(null)
    setTrial(null)
    setProducts([])
    setForm(emptyForm())

    async function load() {
      try {
        if (trailIdParam) {
          const result = await fetchTrial({
            variables: { orderTrialId: trailIdParam },
          })
          if (cancelled) return
          const next = result.data?.getOrderTrialById ?? null
          if (!next) {
            setLoadError("Trail not found")
            return
          }
          setTrial(next)
          setProducts(
            (next.products ?? []).map((p) => ({
              catId: p.catId ?? null,
              name: p.name ?? null,
              itemNumber: p.itemNumber ?? null,
              fabricImageLink: p.fabricImageLink ?? null,
              trialNote: p.trialNote ?? null,
              trialVideoLink: p.trialVideoLink ?? null,
              trialImageLinks: p.trialImageLinks ?? null,
            }))
          )
          setForm({
            trialStatus: next.trialStatus || "",
            trialRating: next.trialRating || "",
            trialDecision: next.trialDecision || "",
            measurementStatus: next.measurementStatus || "",
            trialBy: next.trialBy || "",
            note: next.note || "",
            trialDate: isoToDateInput(next.trialDate?.timestamp),
            deliveryDate: isoToDateInput(next.deliveryDate?.timestamp),
          })
          return
        }

        if (orderIdParam) {
          const result = await fetchOrder({
            variables: { orderId: orderIdParam },
          })
          if (cancelled) return
          const next = result.data?.getStoreOrderById ?? null
          if (!next) {
            setLoadError("Order not found")
            return
          }
          setOrder(next)
          setProducts(productsFromStoreOrder(next))
          setForm({
            ...emptyForm(),
            trialDate: isoToDateInput(next.trialDate?.timestamp),
            deliveryDate: isoToDateInput(next.deliveryDate?.timestamp),
            trialBy: session?.user?.name || "",
          })
          return
        }

        setLoadError("Provide orderId or trailId in the URL")
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load form"
          )
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [
    trailIdParam,
    orderIdParam,
    fetchOrder,
    fetchTrial,
    session?.user?.name,
  ])

  const header = useMemo(() => {
    if (trial) {
      return {
        title: "Update order trail details",
        clientName: customerFullName(
          trial.user?.firstName || trial.storeProductOrder?.customerFirstName,
          trial.user?.lastName || trial.storeProductOrder?.customerLastName
        ),
        orderNo: trial.storeProductOrder?.orderNo ?? "—",
        orderDate: formatStoreOrderDate(trial.storeProductOrder?.orderDate),
      }
    }
    if (order) {
      return {
        title: "Create new trail details",
        clientName: customerFullName(
          order.customerFirstName,
          order.customerLastName
        ),
        orderNo: order.orderNo ?? "—",
        orderDate: formatStoreOrderDate(order.orderDate),
      }
    }
    return null
  }, [trial, order])

  const saving = creating || updating
  const loading = loadingOrder || loadingTrial

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError(null)

    const resolvedOrderId =
      order?._id || trial?.storeProductOrder?._id || trial?.orderId || ""
    const resolvedUserId =
      order?.userId ||
      trial?.storeProductOrder?.userId ||
      trial?.userId ||
      null
    const resolvedStylistId =
      order?.stylist?.[0]?._id ||
      trial?.storeProductOrder?.stylist?.[0]?._id ||
      trial?.stylistId ||
      session?.user?.id ||
      null

    if (!resolvedOrderId) {
      setSubmitError("Missing order id")
      return
    }

    const payload = buildCreateOrUpdateTrialPayload({
      orderId: resolvedOrderId,
      userId: resolvedUserId,
      stylistId: resolvedStylistId,
      values: form,
      products,
    })

    try {
      if (trial?._id && trailIdParam) {
        await updateTrial({
          variables: {
            orderTrialId: trailIdParam,
            orderTrial: payload,
          },
        })
      } else {
        await createTrial({
          variables: { orderTrial: payload },
        })
      }
      router.push("/trial")
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save trail"
      )
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              href="/trial"
              className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
            >
              <ArrowLeftIcon className="size-4" />
              Back to trial
            </Link>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {header?.title || "Trail form"}
              </h1>
              {header?.orderNo != null && header.orderNo !== "—" ? (
                <span className="text-muted-foreground text-sm">
                  Order {header.orderNo}
                </span>
              ) : null}
            </div>
            {header ? (
              <p className="text-muted-foreground text-sm">
                {header.clientName} · {header.orderDate}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Trail status, dates, notes, and product assets.
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.push("/trial")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="trial-core-form"
              disabled={saving || loading || !!loadError || !header}
            >
              {saving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Saving…
                </>
              ) : trial?._id ? (
                "Update"
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          Loading…
        </div>
      ) : null}

      {loadError ? (
        <p className="text-destructive text-sm">{loadError}</p>
      ) : null}

      {!loading && !loadError && header ? (
        <form
          id="trial-core-form"
          onSubmit={(e) => void handleSubmit(e)}
          className="flex w-full flex-col gap-4"
        >
          <section className={sectionClass}>
            <SectionTitle
              title="Trail details"
              description="Status, decision, rating, and schedule for this trail."
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-status">Trail status</Label>
                <select
                  id="tf-status"
                  className={selectClass}
                  value={form.trialStatus}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trialStatus: e.target.value }))
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-decision">Trail decision</Label>
                <select
                  id="tf-decision"
                  className={selectClass}
                  value={form.trialDecision}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trialDecision: e.target.value }))
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-rating">Trail rating</Label>
                <select
                  id="tf-rating"
                  className={selectClass}
                  value={form.trialRating}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trialRating: e.target.value }))
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-measurement">Measurements</Label>
                <select
                  id="tf-measurement"
                  className={selectClass}
                  value={form.measurementStatus}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      measurementStatus: e.target.value,
                    }))
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-trial-date">Trail date</Label>
                <Input
                  id="tf-trial-date"
                  type="date"
                  value={form.trialDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trialDate: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-delivery-date">Delivery date</Label>
                <Input
                  id="tf-delivery-date"
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deliveryDate: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tf-trial-by">Trail by</Label>
                <Input
                  id="tf-trial-by"
                  value={form.trialBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trialBy: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-4">
                <Label htmlFor="tf-note">Summary note</Label>
                <Textarea
                  id="tf-note"
                  rows={3}
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle
              title="Trail products"
              description="Review items and edit fabric, trail images, video, and notes."
            />
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-3 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium">Item #</th>
                    <th className="px-3 py-2.5 font-medium">Fabric</th>
                    <th className="px-3 py-2.5 font-medium">Trail images</th>
                    <th className="px-3 py-2.5 font-medium">Note</th>
                    <th className="px-3 py-2.5 font-medium">Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, index) => {
                    const fabric = item.fabricImageLink?.trim()
                    const trialImages = (item.trialImageLinks ?? []).filter(
                      Boolean
                    )
                    return (
                      <tr
                        key={`${item.itemNumber}-${index}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-3 py-2.5 font-medium">
                          {item.name || "—"}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">
                          {item.itemNumber ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          {fabric ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fabric}
                              alt=""
                              className="border-border size-10 rounded-md border object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="border-muted-foreground/40 bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-md border border-dashed text-[7px] font-medium tracking-wide uppercase">
                              No image
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {trialImages.length > 0 ? (
                            <span className="inline-flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={trialImages[0]}
                                alt=""
                                className="border-border size-10 rounded-md border object-cover"
                                loading="lazy"
                              />
                              {trialImages.length > 1 ? (
                                <span className="text-muted-foreground">
                                  +{trialImages.length - 1}
                                </span>
                              ) : null}
                              {item.trialVideoLink ? (
                                <span className="text-muted-foreground">
                                  · video
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span className="border-muted-foreground/40 bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-md border border-dashed text-[7px] font-medium tracking-wide uppercase">
                              No image
                            </span>
                          )}
                        </td>
                        <td className="max-w-[240px] px-3 py-2.5 text-xs">
                          <span className="line-clamp-2">
                            {item.trialNote || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1"
                            onClick={() => setAssetIndex(index)}
                          >
                            <PencilIcon className="size-3.5" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {products.length === 0 ? (
                <p className="text-muted-foreground p-4 text-sm">
                  No products on this order.
                </p>
              ) : null}
            </div>
          </section>

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 lg:hidden">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.push("/trial")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : trial?._id ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      ) : null}

      <TrialAssetsForm
        open={assetIndex != null}
        product={assetIndex != null ? products[assetIndex] : null}
        onClose={() => setAssetIndex(null)}
        onSave={(next) => {
          if (assetIndex == null) return
          setProducts((prev) =>
            prev.map((p, i) => (i === assetIndex ? next : p))
          )
        }}
      />
    </div>
  )
}

export function TrialFormPageClient() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground p-4 text-sm">Loading form…</div>
      }
    >
      <TrialFormInner />
    </Suspense>
  )
}
