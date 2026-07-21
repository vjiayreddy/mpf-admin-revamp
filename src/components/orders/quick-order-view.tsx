"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@apollo/client/react"
import type { GetRowIdParams } from "ag-grid-community"
import { FilePenIcon, Loader2Icon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { DataGrid } from "@/components/data-grid/data-grid"
import {
  EmbroideryDesignSummaryDialog,
  type EmbroideryDesignSummaryContext,
} from "@/components/embroidery/embroidery-design-summary-dialog"
import { buildOrderViewItemColumnDefs } from "@/components/orders/order-view-item-columns"
import {
  StylingFormDialog,
  type StyleDesignValue,
} from "@/components/orders/styling-form-dialog"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type OrdersListRow,
} from "@/lib/apollo/queries/store-orders"
import { firstName } from "@/lib/embroidery/format"
import { notify } from "@/lib/notify"
import {
  catIdForItemName,
  formatProductLabel,
  orderItemsFromDetail,
  type OrderFormItem,
} from "@/lib/orders/form"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
} from "@/lib/track-orders/format"

export type QuickOrderViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrdersListRow | null
}

function MetaCell({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-snug font-medium break-words">
        {value?.trim() || "—"}
      </dd>
    </div>
  )
}

function MoneyCell({
  label,
  value,
  emphasize,
}: {
  label: string
  value?: number | null
  emphasize?: boolean
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
        {label}
      </p>
      <p
        className={
          emphasize
            ? "text-base font-semibold tabular-nums tracking-tight"
            : "text-sm font-medium tabular-nums"
        }
      >
        {formatRupees(value)}
      </p>
    </div>
  )
}

export function QuickOrderView({
  open,
  onOpenChange,
  order,
}: QuickOrderViewProps) {
  const router = useRouter()
  const orderId = order?._id?.trim() || ""
  const canFetch = open && Boolean(orderId)

  const [preview, setPreview] = useState<{
    images: string[]
    index: number
  } | null>(null)
  const [stylingViewItem, setStylingViewItem] =
    useState<OrderFormItem | null>(null)
  const [embViewItem, setEmbViewItem] = useState<OrderFormItem | null>(null)

  const { data, loading, error } = useQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, {
    variables: { orderId },
    skip: !canFetch,
    fetchPolicy: "network-only",
  })

  const detail = data?.getStoreOrderById
  const items = useMemo(
    () => (detail ? orderItemsFromDetail(detail) : []),
    [detail]
  )

  const title = useMemo(() => {
    const no = detail?.orderNo ?? order?.orderNo
    return `Order ${no != null ? String(no) : "—"}`
  }, [detail?.orderNo, order?.orderNo])

  const name = customerFullName(
    detail?.customerFirstName || order?.customerFirstName,
    detail?.customerLastName || order?.customerLastName
  )

  const customerId =
    detail?.customerId?.trim() || order?.customerId?.trim() || ""

  const openStylingView = useCallback((item: OrderFormItem) => {
    const itemName = item.itemName?.trim() || ""
    const catId = item.itemCatId?.trim() || catIdForItemName(itemName)
    if (!catId || catId === "NA") {
      notify.warning("Styling is not available for this product")
      return
    }
    setStylingViewItem(item)
  }, [])

  const openEmbroideryView = useCallback((item: OrderFormItem) => {
    setEmbViewItem(item)
  }, [])

  const columnDefs = useMemo(
    () =>
      buildOrderViewItemColumnDefs({
        onViewStyling: openStylingView,
        onViewEmbroidery: openEmbroideryView,
        onPreview: (images, index) => setPreview({ images, index }),
      }),
    [openStylingView, openEmbroideryView]
  )

  const stylingCatId =
    stylingViewItem?.itemCatId?.trim() ||
    catIdForItemName(stylingViewItem?.itemName?.trim() || "")
  const stylingItemName = stylingViewItem?.itemName?.trim() || ""

  const embSummaryContext =
    useMemo((): EmbroideryDesignSummaryContext | null => {
      if (!embViewItem) return null
      return {
        customerId: customerId || null,
        customerName: name || null,
        storeOrderNo: detail?.orderNo ?? order?.orderNo ?? null,
        storeOrderProductName: embViewItem.itemName
          ? formatProductLabel(embViewItem.itemName)
          : null,
        storeOrderProductNumber: embViewItem.itemNumber ?? null,
        fabricImage: embViewItem.fabricImage || null,
        referenceImage: embViewItem.referenceImage || null,
        fabricImageNote: embViewItem.fabricImageNote || null,
        referenceImageNote: embViewItem.referenceImageNote || null,
        fabricColor: embViewItem.itemColor || null,
        fabricName: embViewItem.fabricCode || null,
      }
    }, [embViewItem, customerId, name, detail?.orderNo, order?.orderNo])

  const goEdit = () => {
    if (!orderId) return
    onOpenChange(false)
    router.push(`/orders/form?orderId=${encodeURIComponent(orderId)}`)
  }

  const showContent = !loading && !error && Boolean(detail)

  const studioName =
    (Array.isArray(detail?.studio) && detail?.studio[0]?.name) ||
    (Array.isArray(order?.studio) && order?.studio[0]?.name) ||
    null

  const stylistLabel = [firstName(detail?.stylist), firstName(order?.stylist)].find(
    (n) => n && n !== "—"
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(92vh,56rem)] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="bg-background/95 supports-backdrop-filter:bg-background/85 shrink-0 border-b px-4 py-3.5 backdrop-blur sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {(detail?.orderStatus || order?.orderStatus) && (
                    <Badge variant="secondary">
                      {detail?.orderStatus?.trim() ||
                        order?.orderStatus?.trim()}
                    </Badge>
                  )}
                  {stylistLabel ? (
                    <Badge variant="outline">{stylistLabel}</Badge>
                  ) : null}
                </div>
                <DialogTitle className="truncate text-base sm:text-lg">
                  {title}
                </DialogTitle>
                <DialogDescription className="line-clamp-2 text-xs sm:text-sm">
                  {[name, customerId ? `Cus. ${customerId}` : null]
                    .filter(Boolean)
                    .join(" · ") || "Order details"}
                </DialogDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  disabled={!orderId}
                  onClick={goEdit}
                >
                  <FilePenIcon className="size-3.5" />
                  Edit order
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

          <div className="from-muted/40 via-muted/20 to-background min-h-0 flex-1 overflow-y-auto bg-gradient-to-b">
            {loading ? (
              <div className="mx-auto flex max-w-5xl flex-col gap-4 p-5 sm:p-6">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2Icon className="size-4 animate-spin" />
                  Loading order…
                </div>
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            ) : null}

            {error ? (
              <div className="mx-auto max-w-5xl p-6" role="alert">
                <div className="border-destructive/30 bg-destructive/5 rounded-2xl border px-4 py-3 text-sm">
                  Failed to load order details.
                </div>
              </div>
            ) : null}

            {showContent && detail ? (
              <div className="mx-auto flex max-w-5xl flex-col gap-5 p-5 pb-8 sm:p-6">
                <section className="bg-card overflow-hidden rounded-2xl border">
                  <div className="from-muted/40 via-background to-background border-b bg-gradient-to-br px-5 py-4 sm:px-6">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      <MetaCell
                        label="Order date"
                        value={formatStoreOrderDate(detail.orderDate)}
                      />
                      <MetaCell
                        label="Trial date"
                        value={formatStoreOrderDate(detail.trialDate)}
                      />
                      <MetaCell
                        label="Delivery"
                        value={formatStoreOrderDate(detail.deliveryDate)}
                      />
                      <MetaCell
                        label="Phone"
                        value={detail.customerPhone}
                      />
                      <MetaCell label="Studio" value={studioName} />
                    </dl>
                  </div>
                  <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
                    <MoneyCell
                      label="Order total"
                      value={detail.orderTotal}
                      emphasize
                    />
                    <MoneyCell label="Paid" value={detail.payment} />
                    <MoneyCell
                      label="Balance"
                      value={detail.balanceAmount}
                      emphasize
                    />
                    <MoneyCell label="Charges" value={detail.otherCharges} />
                    <MoneyCell
                      label="Deductions"
                      value={detail.deductions}
                    />
                  </div>
                </section>

                {detail.remark?.trim() ? (
                  <section className="bg-card rounded-2xl border px-5 py-4">
                    <p className="text-muted-foreground mb-1.5 text-[10px] font-medium tracking-[0.08em] uppercase">
                      Remark
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {detail.remark}
                    </p>
                  </section>
                ) : null}

                <section className="space-y-3">
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight">
                      Products
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {items.length} line item
                      {items.length === 1 ? "" : "s"}
                      {items.length > 0
                        ? " · Open emb or styling icons for details"
                        : ""}
                    </p>
                  </div>

                  {items.length === 0 ? (
                    <div className="bg-card text-muted-foreground rounded-2xl border border-dashed px-4 py-10 text-center text-sm">
                      No products on this order.
                    </div>
                  ) : (
                    <div className="bg-card overflow-hidden rounded-2xl border">
                      <DataGrid<OrderFormItem>
                        rowData={items}
                        columnDefs={columnDefs}
                        getRowId={(p: GetRowIdParams<OrderFormItem>) =>
                          p.data.key
                        }
                        getRowHeight={() => 42}
                        alwaysShowHorizontalScroll
                        heightClassName="h-[min(320px,40vh)] min-h-[180px]"
                        defaultColDef={{
                          sortable: true,
                          resizable: true,
                          filter: false,
                          suppressHeaderMenuButton: true,
                        }}
                        persistKey="orders-quick-view-items"
                      />
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </div>

          <DialogFooter className="bg-background shrink-0 justify-between gap-2 border-t px-4 py-3 sm:px-5">
            <p className="text-muted-foreground hidden text-[11px] sm:block">
              MyPerfectFit · Order details
            </p>
            <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button type="button" disabled={!orderId} onClick={goEdit}>
                <FilePenIcon className="size-3.5" />
                Edit order
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptImagePreview
        open={Boolean(preview)}
        images={preview?.images ?? []}
        initialIndex={preview?.index ?? 0}
        onOpenChange={(next) => {
          if (!next) setPreview(null)
        }}
        ariaLabel="Product image preview"
      />

      <StylingFormDialog
        open={Boolean(stylingViewItem)}
        onOpenChange={(next) => {
          if (!next) setStylingViewItem(null)
        }}
        catId={stylingCatId}
        itemName={stylingItemName}
        styleDesign={
          (stylingViewItem?.styleDesign as StyleDesignValue | null) ?? null
        }
        readOnly
        onSubmit={() => {}}
      />

      <EmbroideryDesignSummaryDialog
        open={Boolean(embViewItem)}
        onOpenChange={(next) => {
          if (!next) setEmbViewItem(null)
        }}
        embroideryId={embViewItem?.embDetails?.embroideryId ?? null}
        embJsonString={embViewItem?.embDesignDetails ?? null}
        context={embSummaryContext}
      />
    </>
  )
}
