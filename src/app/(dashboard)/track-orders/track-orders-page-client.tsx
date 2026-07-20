"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type {
  ColDef,
  GridApi,
  ICellRendererParams,
  IsFullWidthRowParams,
  RowClassParams,
  RowHeightParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ChevronRightIcon, ListFilterIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { ItemAttributesDialog } from "@/components/track-orders/item-attributes-dialog"
import { OrderAttributesDialog } from "@/components/track-orders/order-attributes-dialog"
import {
  OrderItemsDetailPanel,
  type OrderItemsDetailPanelContext,
  type OrderItemsDetailRow,
} from "@/components/track-orders/order-items-detail-panel"
import {
  ProductionStatusDialog,
  type ProductionStatusTarget,
} from "@/components/track-orders/production-status-dialog"
import {
  MeasurementView,
  openMeasurementEdit,
  type MeasurementViewTarget,
} from "@/components/measurements/measurement-view"
import {
  QualityCheckView,
  qualityCheckFormHref,
  type QualityCheckViewTarget,
} from "@/components/quality-check/quality-check-view"
import {
  StyleFormView,
  type StyleFormViewTarget,
} from "@/components/track-orders/style-form-view"
import {
  QuickTrialView,
  type QuickTrialViewTarget,
} from "@/components/trial/quick-trial-view"
import { TrackOrdersFilterBar } from "@/components/track-orders/track-orders-filter-bar"
import { resolveProductCatId } from "@/lib/track-orders/product-cat-id"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTrackOrdersList } from "@/hooks/use-track-orders-list"
import type {
  StoreOrderItem,
  StoreOrderListRow,
} from "@/lib/apollo/queries/store-orders"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
  truncateWords,
} from "@/lib/track-orders/format"
import { productionStatusChipButtonClass } from "@/lib/track-orders/production-status-chip"
import { cn } from "@/lib/utils"

type TrackOrderGridRow =
  | (StoreOrderListRow & { __kind?: "order" })
  | OrderItemsDetailRow

function isDetailRow(row: TrackOrderGridRow | undefined | null): row is OrderItemsDetailRow {
  return row?.__kind === "detail"
}

function ProductionStatusCell(
  params: ICellRendererParams<TrackOrderGridRow> & {
    onEdit?: (order: StoreOrderListRow) => void
  }
) {
  if (isDetailRow(params.data)) return null
  const order = params.data as StoreOrderListRow | undefined
  const status = order?.productionStatus
  if (!status) {
    return (
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="h-7"
        onClick={(e) => {
          e.stopPropagation()
          if (order) params.onEdit?.(order)
        }}
      >
        Set
      </Button>
    )
  }
  return (
    <button
      type="button"
      className={productionStatusChipButtonClass(status)}
      onClick={(e) => {
        e.stopPropagation()
        if (order) params.onEdit?.(order)
      }}
    >
      {status}
    </button>
  )
}

function OrderStatusCell(params: ICellRendererParams<TrackOrderGridRow>) {
  if (isDetailRow(params.data)) return null
  const status = params.data?.orderStatus
  if (!status) return <span className="text-muted-foreground text-xs">—</span>
  return (
    <span className="bg-muted inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium">
      {status}
    </span>
  )
}

export function TrackOrdersPageClient() {
  const router = useRouter()
  const list = useTrackOrdersList()
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderForDialog, setOrderForDialog] = useState<StoreOrderListRow | null>(
    null
  )

  const [productionOpen, setProductionOpen] = useState(false)
  const [productionTarget, setProductionTarget] =
    useState<ProductionStatusTarget | null>(null)

  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [itemTarget, setItemTarget] = useState<{
    orderId: string
    orderNo?: string | number | null
    item: StoreOrderItem
  } | null>(null)

  const [styleFormOpen, setStyleFormOpen] = useState(false)
  const [styleFormTarget, setStyleFormTarget] =
    useState<StyleFormViewTarget | null>(null)

  const [measurementOpen, setMeasurementOpen] = useState(false)
  const [measurementTarget, setMeasurementTarget] =
    useState<MeasurementViewTarget | null>(null)

  const [qcOpen, setQcOpen] = useState(false)
  const [qcTarget, setQcTarget] = useState<QualityCheckViewTarget | null>(null)

  const [trialViewOpen, setTrialViewOpen] = useState(false)
  const [trialViewTarget, setTrialViewTarget] =
    useState<QuickTrialViewTarget | null>(null)

  const [detailRefreshNonce, setDetailRefreshNonce] = useState(0)
  const [detailHeights, setDetailHeights] = useState<Record<string, number>>(
    {}
  )
  const gridApiRef = useRef<GridApi<TrackOrderGridRow> | null>(null)

  // Collapse detail rows when the URL filter/page set changes.
  const paramsKey = list.searchParams.toString()
  useEffect(() => {
    setExpandedOrderId(null)
    setDetailHeights({})
  }, [paramsKey])

  const openOrderAttributes = useCallback((order: StoreOrderListRow) => {
    setOrderForDialog(order)
    setOrderDialogOpen(true)
  }, [])

  const openOrderProduction = useCallback((order: StoreOrderListRow) => {
    setProductionTarget({
      kind: "order",
      orderId: order._id,
      orderNo: order.orderNo,
      current: order.productionStatus,
    })
    setProductionOpen(true)
  }, [])

  const toggleExpand = useCallback((orderId: string) => {
    setExpandedOrderId((prev) => {
      if (prev === orderId) {
        setDetailHeights((heights) => {
          if (!(orderId in heights)) return heights
          const { [orderId]: _, ...rest } = heights
          return rest
        })
        return null
      }
      setDetailHeights({})
      return orderId
    })
  }, [])

  const onDetailHeight = useCallback((orderId: string, height: number) => {
    setDetailHeights((prev) =>
      prev[orderId] === height ? prev : { ...prev, [orderId]: height }
    )
  }, [])

  // Resize without remounting the detail panel (remount caused endless loading).
  useEffect(() => {
    gridApiRef.current?.resetRowHeights()
  }, [detailHeights])

  const displayRows = useMemo<TrackOrderGridRow[]>(() => {
    const rows: TrackOrderGridRow[] = []
    for (const order of list.rows) {
      rows.push({ ...order, __kind: "order" })
      if (expandedOrderId === order._id) {
        rows.push({
          __kind: "detail",
          parentId: order._id,
          orderNo: order.orderNo,
          userId: order.userId,
          refreshNonce: detailRefreshNonce,
        })
      }
    }
    return rows
  }, [list.rows, expandedOrderId, detailRefreshNonce])

  const detailContext = useMemo<OrderItemsDetailPanelContext>(
    () => ({
      refreshNonce: detailRefreshNonce,
      onDetailHeight,
      onEditItem: (orderId, orderNo, item) => {
        setItemTarget({ orderId, orderNo, item })
        setItemDialogOpen(true)
      },
      onEditItemProductionStatus: (orderId, orderNo, item) => {
        if (!item._id) return
        setProductionTarget({
          kind: "item",
          orderId,
          orderItemId: item._id,
          orderNo,
          itemName: item.itemName,
          current: item.productionStatus,
        })
        setProductionOpen(true)
      },
      onItemAction: (action, orderId, orderNo, item, meta) => {
        const order = list.rows.find((row) => row._id === orderId)

        if (action === "trialView") {
          if (order?.orderTrial?._id) {
            setTrialViewTarget({
              kind: "trialId",
              trialId: order.orderTrial._id,
            })
            setTrialViewOpen(true)
          } else {
            router.push(`/trial/form?orderId=${orderId}`)
          }
          return
        }

        if (action === "trialEdit") {
          if (order?.orderTrial?._id) {
            router.push(`/trial/form?trailId=${order.orderTrial._id}`)
          } else {
            router.push(`/trial/form?orderId=${orderId}`)
          }
          return
        }

        if (action === "stylingForm") {
          setStyleFormTarget({
            orderId,
            orderNo: orderNo ?? order?.orderNo,
            customerId: order?.customerId,
            customerName: customerFullName(
              order?.customerFirstName,
              order?.customerLastName
            ),
            stylistName: order?.stylist?.[0]?.name?.trim() || null,
            orderDate: order?.orderDate,
            item,
          })
          setStyleFormOpen(true)
          return
        }

        if (action === "qcView") {
          const qcId = meta?.qualityCheckId?.trim()
          if (!qcId) return
          setQcTarget({
            orderQualityCheckId: qcId,
            orderId,
            orderNo: orderNo ?? order?.orderNo,
            customerName: customerFullName(
              order?.customerFirstName,
              order?.customerLastName
            ),
            itemName: item.itemName,
            itemNumber: item.itemNumber,
          })
          setQcOpen(true)
          return
        }

        if (action === "qcEdit") {
          const qcId = meta?.qualityCheckId?.trim()
          if (!qcId) return
          router.push(
            qualityCheckFormHref({
              orderId,
              orderItemId: item._id,
              orderItemNumber: item.itemNumber,
              qcItemId: qcId,
            })
          )
          return
        }

        const userId = order?.userId?.trim()
        const catId = resolveProductCatId(item.itemName, item.itemCatId)
        if (!userId || !catId) return

        if (action === "measurementView") {
          setMeasurementTarget({
            userId,
            catId,
            orderId,
            orderNo: orderNo ?? order?.orderNo,
            customerId: order?.customerId,
            customerName: customerFullName(
              order?.customerFirstName,
              order?.customerLastName
            ),
            itemName: item.itemName,
            stylistName: order?.stylist?.[0]?.name?.trim() || null,
          })
          setMeasurementOpen(true)
          return
        }

        if (action === "measurementEdit") {
          openMeasurementEdit(userId, catId)
        }
      },
    }),
    [detailRefreshNonce, list.rows, onDetailHeight, router]
  )

  const columnDefs = useMemo<ColDef<TrackOrderGridRow>[]>(
    () => [
      {
        headerName: "",
        colId: "expand",
        minWidth: 44,
        maxWidth: 48,
        // Don't pin — pinned + full-width splits detail into a ~48px strip.
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<TrackOrderGridRow>) => {
          if (isDetailRow(params.data)) return null
          const id = params.data?._id
          if (!id) return null
          const expanded = expandedOrderId === id
          return (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-md"
              aria-label={expanded ? "Collapse items" : "Expand items"}
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(id)
              }}
            >
              <ChevronRightIcon
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-90"
                )}
              />
            </button>
          )
        },
      },
      {
        headerName: "Prod. status",
        field: "productionStatus",
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<TrackOrderGridRow>) => (
          <ProductionStatusCell {...params} onEdit={openOrderProduction} />
        ),
      },
      {
        headerName: "Order no.",
        field: "orderNo",
        minWidth: 110,
        valueFormatter: (p) =>
          p.value == null || p.value === "" ? "—" : String(p.value),
      },
      {
        headerName: "Customer",
        minWidth: 160,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return customerFullName(
            p.data?.customerFirstName,
            p.data?.customerLastName
          )
        },
      },
      {
        headerName: "Stylist",
        minWidth: 130,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return p.data?.stylist?.[0]?.name?.trim() || "—"
        },
      },
      {
        headerName: "Order date",
        minWidth: 120,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return formatStoreOrderDate(p.data?.orderDate)
        },
      },
      {
        headerName: "Ready date",
        minWidth: 120,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return formatStoreOrderDate(p.data?.readyDate)
        },
      },
      {
        headerName: "Trial date",
        minWidth: 120,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return formatStoreOrderDate(p.data?.trialDate)
        },
      },
      {
        headerName: "Order status",
        field: "orderStatus",
        minWidth: 130,
        cellRenderer: OrderStatusCell,
      },
      {
        headerName: "Remarks",
        field: "remark",
        minWidth: 160,
        flex: 1.2,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return truncateWords(p.data?.remark, 8)
        },
      },
      {
        headerName: "Balance",
        field: "balanceAmount",
        minWidth: 110,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return formatRupees(p.data?.balanceAmount)
        },
      },
      {
        headerName: "Group",
        field: "isGroupCreated",
        minWidth: 90,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return p.data?.isGroupCreated ? "Yes" : "No"
        },
      },
      {
        headerName: "Studio",
        minWidth: 130,
        valueGetter: (p: ValueGetterParams<TrackOrderGridRow>) => {
          if (isDetailRow(p.data)) return ""
          return p.data?.studio?.[0]?.name?.trim() || "—"
        },
      },
      {
        headerName: "",
        colId: "actions",
        minWidth: 90,
        maxWidth: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<TrackOrderGridRow>) => {
          if (isDetailRow(params.data)) return null
          const order = params.data as StoreOrderListRow | undefined
          if (!order?._id) return null
          return (
            <Button
              type="button"
              size="xs"
              variant="outline"
              className="h-7"
              onClick={(e) => {
                e.stopPropagation()
                openOrderAttributes(order)
              }}
            >
              Edit
            </Button>
          )
        },
      },
    ],
    [expandedOrderId, openOrderAttributes, openOrderProduction, toggleExpand]
  )

  const isFullWidthRow = useCallback(
    (params: IsFullWidthRowParams<TrackOrderGridRow>) =>
      isDetailRow(params.rowNode.data),
    []
  )

  const getRowHeight = useCallback(
    (params: RowHeightParams<TrackOrderGridRow>) => {
      if (!isDetailRow(params.data)) return undefined
      return detailHeights[params.data.parentId] ?? 88
    },
    [detailHeights]
  )

  const getRowClass = useCallback(
    (params: RowClassParams<TrackOrderGridRow>) => {
      if (isDetailRow(params.data)) return undefined
      const status = params.data?.productionStatus
      if (status && status.toUpperCase() === "URGENT") return "mpf-row-urgent"
      return undefined
    },
    []
  )

  const hasChips = list.activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-22rem)] min-h-[28rem] max-h-[56rem]"
    : "h-[calc(100vh-18rem)] min-h-[28rem] max-h-[56rem]"

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Track Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Filter store orders, expand items, and update without a full list
          reload. Urgent production rows are highlighted.
        </p>
      </div>

      <TrackOrdersFilterBar
        searchInputValue={list.searchInputValue}
        stylistId={list.stylistId}
        orderStatus={list.orderStatus}
        sortByEnum={list.sortByEnum}
        measurementApprovalStatus={list.measurementApprovalStatus}
        stylists={list.stylists}
        studios={list.studios}
        activeFilters={list.activeFilters}
        advancedFilterCount={list.advancedFilterCount}
        loading={list.loading}
        onSearchSubmit={list.setSearchQuery}
        onStylistChange={list.setStylistId}
        onOrderStatusChange={list.setOrderStatus}
        onSortByChange={list.setSortByEnum}
        onMeasurementApprovalChange={list.setMeasurementApprovalStatus}
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={list.applyMoreFilters}
        onClearMoreFilters={list.clearMoreFilters}
        onClearFilter={list.clearFilter}
        onClearAllFilters={list.clearAllFilters}
        searchParams={list.searchParams}
      />

      {list.error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {list.error.message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex items-center gap-2 border-b px-3 py-2">
          <ListFilterIcon className="text-muted-foreground size-4 shrink-0" />
          <Input
            value={pageQuickFilter}
            onChange={(e) => setPageQuickFilter(e.target.value)}
            placeholder="Filter this page…"
            className="bg-background h-8 max-w-sm"
            aria-label="Filter loaded rows on this page"
            disabled={list.loading}
          />
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Narrows the current page only — not a server search
          </span>
        </div>
        <DataGrid<TrackOrderGridRow>
          rowData={displayRows}
          columnDefs={columnDefs}
          loading={list.loading}
          getRowId={(params) =>
            isDetailRow(params.data)
              ? `detail:${params.data.parentId}:${params.data.refreshNonce ?? 0}`
              : params.data._id
          }
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          persistKey="track-orders"
          className="rounded-none border-0"
          isFullWidthRow={isFullWidthRow}
          fullWidthCellRenderer={OrderItemsDetailPanel}
          getRowHeight={getRowHeight}
          getRowClass={getRowClass}
          embedFullWidthRows={false}
          gridApiRef={gridApiRef}
          context={detailContext}
          onRowClicked={(event) => {
            if (isDetailRow(event.data)) return
            // AG Grid still emits rowClicked for cell button clicks; ignore
            // expand / Edit / prod-status so they don't open the order dialog.
            const target = event.event?.target
            if (target instanceof Element) {
              if (
                target.closest(
                  "button, a, input, select, textarea, label, [role='button']"
                )
              ) {
                return
              }
              const cell = target.closest(".ag-cell")
              const colId = cell?.getAttribute("col-id")
              if (colId === "expand" || colId === "actions") return
            }
            const order = event.data as StoreOrderListRow | undefined
            if (order) openOrderAttributes(order)
          }}
        />
        <DataGridPagination
          page={list.page}
          pageSize={list.pageSize}
          currentPageCount={list.rows.length}
          onPageChange={list.setPage}
          disabled={list.loading}
        />
      </div>

      <OrderAttributesDialog
        open={orderDialogOpen}
        order={orderForDialog}
        onOpenChange={(next) => {
          setOrderDialogOpen(next)
          if (!next) setOrderForDialog(null)
        }}
        onUpdated={(patch) => {
          list.patchOrderRow(patch._id, patch)
        }}
      />

      <ProductionStatusDialog
        open={productionOpen}
        target={productionTarget}
        onOpenChange={(next) => {
          setProductionOpen(next)
          if (!next) setProductionTarget(null)
        }}
        onUpdated={(patch) => {
          if (patch.kind === "order") {
            list.patchOrderRow(patch.orderId, {
              productionStatus: patch.productionStatus,
            })
          } else {
            setDetailRefreshNonce((n) => n + 1)
          }
        }}
      />

      <ItemAttributesDialog
        open={itemDialogOpen}
        target={itemTarget}
        onOpenChange={(next) => {
          setItemDialogOpen(next)
          if (!next) setItemTarget(null)
        }}
        onUpdated={() => {
          setDetailRefreshNonce((n) => n + 1)
        }}
      />

      <StyleFormView
        open={styleFormOpen}
        target={styleFormTarget}
        onOpenChange={(next) => {
          setStyleFormOpen(next)
          if (!next) setStyleFormTarget(null)
        }}
      />

      <MeasurementView
        open={measurementOpen}
        target={measurementTarget}
        onOpenChange={(next) => {
          setMeasurementOpen(next)
          if (!next) setMeasurementTarget(null)
        }}
      />

      <QualityCheckView
        open={qcOpen}
        target={qcTarget}
        onOpenChange={(next) => {
          setQcOpen(next)
          if (!next) setQcTarget(null)
        }}
      />

      <QuickTrialView
        open={trialViewOpen}
        target={trialViewTarget}
        showEditButton
        showUpdate
        showWhatsApp
        onOpenChange={(next) => {
          setTrialViewOpen(next)
          if (!next) setTrialViewTarget(null)
        }}
      />
    </div>
  )
}
