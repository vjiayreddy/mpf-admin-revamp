"use client"

import { useCallback, useMemo, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ListFilterIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { OrderListPaymentsSheet } from "@/components/orders/order-list-payments-sheet"
import { buildOrdersColumnDefs } from "@/components/orders/orders-columns"
import {
  OrdersFilterBar,
  countAdvancedOrdersFiltersFromKeys,
} from "@/components/orders/orders-filter-bar"
import { QuickOrderView } from "@/components/orders/quick-order-view"
import { StyleDesignHistoryDialog } from "@/components/orders/style-design-history-dialog"
import {
  QuickTrialView,
  type QuickTrialViewTarget,
} from "@/components/trial/quick-trial-view"
import { Input } from "@/components/ui/input"
import {
  MORE_ORDERS_FILTER_KEYS,
  ORDERS_PARAMS,
} from "@/config/orders-filters"
import { useOrdersList } from "@/hooks/use-orders-list"
import {
  GENERATE_INVOICE_FROM_STORE_ORDER,
  type GenerateInvoiceFromStoreOrderData,
  type GenerateInvoiceFromStoreOrderVars,
} from "@/lib/apollo/queries/invoice"
import type { OrdersListRow } from "@/lib/apollo/queries/store-orders"
import { notify } from "@/lib/notify"

export function OrdersListPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const list = useOrdersList()
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [viewOrder, setViewOrder] = useState<OrdersListRow | null>(null)
  const [trialViewOpen, setTrialViewOpen] = useState(false)
  const [trialViewTarget, setTrialViewTarget] =
    useState<QuickTrialViewTarget | null>(null)
  const [paymentsOrderId, setPaymentsOrderId] = useState<string | null>(null)
  const [styleHistoryOrder, setStyleHistoryOrder] =
    useState<OrdersListRow | null>(null)

  const [generateInvoice, { loading: invoiceBusy }] = useMutation<
    GenerateInvoiceFromStoreOrderData,
    GenerateInvoiceFromStoreOrderVars
  >(GENERATE_INVOICE_FROM_STORE_ORDER)

  const onView = useCallback((row: OrdersListRow) => {
    setViewOrder(row)
  }, [])

  const onEdit = useCallback(
    (row: OrdersListRow) => {
      const id = row._id?.trim()
      if (!id) return
      router.push(`/orders/form?orderId=${encodeURIComponent(id)}`)
    },
    [router]
  )

  const onPrint = useCallback(
    (row: OrdersListRow) => {
      const id = row._id?.trim()
      if (!id) return
      router.push(`/orders/print/${encodeURIComponent(id)}`)
    },
    [router]
  )

  const onCreateTrial = useCallback(
    (row: OrdersListRow) => {
      const orderId = row._id?.trim()
      if (!orderId) return
      router.push(
        `/trial/form?orderId=${encodeURIComponent(orderId)}&returnTo=orders`
      )
    },
    [router]
  )

  const onViewTrial = useCallback((row: OrdersListRow) => {
    const trialId = row.orderTrial?._id?.trim()
    if (!trialId) return
    setTrialViewTarget({ kind: "trialId", trialId })
    setTrialViewOpen(true)
  }, [])

  const onEditTrial = useCallback(
    (row: OrdersListRow) => {
      const trialId = row.orderTrial?._id?.trim()
      if (!trialId) return
      router.push(
        `/trial/form?trailId=${encodeURIComponent(trialId)}&returnTo=orders`
      )
    },
    [router]
  )

  const onInvoice = useCallback(
    async (row: OrdersListRow) => {
      const existing = row.invoices?.find((inv) => inv?._id)?._id
      if (existing) {
        router.push(`/invoice/preview/${encodeURIComponent(existing)}`)
        return
      }
      const orderId = row._id?.trim()
      if (!orderId) return
      try {
        const result = await generateInvoice({ variables: { orderId } })
        const invoice = result.data?.generateInvoiceFromStoreOrder
        if (!invoice?._id) {
          notify.error("Invoice generate returned no id")
          return
        }
        notify.success(
          invoice.invoiceNo != null
            ? `Invoice ${invoice.invoiceNo} created`
            : "Invoice created"
        )
        router.push(
          `/invoice/form?invoiceId=${encodeURIComponent(invoice._id)}`
        )
      } catch (err) {
        notify.fromError(err, "Failed to generate invoice")
      }
    },
    [generateInvoice, router]
  )

  const onPayments = useCallback((row: OrdersListRow) => {
    const id = row._id?.trim()
    if (!id) return
    setPaymentsOrderId(id)
  }, [])

  const onStyleHistory = useCallback((row: OrdersListRow) => {
    setStyleHistoryOrder(row)
  }, [])

  const columnDefs = useMemo(
    () =>
      buildOrdersColumnDefs({
        onView,
        onEdit,
        onPrint,
        onCreateTrial,
        onViewTrial,
        onEditTrial,
        onInvoice,
        onPayments,
        onStyleHistory,
        invoiceBusy,
      }),
    [
      onView,
      onEdit,
      onPrint,
      onCreateTrial,
      onViewTrial,
      onEditTrial,
      onInvoice,
      onPayments,
      onStyleHistory,
      invoiceBusy,
    ]
  )

  const paramsSnapshot = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedOrdersFiltersFromKeys(paramsSnapshot),
    [paramsSnapshot]
  )

  const clearMoreFilters = useCallback(() => {
    list.setParams(
      Object.fromEntries(MORE_ORDERS_FILTER_KEYS.map((k) => [k, null]))
    )
  }, [list.setParams])

  const hasChips = list.activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Search store orders, then refine with filters. Applied filters show
          below as chips you can remove.
        </p>
      </div>

      <OrdersFilterBar
        searchInputValue={list.searchTerm}
        orderStatus={list.orderStatus}
        stylistId={list.stylistId}
        studioId={list.studioId}
        stylists={list.stylists}
        stylistsLoading={list.stylistsLoading}
        studios={list.studios}
        studiosLoading={list.studiosLoading}
        activeFilters={list.activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={list.loading}
        searchParams={paramsSnapshot}
        onSearchSubmit={(value) =>
          list.setParams({
            [ORDERS_PARAMS.searchTerm]: value.trim() || null,
          })
        }
        onOrderStatusChange={(value) =>
          list.setParams({
            [ORDERS_PARAMS.orderStatus]: value || null,
          })
        }
        onStylistChange={(value) =>
          list.setParams({
            [ORDERS_PARAMS.stylistId]: value || null,
          })
        }
        onStudioChange={(value) =>
          list.setParams({
            [ORDERS_PARAMS.studioId]: value || null,
          })
        }
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={(updates) => list.setParams(updates)}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={(updates) => list.setParams(updates)}
        onClearAllFilters={list.clearAllFilters}
      />

      {list.error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load orders. Check your session and try again.
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
        <DataGrid<OrdersListRow>
          rowData={list.rows}
          columnDefs={columnDefs}
          getRowId={(params) => params.data._id}
          loading={list.loading}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          persistKey="orders"
          className="rounded-none border-0"
        />
        <DataGridPagination
          page={list.currentPage}
          pageSize={list.pageSize}
          currentPageCount={list.rows.length}
          onPageChange={list.goToPage}
          disabled={list.loading}
        />
      </div>

      <QuickOrderView
        open={Boolean(viewOrder)}
        onOpenChange={(next) => {
          if (!next) setViewOrder(null)
        }}
        order={viewOrder}
      />

      <QuickTrialView
        open={trialViewOpen}
        onOpenChange={(next) => {
          setTrialViewOpen(next)
          if (!next) setTrialViewTarget(null)
        }}
        target={trialViewTarget}
        onEdit={(trialId) => {
          router.push(
            `/trial/form?trailId=${encodeURIComponent(trialId)}&returnTo=orders`
          )
        }}
        onUpdated={() => {
          list.refetch()
        }}
      />

      <OrderListPaymentsSheet
        open={Boolean(paymentsOrderId)}
        onOpenChange={(next) => {
          if (!next) setPaymentsOrderId(null)
        }}
        orderId={paymentsOrderId}
        onSaved={() => {
          list.refetch()
        }}
      />

      <StyleDesignHistoryDialog
        open={Boolean(styleHistoryOrder)}
        onOpenChange={(next) => {
          if (!next) setStyleHistoryOrder(null)
        }}
        orderId={styleHistoryOrder?._id ?? null}
        orderNo={styleHistoryOrder?.orderNo}
      />
    </div>
  )
}
