"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { ReceiptVerifyDialog } from "@/components/receipts/receipt-verify-dialog"
import { ReceiptsFilterBar } from "@/components/receipts/receipts-filter-bar"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReceiptsList } from "@/hooks/use-receipts-list"
import type { ReceiptListRow } from "@/lib/apollo/queries/receipts"
import {
  customerFullName,
  formatReceiptDate,
  formatRupees,
} from "@/lib/receipts/format"
import { cn } from "@/lib/utils"

function ImageCell(
  params: ICellRendererParams<ReceiptListRow> & {
    onPreview?: (url: string) => void
  }
) {
  const url = params.data?.screenShotUrl
  if (!url) {
    return <span className="text-muted-foreground text-xs">—</span>
  }
  return (
    <button
      type="button"
      className="cursor-zoom-in"
      onClick={(e) => {
        e.stopPropagation()
        params.onPreview?.(url)
      }}
      aria-label="View payment screenshot"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote payment screenshots */}
      <img
        src={url}
        alt=""
        className="size-10 rounded object-cover"
        loading="lazy"
      />
    </button>
  )
}

function VerifyCell(
  params: ICellRendererParams<ReceiptListRow> & {
    onOpen?: (row: ReceiptListRow) => void
  }
) {
  const row = params.data
  if (!row) return null
  const verified = !!row.isVerified
  return (
    <Button
      type="button"
      size="xs"
      variant={verified ? "secondary" : "default"}
      className={cn(
        "h-7",
        verified &&
          "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400"
      )}
      onClick={(e) => {
        e.stopPropagation()
        params.onOpen?.(row)
      }}
    >
      {verified ? "Verified" : "View"}
    </Button>
  )
}

export function ReceiptsPageClient() {
  const {
    rows,
    totalCount,
    totalAmount,
    loading,
    error,
    page,
    pageSize,
    searchInputValue,
    stylistId,
    stylists,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery,
    setStylistId,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadReceipts,
    patchReceiptRow,
  } = useReceiptsList()

  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<ReceiptListRow | null>(null)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  const openVerify = useCallback((row: ReceiptListRow) => {
    setSelected(row)
    setVerifyOpen(true)
  }, [])

  const openPreview = useCallback((url: string) => {
    setPreviewImages([url])
    setPreviewOpen(true)
  }, [])

  const columnDefs = useMemo(
    () =>
      [
        {
          colId: "paymentDate",
          headerName: "Date of Receipt",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            formatReceiptDate(p.data?.paymentDate?.timestamp),
        },
        {
          colId: "image",
          headerName: "Image",
          width: 90,
          sortable: false,
          filter: false,
          cellRenderer: ImageCell,
          cellRendererParams: { onPreview: openPreview },
        },
        {
          colId: "isVerified",
          headerName: "Verify by account",
          minWidth: 140,
          sortable: false,
          cellRenderer: VerifyCell,
          cellRendererParams: { onOpen: openVerify },
        },
        {
          colId: "amount",
          headerName: "Amount",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.isPaymentAdvance
              ? "—"
              : formatRupees(p.data?.paymentAmount),
        },
        {
          colId: "advanceAmount",
          headerName: "Advance Amount",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.isPaymentAdvance
              ? formatRupees(p.data?.paymentAmount)
              : "—",
        },
        {
          colId: "orderBalance",
          headerName: "Remaining Balance",
          minWidth: 140,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            formatRupees(p.data?.orderBalance),
        },
        {
          field: "paymentMode",
          headerName: "Payment Mode",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.paymentMode || "—",
        },
        {
          field: "customerId",
          headerName: "Cus.No",
          minWidth: 100,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.customerId || "—",
        },
        {
          colId: "name",
          headerName: "Name",
          minWidth: 150,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            customerFullName(
              p.data?.customerFirstName,
              p.data?.customerLastName
            ),
        },
        {
          field: "stylistName",
          headerName: "Stylist",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.stylistName || "—",
        },
        {
          field: "orderNo",
          headerName: "Order No",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.orderNo || "—",
        },
        {
          colId: "orderDate",
          headerName: "Order Date",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            formatReceiptDate(p.data?.orderDate?.timestamp),
        },
        {
          colId: "netAmount",
          headerName: "Net Amount",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            formatRupees(p.data?.netAmount),
        },
        {
          field: "paymentNote",
          headerName: "Remarks",
          minWidth: 160,
          flex: 1,
          tooltipValueGetter: (p) => p.data?.paymentNote || null,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.paymentNote || "—",
        },
        {
          field: "paymentAccountRemark",
          headerName: "Acnt Remarks",
          minWidth: 160,
          tooltipValueGetter: (p) => p.data?.paymentAccountRemark || null,
          valueGetter: (p: ValueGetterParams<ReceiptListRow>) =>
            p.data?.paymentAccountRemark || "—",
        },
      ] as ColDef<ReceiptListRow>[],
    [openPreview, openVerify]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-26rem)]"
    : "h-[calc(100vh-22rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Receipts</h1>
        <p className="text-muted-foreground text-sm">
          Store-order payments — search, filter, verify, and export.
          {totalCount > 0 ? (
            <span className="text-muted-foreground/80">
              {" "}
              · {totalCount.toLocaleString()} total
              {" · "}
              Total amount {formatRupees(totalAmount)}
            </span>
          ) : null}
        </p>
      </div>

      <ReceiptsFilterBar
        searchInputValue={searchInputValue}
        stylistId={stylistId}
        stylists={stylists}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading}
        onSearchSubmit={setSearchQuery}
        onStylistChange={setStylistId}
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={applyMoreFilters}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={clearFilter}
        onClearAllFilters={clearAllFilters}
        searchParams={searchParams}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load receipts. Check your session and try again.
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
          getRowId={(params) => params.data.paymentId}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          persistKey="receipts"
          className="rounded-none border-0"
        />
        <DataGridPagination
          page={page}
          pageSize={pageSize}
          currentPageCount={rows.length}
          totalCount={totalCount}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      <ReceiptVerifyDialog
        open={verifyOpen}
        payment={selected}
        onOpenChange={(next) => {
          setVerifyOpen(next)
          if (!next) setSelected(null)
        }}
        onUpdated={(patch) => {
          if (selected?.paymentId) {
            patchReceiptRow(selected.paymentId, patch)
          }
          reloadReceipts({ preservePatches: true })
        }}
      />

      <ReceiptImagePreview
        open={previewOpen}
        images={previewImages}
        onOpenChange={(next) => {
          setPreviewOpen(next)
          if (!next) setPreviewImages([])
        }}
      />
    </div>
  )
}
