"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftIcon,
  ImageIcon,
  Loader2Icon,
  RulerIcon,
  XIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, FormProvider, useForm } from "react-hook-form"

import { QcActualMeasurementsDialog } from "@/components/quality-check/qc-actual-measurements-dialog"
import { QcChecklistGrid } from "@/components/quality-check/qc-checklist-grid"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import {
  QC_IMAGE_UPLOAD_PATH,
  QUALITY_CHECK_STATUS_OPTIONS,
} from "@/config/quality-check-filters"
import {
  CREATE_ORDER_QUALITY_CHECK,
  GET_ORDER_QUALITY_CHECK_BY_ID,
  UPDATE_ORDER_QUALITY_CHECK,
  type CreateOrderQualityCheckData,
  type CreateOrderQualityCheckVars,
  type GetOrderQualityCheckByIdData,
  type GetOrderQualityCheckByIdVars,
  type UpdateOrderQualityCheckData,
  type UpdateOrderQualityCheckVars,
} from "@/lib/apollo/queries/quality-check"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import { notify } from "@/lib/notify"
import {
  buildQualityCheckPayload,
  emptyQualityCheckFormValues,
  qualityCheckFormSchema,
  resetQualityCheckFormValues,
  type QualityCheckFormValues,
} from "@/lib/quality-check/form"
import { qualityCheckStatusChipClass } from "@/lib/quality-check/status-chip"
import { resolveProductCatId } from "@/lib/track-orders/product-cat-id"
import { uploadUrlsFromResult } from "@/lib/uppy/config"
import { cn } from "@/lib/utils"

function FormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qcItemId = searchParams.get("qcItemId")?.trim() || ""
  const orderIdParam = searchParams.get("orderId")?.trim() || ""
  const orderItemId = searchParams.get("orderItemId")?.trim() || ""

  const [uploadOpen, setUploadOpen] = useState(false)
  const [measurementsOpen, setMeasurementsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  const [fetchQc, { data: qcData, loading: qcLoading, error: qcError }] =
    useLazyQuery<GetOrderQualityCheckByIdData, GetOrderQualityCheckByIdVars>(
      GET_ORDER_QUALITY_CHECK_BY_ID,
      { fetchPolicy: "network-only" }
    )

  const [
    fetchOrder,
    { data: orderData, loading: orderLoading, error: orderError },
  ] = useLazyQuery<GetStoreOrderByIdData, GetStoreOrderByIdVars>(
    GET_STORE_ORDER_BY_ID,
    { fetchPolicy: "network-only" }
  )

  const [createQc, { loading: creating }] = useMutation<
    CreateOrderQualityCheckData,
    CreateOrderQualityCheckVars
  >(CREATE_ORDER_QUALITY_CHECK)

  const [updateQc, { loading: updating }] = useMutation<
    UpdateOrderQualityCheckData,
    UpdateOrderQualityCheckVars
  >(UPDATE_ORDER_QUALITY_CHECK)

  const methods = useForm<QualityCheckFormValues>({
    resolver: zodResolver(qualityCheckFormSchema),
    defaultValues: emptyQualityCheckFormValues(),
  })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = methods

  const qc = qcData?.getOrderQualityCheckById ?? null
  const order = orderData?.getStoreOrderById ?? null

  useEffect(() => {
    if (qcItemId) {
      void fetchQc({ variables: { orderQualityCheckId: qcItemId } })
    }
  }, [qcItemId, fetchQc])

  useEffect(() => {
    const id = orderIdParam || qc?.orderId?.trim() || ""
    if (!id) return
    void fetchOrder({ variables: { orderId: id } })
  }, [orderIdParam, qc?.orderId, fetchOrder])

  useEffect(() => {
    if (qc) {
      reset(resetQualityCheckFormValues(qc))
    }
  }, [qc, reset])

  const orderItem: StoreOrderItem | null = useMemo(() => {
    const items = (order?.orderItems ?? []).filter(Boolean) as StoreOrderItem[]
    if (orderItemId) {
      return items.find((i) => i._id === orderItemId) ?? null
    }
    if (qc?.itemNumber != null) {
      return (
        items.find(
          (i) => String(i.itemNumber ?? "") === String(qc.itemNumber)
        ) ?? null
      )
    }
    return null
  }, [order?.orderItems, orderItemId, qc?.itemNumber])

  const resolvedOrderId =
    order?._id || orderIdParam || qc?.orderId?.trim() || ""
  const userId = order?.userId?.trim() || qc?.userId?.trim() || ""
  const stylistId =
    order?.personalStylistId?.trim() ||
    order?.stylist?.[0]?._id?.trim() ||
    qc?.stylistId?.trim() ||
    ""
  const itemName = orderItem?.itemName?.trim() || qc?.name?.trim() || ""
  const itemNumber = orderItem?.itemNumber ?? qc?.itemNumber ?? null
  const catId =
    qc?.catId?.trim() ||
    resolveProductCatId(itemName, orderItem?.itemCatId) ||
    ""
  const orderNo = order?.orderNo ?? qc?.storeProductOrder?.orderNo
  const customerName = [
    order?.customerFirstName || qc?.storeProductOrder?.customerFirstName,
    order?.customerLastName || qc?.storeProductOrder?.customerLastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  const contextImages = useMemo(() => {
    const urls: string[] = []
    const push = (url?: string | null) => {
      const t = url?.trim()
      if (t && !urls.includes(t)) urls.push(t)
    }
    push(orderItem?.fabricImage)
    push(orderItem?.readyItemImage)
    push(orderItem?.referenceImage)
    push(orderItem?.fitImage)
    return urls
  }, [orderItem])

  const productImage = watch("productImage")
  const status = watch("qualityCheckStatus")
  const actualByKey = watch("actualByKey")
  const actualEntries = useMemo(
    () =>
      Object.entries(actualByKey || {}).filter(([, v]) => String(v).trim()),
    [actualByKey]
  )

  const loading = (Boolean(qcItemId) && qcLoading) || orderLoading
  const saving = creating || updating
  const isEdit = Boolean(qcItemId)

  const openPreview = (images: string[], index = 0) => {
    if (!images.length) return
    setPreviewImages(images)
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!resolvedOrderId || !userId) {
      notify.error("Missing order or customer for this quality check")
      return
    }
    if (!itemName && !isEdit) {
      notify.error("Could not resolve the order product")
      return
    }

    const payload = buildQualityCheckPayload(values, {
      orderId: resolvedOrderId,
      userId,
      stylistId,
      itemNumber,
      name: itemName,
      catId,
    })

    try {
      if (isEdit) {
        await updateQc({
          variables: {
            orderQualityCheckId: qcItemId,
            orderQualityCheck: payload,
          },
        })
        notify.success("Quality check updated")
      } else {
        await createQc({
          variables: { orderQualityCheck: payload },
        })
        notify.success("Quality check created")
      }
      reset(values)
      router.back()
    } catch (err) {
      notify.fromError(
        err,
        isEdit
          ? "Failed to update quality check"
          : "Failed to create quality check"
      )
    }
  })

  const uploadPath = orderNo
    ? `${QC_IMAGE_UPLOAD_PATH}/${orderNo}`
    : QC_IMAGE_UPLOAD_PATH

  if (!qcItemId && !orderIdParam) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quality check form
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Open a product from the Quality Check list to enter or edit a check.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Button type="button" onClick={() => router.push("/quality-check")}>
            Go to quality check list
          </Button>
        </div>
      </div>
    )
  }

  if (loading && !qc && !order) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (qcError || orderError) {
    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-destructive text-sm" role="alert">
          Failed to load quality check data.
        </p>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-5 pb-24">
        <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mt-0.5 size-8 shrink-0"
                aria-label="Back"
                onClick={() => router.back()}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight">
                  {isEdit ? "Edit quality check" : "New quality check"}
                  {itemName ? ` · ${itemName}` : ""}
                  {itemNumber != null && itemNumber !== ""
                    ? ` #${itemNumber}`
                    : ""}
                </h1>
                <p className="text-muted-foreground truncate text-sm">
                  Order {orderNo ?? "—"}
                  {customerName ? ` · ${customerName}` : ""}
                  {isDirty ? (
                    <span className="text-amber-700 dark:text-amber-400">
                      {" "}
                      · Unsaved changes
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || (!isDirty && isEdit)}>
                {saving ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>

        {contextImages.length > 0 ? (
          <section className="bg-card space-y-3 rounded-lg border p-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Product context
              </h2>
              <p className="text-muted-foreground text-xs">
                Fabric / ready / reference images from the order item
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {contextImages.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  className="border-border bg-muted/40 size-20 overflow-hidden rounded-md border"
                  title="Preview image"
                  onClick={() => openPreview(contextImages, idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="bg-card space-y-3 rounded-lg border p-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Checklist</h2>
            <p className="text-muted-foreground text-xs">
              Mark OK, set rating, and add notes per category
            </p>
          </div>
          <QcChecklistGrid disabled={saving} />
        </section>

        <section className="bg-card space-y-4 rounded-lg border p-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Status</h2>
            <p className="text-muted-foreground text-xs">
              Overall quality check outcome
            </p>
          </div>
          <Controller
            control={control}
            name="qualityCheckStatus"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {QUALITY_CHECK_STATUS_OPTIONS.map((opt) => {
                  const selected = field.value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        field.onChange(selected ? "" : opt.value)
                      }
                      className={cn(
                        qualityCheckStatusChipClass(opt.value),
                        "cursor-pointer px-3 py-1.5 text-xs transition-opacity",
                        selected
                          ? "ring-ring ring-2 ring-offset-2 ring-offset-background"
                          : "opacity-70 hover:opacity-100"
                      )}
                      aria-pressed={selected}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {status ? (
            <p className="text-muted-foreground text-xs">
              Selected:{" "}
              <span className={qualityCheckStatusChipClass(status)}>
                {status}
              </span>
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="qualityCheckNote">Overall note</Label>
            <Controller
              control={control}
              name="qualityCheckNote"
              render={({ field }) => (
                <Textarea
                  id="qualityCheckNote"
                  rows={3}
                  placeholder="Overall quality check note"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </section>

        <section className="bg-card space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                QC product image
              </h2>
              <p className="text-muted-foreground text-xs">
                Photo of the finished product for this check
              </p>
            </div>
            <div className="flex gap-2">
              {productImage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue("productImage", "", { shouldDirty: true })
                  }
                >
                  <XIcon className="size-3.5" />
                  Remove
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadOpen(true)}
              >
                <ImageIcon className="size-3.5" />
                {productImage ? "Replace image" : "Upload image"}
              </Button>
            </div>
          </div>
          {productImage ? (
            <button
              type="button"
              className="block max-w-sm"
              onClick={() => openPreview([productImage], 0)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImage}
                alt="Product"
                className="max-h-56 rounded-md border object-contain"
              />
            </button>
          ) : (
            <div className="border-border bg-muted/30 text-muted-foreground flex h-36 items-center justify-center rounded-md border border-dashed text-sm">
              No product image uploaded
            </div>
          )}
        </section>

        <section className="bg-card space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Actual measurements
              </h2>
              <p className="text-muted-foreground text-xs">
                {actualEntries.length > 0
                  ? `${actualEntries.length} value${actualEntries.length === 1 ? "" : "s"} entered`
                  : "Optional — enter actual garment measurements"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!userId || !catId}
              onClick={() => setMeasurementsOpen(true)}
            >
              <RulerIcon className="size-3.5" />
              {actualEntries.length > 0
                ? "Edit measurements"
                : "Enter measurements"}
            </Button>
          </div>
          {!userId || !catId ? (
            <p className="text-muted-foreground text-sm">
              Category or customer missing — measurements unavailable.
            </p>
          ) : null}
          {actualEntries.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {actualEntries.slice(0, 12).map(([name, value]) => (
                <span
                  key={name}
                  className="bg-muted inline-flex items-center rounded-md border px-2 py-1 text-[11px]"
                >
                  <span className="text-muted-foreground mr-1">{name}:</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </span>
              ))}
              {actualEntries.length > 12 ? (
                <span className="text-muted-foreground text-[11px]">
                  +{actualEntries.length - 12} more
                </span>
              ) : null}
            </div>
          ) : null}
        </section>

        <Controller
          control={control}
          name="productImage"
          render={({ field }) => <Input type="hidden" {...field} />}
        />
      </form>

      {uploadOpen ? (
        <UppyFileUpload
          open
          uppyId="qc-product-image-upload"
          uploadPath={uploadPath}
          maxNumberOfFiles={1}
          enableImageEditor
          enableCompressor
          allowedFileTypes={[
            ".png",
            ".jpg",
            ".jpeg",
            ".webp",
            ".heic",
            ".heif",
          ]}
          onClose={() => setUploadOpen(false)}
          onCompleted={(result) => {
            const urls = uploadUrlsFromResult(result.successful)
            if (urls[0]) {
              setValue("productImage", urls[0], { shouldDirty: true })
            }
            setUploadOpen(false)
          }}
        />
      ) : null}

      <QcActualMeasurementsDialog
        open={measurementsOpen}
        onOpenChange={setMeasurementsOpen}
        userId={userId}
        catId={catId}
        initialByKey={actualByKey}
        onApply={(byKey) =>
          setValue("actualByKey", byKey, { shouldDirty: true })
        }
      />

      <ReceiptImagePreview
        open={previewOpen}
        images={previewImages}
        initialIndex={previewIndex}
        onOpenChange={setPreviewOpen}
        ariaLabel="Quality check images"
      />
    </FormProvider>
  )
}

export function QualityCheckFormClient() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">
          Loading quality check form…
        </p>
      }
    >
      <FormInner />
    </Suspense>
  )
}
