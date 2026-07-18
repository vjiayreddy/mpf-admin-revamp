"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { InvoiceFilterBar } from "@/components/invoice/invoice-filter-bar"
import { InvoiceRowActions } from "@/components/invoice/invoice-row-actions"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useInvoicesList } from "@/hooks/use-invoices-list"
import type { InvoiceListRow } from "@/lib/apollo/queries/invoice"
import {
  customerFullName,
  formatAmount,
  formatInvoiceDate,
  formatRupees,
} from "@/lib/invoice/format"

type CusIdCellParams = ICellRendererParams<InvoiceListRow> & {
  onOpenPreview?: (id: string) => void
}

function CusIdCell(params: CusIdCellParams) {
  const row = params.data
  if (!row) return null
  const cusId = row.customerDetails?.customerId
  if (!cusId) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <button
      type="button"
      className="text-primary cursor-pointer text-sm font-medium hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        params.onOpenPreview?.(row._id)
      }}
    >
      {cusId}
    </button>
  )
}

export function InvoicePageClient() {
  const router = useRouter()
  const {
    rows,
    loading,
    error,
    page,
    pageSize,
    searchInputValue,
    setPage,
    setSearchQuery,
    clearAllFilters,
  } = useInvoicesList()

  const [pageQuickFilter, setPageQuickFilter] = useState("")

  const openPreview = useCallback(
    (id: string) => {
      router.push(`/invoice/preview/${id}`)
    },
    [router]
  )

  const columnDefs = useMemo(
    () =>
      [
        {
          colId: "more",
          headerName: "More",
          width: 72,
          pinned: "left",
          sortable: false,
          filter: false,
          cellRenderer: (p: ICellRendererParams<InvoiceListRow>) =>
            p.data ? <InvoiceRowActions row={p.data} /> : null,
        },
        {
          colId: "name",
          headerName: "Name",
          minWidth: 160,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            customerFullName(
              p.data?.customerDetails?.firstName,
              p.data?.customerDetails?.lastName
            ),
        },
        {
          colId: "cusId",
          headerName: "CusId",
          minWidth: 100,
          cellRenderer: CusIdCell,
          cellRendererParams: { onOpenPreview: openPreview },
        },
        {
          colId: "orderNo",
          headerName: "Order No",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            p.data?.buyerOrderNo != null ? String(p.data.buyerOrderNo) : "—",
        },
        {
          colId: "invoiceDate",
          headerName: "Invoice Dated",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            formatInvoiceDate(p.data?.invoiceDate?.timestamp),
        },
        {
          field: "invoiceId",
          headerName: "Invoice No",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            p.data?.invoiceId || "—",
        },
        {
          colId: "taxableAmount",
          headerName: "Taxable Amount",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            formatRupees(p.data?.beforeTaxTotal),
        },
        {
          colId: "cgstPercent",
          headerName: "CGST %",
          minWidth: 90,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            p.data?.taxDetails?.cgstPercent ?? "—",
        },
        {
          colId: "sgst",
          headerName: "SGST",
          minWidth: 100,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            formatAmount(p.data?.taxDetails?.sgstInput),
        },
        {
          colId: "igst",
          headerName: "IGST",
          minWidth: 100,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            formatAmount(p.data?.taxDetails?.igstInput),
        },
        {
          colId: "grandTotal",
          headerName: "Total Amount",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<InvoiceListRow>) =>
            formatRupees(p.data?.grandTotal),
        },
      ] as ColDef<InvoiceListRow>[],
    [openPreview]
  )

  const hasSearch = !!searchInputValue
  const gridHeight = hasSearch
    ? "h-[calc(100vh-22rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Invoice</h1>
        <p className="text-muted-foreground text-sm">
          Tax invoices for store orders. Search by customer or invoice fields.
        </p>
      </div>

      <InvoiceFilterBar
        searchInputValue={searchInputValue}
        loading={loading}
        onSearchSubmit={setSearchQuery}
        onClearSearch={clearAllFilters}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load invoices. Check your session and try again.
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
            Narrows the current page only
          </span>
        </div>
        <DataGrid
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={(params) => params.data._id}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
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
    </div>
  )
}
