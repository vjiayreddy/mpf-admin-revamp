"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { QuickOnlineOrderView } from "@/components/online-orders/quick-online-order-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOnlineOrdersList } from "@/hooks/use-online-orders-list"
import type { OnlineOrderListRow } from "@/lib/apollo/queries/online-orders"
import {
  formatOnlineOrderDate,
  formatRupees,
} from "@/lib/online-orders/format"
import { cn } from "@/lib/utils"

function ViewCell(
  params: ICellRendererParams<OnlineOrderListRow> & {
    onOpen?: (row: OnlineOrderListRow) => void
  }
) {
  const row = params.data
  if (!row) return null
  return (
    <Button
      type="button"
      size="xs"
      variant="secondary"
      className="h-7"
      onClick={(e) => {
        e.stopPropagation()
        params.onOpen?.(row)
      }}
    >
      View
    </Button>
  )
}

function PaidCell(params: ICellRendererParams<OnlineOrderListRow>) {
  const paid = !!params.data?.isPaid
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        paid
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
      )}
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  )
}

export function OnlineOrdersPageClient() {
  const { rows, loading, error, page, pageSize, setPage } =
    useOnlineOrdersList()

  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [selected, setSelected] = useState<OnlineOrderListRow | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  const openView = useCallback((row: OnlineOrderListRow) => {
    setSelected(row)
    setViewOpen(true)
  }, [])

  const columnDefs = useMemo(
    () =>
      [
        {
          field: "_id",
          headerName: "ID",
          minWidth: 110,
          tooltipValueGetter: (p) => p.data?._id || null,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            p.data?._id || "—",
        },
        {
          field: "orderId",
          headerName: "Order No",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            p.data?.orderId || "—",
        },
        {
          field: "firstName",
          headerName: "First name",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            p.data?.firstName || "—",
        },
        {
          field: "lastName",
          headerName: "Last name",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            p.data?.lastName || "—",
        },
        {
          colId: "actions",
          headerName: "Actions",
          width: 90,
          sortable: false,
          filter: false,
          cellRenderer: ViewCell,
          cellRendererParams: { onOpen: openView },
        },
        {
          field: "phone",
          headerName: "Mobile",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            p.data?.phone || "—",
        },
        {
          field: "razorPayId",
          headerName: "RazorPay ID",
          minWidth: 160,
          tooltipValueGetter: (p) => p.data?.razorPayId || null,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            p.data?.razorPayId || "—",
        },
        {
          colId: "paidDate",
          headerName: "Paid date",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            formatOnlineOrderDate(p.data?.paidDateTime?.timestamp),
        },
        {
          colId: "orderDate",
          headerName: "Ordered date",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            formatOnlineOrderDate(p.data?.orderDateTime?.timestamp),
        },
        {
          colId: "orderTotal",
          headerName: "Order total",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<OnlineOrderListRow>) =>
            formatRupees(p.data?.orderTotal),
        },
        {
          colId: "isPaid",
          headerName: "Paid",
          width: 100,
          sortable: false,
          cellRenderer: PaidCell,
        },
      ] as ColDef<OnlineOrderListRow>[],
    [openView]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Online Orders</h1>
        <p className="text-muted-foreground text-sm">
          Website / e-commerce product carts. Use page filter to narrow the
          current page — the API has no server search.
        </p>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load online orders. Check your session and try again.
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
            disabled={loading}
          />
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Narrows the current page only — not a server search
          </span>
        </div>
        <DataGrid
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={(params) => params.data._id}
          quickFilterText={pageQuickFilter}
          heightClassName="h-[calc(100vh-18rem)]"
          persistKey="online-orders"
          className="rounded-none border-0"
        />
        <DataGridPagination
          page={page}
          pageSize={pageSize}
          currentPageCount={rows.length}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      <QuickOnlineOrderView
        open={viewOpen}
        order={selected}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}
