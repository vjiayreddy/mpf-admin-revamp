"use client"

import { useCallback, useMemo, useState } from "react"
import type { GetRowIdParams } from "ag-grid-community"
import { PackageIcon, PlusIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import {
  EmbroideryDesignSummaryDialog,
  type EmbroideryDesignSummaryContext,
} from "@/components/embroidery/embroidery-design-summary-dialog"
import { buildOrderFormItemColumnDefs } from "@/components/orders/order-form-item-columns"
import {
  StylingFormDialog,
  type StyleDesignValue,
} from "@/components/orders/styling-form-dialog"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"
import {
  catIdForItemName,
  formatProductLabel,
  type OrderFormItem,
} from "@/lib/orders/form"

export type OrderItemsSectionProps = {
  items: OrderFormItem[]
  canEditItems: boolean
  onAdd: () => void
  onEdit: (item: OrderFormItem) => void
  onDelete: (key: string) => void
  /** Optional order-level fields for embroidery summary header. */
  embroideryContext?: Omit<
    EmbroideryDesignSummaryContext,
    | "storeOrderProductName"
    | "storeOrderProductNumber"
    | "fabricImage"
    | "referenceImage"
    | "fabricImageNote"
    | "referenceImageNote"
    | "fabricName"
    | "fabricColor"
  > | null
}

export function OrderItemsSection({
  items,
  canEditItems,
  onAdd,
  onEdit,
  onDelete,
  embroideryContext,
}: OrderItemsSectionProps) {
  const [preview, setPreview] = useState<{
    images: string[]
    index: number
  } | null>(null)
  const [stylingViewItem, setStylingViewItem] =
    useState<OrderFormItem | null>(null)
  const [embViewItem, setEmbViewItem] = useState<OrderFormItem | null>(null)

  const openStylingView = useCallback((item: OrderFormItem) => {
    const itemName = item.itemName?.trim() || ""
    const catId =
      item.itemCatId?.trim() || catIdForItemName(itemName)
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
      buildOrderFormItemColumnDefs({
        canEdit: canEditItems,
        onEdit,
        onViewStyling: openStylingView,
        onViewEmbroidery: openEmbroideryView,
        onDelete,
        onPreview: (images, index) => setPreview({ images, index }),
      }),
    [canEditItems, onEdit, openStylingView, openEmbroideryView, onDelete]
  )

  const stylingCatId =
    stylingViewItem?.itemCatId?.trim() ||
    catIdForItemName(stylingViewItem?.itemName?.trim() || "")
  const stylingItemName = stylingViewItem?.itemName?.trim() || ""

  const embSummaryContext = useMemo((): EmbroideryDesignSummaryContext | null => {
    if (!embViewItem) return null
    return {
      ...embroideryContext,
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
  }, [embViewItem, embroideryContext])

  return (
    <div className="space-y-3">
      {!canEditItems ? (
        <div className="bg-muted/40 rounded-lg border border-dashed px-4 py-3 text-sm">
          <p className="font-medium">Trial date required</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Set the trial date in the Dates section before adding products.
          </p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
          <div className="bg-muted flex size-10 items-center justify-center rounded-full">
            <PackageIcon className="text-muted-foreground size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-muted-foreground max-w-sm text-xs">
              Add shirts, trousers, and other garments. Item numbers are
              generated from the order number when you save.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!canEditItems}
            onClick={onAdd}
          >
            <PlusIcon className="size-4" />
            Add first product
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end">
            <Button
              type="button"
              size="sm"
              disabled={!canEditItems}
              onClick={onAdd}
            >
              <PlusIcon className="size-4" />
              Add product
            </Button>
          </div>
          <DataGrid<OrderFormItem>
            rowData={items}
            columnDefs={columnDefs}
            getRowId={(p: GetRowIdParams<OrderFormItem>) => p.data.key}
            getRowHeight={() => 42}
            alwaysShowHorizontalScroll
            heightClassName="h-[min(420px,50vh)] min-h-[200px]"
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: false,
              suppressHeaderMenuButton: true,
            }}
            persistKey="orders-form-items-v2"
          />
        </>
      )}

      <ReceiptImagePreview
        open={Boolean(preview)}
        images={preview?.images ?? []}
        initialIndex={preview?.index ?? 0}
        onOpenChange={(open) => {
          if (!open) setPreview(null)
        }}
        ariaLabel="Product image preview"
      />

      <StylingFormDialog
        open={Boolean(stylingViewItem)}
        onOpenChange={(open) => {
          if (!open) setStylingViewItem(null)
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
        onOpenChange={(open) => {
          if (!open) setEmbViewItem(null)
        }}
        embroideryId={embViewItem?.embDetails?.embroideryId ?? null}
        embJsonString={embViewItem?.embDesignDetails ?? null}
        context={embSummaryContext}
      />
    </div>
  )
}
