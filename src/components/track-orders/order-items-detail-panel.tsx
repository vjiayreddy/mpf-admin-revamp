"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { useApolloClient, useMutation } from "@apollo/client/react"
import type { ICellRendererParams } from "ag-grid-community"
import { Loader2Icon, PencilIcon } from "lucide-react"

import { OrderItemRowActions } from "@/components/track-orders/order-item-row-actions"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Button } from "@/components/ui/button"
import {
  GENERATE_ORDER_ITEM_QR_CODE,
  GET_STORE_ORDER_ITEMS_FOR_DETAIL,
  type GenerateOrderItemQrCodeData,
  type GenerateOrderItemQrCodeVars,
  type GetStoreOrderByIdVars,
  type GetStoreOrderItemsDetailData,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import {
  GET_BODY_PROFILE,
  bodyProfileImageUrls,
  type GetBodyProfileData,
  type GetBodyProfileVars,
} from "@/lib/apollo/queries/body-profile"
import { formatStoreOrderDate } from "@/lib/track-orders/format"
import { productionStatusChipButtonClass } from "@/lib/track-orders/production-status-chip"
import { cn } from "@/lib/utils"

const DETAIL_ROW_H = 48
const DETAIL_HEAD_H = 36
const DETAIL_LABEL_H = 28
const DETAIL_PAD = 4
const DETAIL_LOADING_H = 72
const DETAIL_EMPTY_H = 56

type DetailColId =
  | "more"
  | "prod"
  | "product"
  | "itemNo"
  | "color"
  | "fabCode"
  | "ready"
  | "ref"
  | "fab"
  | "qr"
  | "client"
  | "readyDate"
  | "trial"
  | "meas"
  | "outfit"
  | "workshops"
  | "stitch"
  | "emb"
  | "note"
  | "actions"

type DetailCol = {
  id: DetailColId
  label: string
  width: number
  minWidth: number
  resizable?: boolean
}

const DETAIL_COLS: DetailCol[] = [
  { id: "more", label: "", width: 44, minWidth: 40, resizable: false },
  { id: "prod", label: "Prod.", width: 104, minWidth: 72 },
  { id: "product", label: "Product", width: 148, minWidth: 88 },
  { id: "itemNo", label: "Item no.", width: 88, minWidth: 64 },
  { id: "color", label: "Color", width: 88, minWidth: 64 },
  { id: "fabCode", label: "Fab code", width: 96, minWidth: 72 },
  { id: "ready", label: "Ready", width: 56, minWidth: 48 },
  { id: "ref", label: "Ref", width: 56, minWidth: 48 },
  { id: "fab", label: "Fab", width: 56, minWidth: 48 },
  { id: "qr", label: "QR", width: 96, minWidth: 72 },
  { id: "client", label: "Client", width: 88, minWidth: 72 },
  { id: "readyDate", label: "Ready date", width: 104, minWidth: 80 },
  { id: "trial", label: "Trial", width: 104, minWidth: 80 },
  { id: "meas", label: "Meas.", width: 96, minWidth: 72 },
  { id: "outfit", label: "Outfit", width: 96, minWidth: 72 },
  { id: "workshops", label: "Workshops", width: 180, minWidth: 120 },
  { id: "stitch", label: "Stitching", width: 120, minWidth: 88 },
  { id: "emb", label: "Emb", width: 56, minWidth: 48 },
  { id: "note", label: "Note", width: 160, minWidth: 96 },
  { id: "actions", label: "", width: 84, minWidth: 72, resizable: false },
]

const DEFAULT_COL_WIDTHS = Object.fromEntries(
  DETAIL_COLS.map((col) => [col.id, col.width])
) as Record<DetailColId, number>

export type OrderItemsDetailRow = {
  __kind: "detail"
  parentId: string
  orderNo?: string | number | null
  userId?: string | null
  refreshNonce?: number
}

export type OrderItemsDetailPanelContext = {
  onEditItem?: (
    orderId: string,
    orderNo: string | number | null | undefined,
    item: StoreOrderItem
  ) => void
  onEditItemProductionStatus?: (
    orderId: string,
    orderNo: string | number | null | undefined,
    item: StoreOrderItem
  ) => void
  onDetailHeight?: (orderId: string, height: number) => void
  refreshNonce?: number
}

type OrderItemsDetailPanelProps = ICellRendererParams<OrderItemsDetailRow> & {
  context?: OrderItemsDetailPanelContext
}

function itemImageUrls(item: StoreOrderItem): string[] {
  const urls: string[] = []
  const push = (url?: string | null) => {
    const trimmed = url?.trim()
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
  }
  push(item.readyItemImage)
  push(item.referenceImage)
  push(item.fabricImage)
  push(item.fitImage)
  return urls
}

function Thumb({
  url,
  item,
  onPreview,
}: {
  url?: string | null
  item: StoreOrderItem
  onPreview: (images: string[], index: number) => void
}) {
  const src = url?.trim() ?? ""
  if (!src) {
    return <span className="text-muted-foreground text-xs">—</span>
  }
  const images = itemImageUrls(item)
  const index = Math.max(0, images.indexOf(src))
  return (
    <button
      type="button"
      className="border-border size-9 shrink-0 overflow-hidden rounded border"
      title="View image"
      onClick={(e) => {
        e.stopPropagation()
        onPreview(images.length ? images : [src], index >= 0 ? index : 0)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" loading="lazy" />
    </button>
  )
}

function QrCell({
  item,
  generating,
  onGenerate,
  onPreview,
}: {
  item: StoreOrderItem
  generating: boolean
  onGenerate: () => void
  onPreview: (images: string[], index: number, kind?: "image" | "qr") => void
}) {
  const src = item.qrCodeImage?.trim() ?? ""
  if (src) {
    return (
      <button
        type="button"
        className="border-border size-9 shrink-0 overflow-hidden rounded border bg-white"
        title="View QR code"
        onClick={(e) => {
          e.stopPropagation()
          onPreview([src], 0, "qr")
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="QR code"
          className="size-full object-contain p-0.5"
          loading="lazy"
        />
      </button>
    )
  }
  return (
    <Button
      type="button"
      size="xs"
      variant="outline"
      className="h-7 whitespace-nowrap border-[#b7cdd9] bg-white px-2 text-[10px] text-[#1c2430]"
      disabled={generating || !item._id}
      onClick={(e) => {
        e.stopPropagation()
        onGenerate()
      }}
    >
      {generating ? (
        <>
          <Loader2Icon className="size-3 animate-spin" />
          …
        </>
      ) : (
        "Generate QR"
      )}
    </Button>
  )
}

function ClientImageCell({
  loading,
  images,
  onPreview,
}: {
  loading: boolean
  images: string[]
  onPreview: (images: string[], index: number) => void
}) {
  if (loading) {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
        <Loader2Icon className="size-3 animate-spin" />
      </span>
    )
  }
  if (images.length === 0) {
    return <span className="text-muted-foreground text-xs">No</span>
  }
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#b7cdd9] bg-white px-2 text-xs font-medium text-[#1c2430] hover:ring-1 hover:ring-[#2f6f8f]"
      title="View client body images"
      onClick={(e) => {
        e.stopPropagation()
        onPreview(images, 0)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[0]}
        alt=""
        className="size-5 shrink-0 rounded object-cover"
        loading="lazy"
      />
      Yes
    </button>
  )
}

function workshopsLabel(item: StoreOrderItem) {
  const parts = [
    item.itemWorkshopName && `Item: ${item.itemWorkshopName}`,
    item.fabricWorkshopName && `Fabric: ${item.fabricWorkshopName}`,
    item.embroideryWorkshopName && `Emb: ${item.embroideryWorkshopName}`,
    item.dyingWorkshopName && `Dying: ${item.dyingWorkshopName}`,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

function DetailColResizeHandle({
  colId,
  minWidth,
  onResize,
}: {
  colId: DetailColId
  minWidth: number
  onResize: (colId: DetailColId, width: number) => void
}) {
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onPointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const th = e.currentTarget.parentElement
    startX.current = e.clientX
    startWidth.current = th?.getBoundingClientRect().width ?? minWidth
    e.currentTarget.setPointerCapture(e.pointerId)

    const onMove = (ev: PointerEvent) => {
      const next = Math.max(
        minWidth,
        Math.round(startWidth.current + (ev.clientX - startX.current))
      )
      onResize(colId, next)
    }
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      try {
        e.currentTarget.releasePointerCapture(ev.pointerId)
      } catch {
        /* already released */
      }
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${colId} column`}
      className="mpf-detail-col-resizer"
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
    />
  )
}

export function detailRowHeightForCount(
  count: number | null,
  loading: boolean
): number {
  const chrome = DETAIL_PAD * 2 + DETAIL_LABEL_H
  if (loading || count == null) return chrome + DETAIL_LOADING_H
  if (count === 0) return chrome + DETAIL_EMPTY_H
  return chrome + DETAIL_HEAD_H + count * DETAIL_ROW_H
}

export function OrderItemsDetailPanel(params: OrderItemsDetailPanelProps) {
  const client = useApolloClient()
  const orderId = params.data?.parentId
  const orderNo = params.data?.orderNo
  const userId = params.data?.userId
  const context = (params.context ?? {}) as OrderItemsDetailPanelContext
  const refreshNonce =
    params.data?.refreshNonce ?? context.refreshNonce ?? 0

  const [items, setItems] = useState<StoreOrderItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [clientImages, setClientImages] = useState<string[]>([])
  const [clientImagesLoading, setClientImagesLoading] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [galleryKind, setGalleryKind] = useState<"image" | "qr">("image")
  const [generatingQrItemId, setGeneratingQrItemId] = useState<string | null>(
    null
  )
  const [qrError, setQrError] = useState<string | null>(null)
  const [colWidths, setColWidths] =
    useState<Record<DetailColId, number>>(DEFAULT_COL_WIDTHS)
  const onDetailHeightRef = useRef(context.onDetailHeight)
  onDetailHeightRef.current = context.onDetailHeight
  const lastReportedHeight = useRef<number | null>(null)

  const [generateQr] = useMutation<
    GenerateOrderItemQrCodeData,
    GenerateOrderItemQrCodeVars
  >(GENERATE_ORDER_ITEM_QR_CODE)

  const tableMinWidth = useMemo(
    () => DETAIL_COLS.reduce((sum, col) => sum + colWidths[col.id], 0),
    [colWidths]
  )

  const onResizeCol = useCallback((colId: DetailColId, width: number) => {
    setColWidths((prev) =>
      prev[colId] === width ? prev : { ...prev, [colId]: width }
    )
  }, [])

  const generateItemQr = useCallback(
    async (item: StoreOrderItem) => {
      if (!orderId || !item._id) return
      setQrError(null)
      setGeneratingQrItemId(item._id)
      try {
        const result = await generateQr({
          variables: { orderId, orderItemId: item._id },
        })
        const url = result.data?.generateOrderItemQrCode?.qrCodeUrl?.trim()
        if (!url) {
          setQrError("QR code was not returned by the server")
          return
        }
        setItems((prev) =>
          prev
            ? prev.map((row) =>
                row._id === item._id ? { ...row, qrCodeImage: url } : row
              )
            : prev
        )
      } catch (err: unknown) {
        setQrError(
          err instanceof Error ? err.message : "Failed to generate QR code"
        )
      } finally {
        setGeneratingQrItemId(null)
      }
    },
    [generateQr, orderId]
  )
  const reportHeight = (height: number) => {
    if (!orderId) return
    if (lastReportedHeight.current === height) return
    lastReportedHeight.current = height
    onDetailHeightRef.current?.(orderId, height)
  }

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setItems(null)
    lastReportedHeight.current = null
    reportHeight(detailRowHeightForCount(null, true))

    void client
      .query<GetStoreOrderItemsDetailData, GetStoreOrderByIdVars>({
        query: GET_STORE_ORDER_ITEMS_FOR_DETAIL,
        variables: { orderId },
        fetchPolicy: "no-cache",
      })
      .then((result) => {
        if (cancelled) return
        const next = result.data?.getStoreOrderById?.orderItems ?? []
        setItems(next)
        setLoading(false)
        reportHeight(detailRowHeightForCount(next.length, false))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : "Failed to load order items"
        )
        setLoading(false)
        reportHeight(detailRowHeightForCount(0, false))
      })

    return () => {
      cancelled = true
    }
    // Only re-fetch when the order or explicit refresh nonce changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, orderId, refreshNonce])

  useEffect(() => {
    if (!userId) {
      setClientImages([])
      setClientImagesLoading(false)
      return
    }
    let cancelled = false
    setClientImagesLoading(true)
    void client
      .query<GetBodyProfileData, GetBodyProfileVars>({
        query: GET_BODY_PROFILE,
        variables: { userId },
        fetchPolicy: "cache-first",
      })
      .then((result) => {
        if (cancelled) return
        const profile = result.data?.getBodyProfile?.[0] ?? null
        setClientImages(bodyProfileImageUrls(profile))
        setClientImagesLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setClientImages([])
        setClientImagesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client, userId])

  const openPreview = (
    images: string[],
    index: number,
    kind: "image" | "qr" = "image"
  ) => {
    setGalleryImages(images)
    setGalleryIndex(index)
    setGalleryKind(kind)
    setGalleryOpen(true)
  }

  return (
    <div
      className="mpf-order-detail-panel box-border h-full w-full min-w-0"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
        <div className="flex shrink-0 items-center gap-2 px-3 py-1.5">
          <span className="mpf-order-detail-label text-[10px] font-semibold uppercase">
            Line items
          </span>
          {orderNo != null ? (
            <span className="mpf-order-detail-meta text-[11px]">
              Order #{orderNo}
            </span>
          ) : null}
          {!loading && !error && items ? (
            <span className="mpf-order-detail-meta text-[11px]">
              · {items.length}
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto">
          {loading ? (
            <div className="mpf-order-detail-meta flex h-[4.5rem] items-center justify-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading items…
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive px-3 py-3 text-sm">{error}</p>
          ) : null}

          {qrError ? (
            <p className="text-destructive px-3 py-1 text-xs">{qrError}</p>
          ) : null}

          {!loading && !error && (items?.length ?? 0) === 0 ? (
            <div className="mpf-order-detail-meta flex h-14 items-center justify-center text-sm">
              No line items found
            </div>
          ) : null}

          {!loading && !error && items && items.length > 0 ? (
            <table
              className="mpf-order-detail-table text-left text-xs"
              style={{ width: tableMinWidth, minWidth: tableMinWidth }}
            >
              <colgroup>
                {DETAIL_COLS.map((col) => (
                  <col
                    key={col.id}
                    style={{ width: colWidths[col.id], minWidth: col.minWidth }}
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {DETAIL_COLS.map((col) => (
                    <th
                      key={col.id}
                      className="relative px-2 py-2 font-semibold whitespace-nowrap"
                      style={{ width: colWidths[col.id] }}
                    >
                      {col.label}
                      {col.resizable !== false ? (
                        <DetailColResizeHandle
                          colId={col.id}
                          minWidth={col.minWidth}
                          onResize={onResizeCol}
                        />
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const urgent =
                    (item.productionStatus || "").toUpperCase() === "URGENT"
                  return (
                    <tr
                      key={item._id ?? `${item.itemNumber}-${idx}`}
                      className={cn(
                        !urgent && idx % 2 === 1 && "mpf-detail-row-alt",
                        urgent && "bg-destructive/10"
                      )}
                      style={{ height: DETAIL_ROW_H }}
                    >
                      <td className="overflow-hidden px-1 py-1.5 align-middle">
                        <OrderItemRowActions item={item} />
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        <button
                          type="button"
                          className={cn(
                            item.productionStatus
                              ? productionStatusChipButtonClass(
                                  item.productionStatus
                                )
                              : "inline-flex h-7 items-center rounded-md border border-[#b7cdd9] bg-white px-2 text-xs font-medium text-[#1c2430] hover:ring-1 hover:ring-[#2f6f8f]"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (orderId) {
                              context.onEditItemProductionStatus?.(
                                orderId,
                                orderNo,
                                item
                              )
                            }
                          }}
                        >
                          {item.productionStatus || "Set"}
                        </button>
                      </td>
                      <td className="overflow-hidden truncate px-2 py-1.5 align-middle">
                        {item.itemName || "—"}
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        {item.itemNumber == null || item.itemNumber === ""
                          ? "—"
                          : String(item.itemNumber)}
                      </td>
                      <td className="overflow-hidden truncate px-2 py-1.5 align-middle whitespace-nowrap">
                        {item.itemColor || "—"}
                      </td>
                      <td className="overflow-hidden truncate px-2 py-1.5 align-middle whitespace-nowrap">
                        {item.fabricCode || "—"}
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle">
                        <Thumb
                          url={item.readyItemImage}
                          item={item}
                          onPreview={openPreview}
                        />
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle">
                        <Thumb
                          url={item.referenceImage}
                          item={item}
                          onPreview={openPreview}
                        />
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle">
                        <Thumb
                          url={item.fabricImage}
                          item={item}
                          onPreview={openPreview}
                        />
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle">
                        <QrCell
                          item={item}
                          generating={generatingQrItemId === item._id}
                          onGenerate={() => void generateItemQr(item)}
                          onPreview={openPreview}
                        />
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        <ClientImageCell
                          loading={clientImagesLoading}
                          images={clientImages}
                          onPreview={openPreview}
                        />
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        {formatStoreOrderDate(item.readyDate)}
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        {formatStoreOrderDate(item.trialDate)}
                      </td>
                      <td className="overflow-hidden truncate px-2 py-1.5 align-middle whitespace-nowrap">
                        {item.measurementApprovalStatus || "—"}
                      </td>
                      <td className="overflow-hidden truncate px-2 py-1.5 align-middle whitespace-nowrap">
                        {item.outfitStatus || "—"}
                      </td>
                      <td
                        className="overflow-hidden truncate px-2 py-1.5 align-middle"
                        title={workshopsLabel(item)}
                      >
                        {workshopsLabel(item)}
                      </td>
                      <td
                        className="overflow-hidden truncate px-2 py-1.5 align-middle"
                        title={item.stitchingWorkshopName || undefined}
                      >
                        {item.stitchingWorkshopName || "—"}
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        {item.hasEmbroidary ? "Yes" : "No"}
                      </td>
                      <td
                        className="overflow-hidden truncate px-2 py-1.5 align-middle"
                        title={item.trackingNote || undefined}
                      >
                        {item.trackingNote || "—"}
                      </td>
                      <td className="overflow-hidden px-2 py-1.5 align-middle whitespace-nowrap">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          className="h-7 gap-1 border-[#b7cdd9] bg-white px-2 text-[#1c2430]"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (orderId) {
                              context.onEditItem?.(orderId, orderNo, item)
                            }
                          }}
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
          ) : null}
        </div>
      </div>

      <ReceiptImagePreview
        open={galleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
        onOpenChange={setGalleryOpen}
        ariaLabel={
          galleryKind === "qr" ? "QR code preview" : "Order item image gallery"
        }
        variant={galleryKind === "qr" ? "qr" : "default"}
      />
    </div>
  )
}
