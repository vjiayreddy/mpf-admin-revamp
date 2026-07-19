"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { CustomersFilterBar } from "@/components/customers/customers-filter-bar"
import { QuickCustomerView } from "@/components/customers/quick-customer-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomersList } from "@/hooks/use-customers-list"
import type { CustomerListRow } from "@/lib/apollo/queries/users"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type CustomerNameCellParams = ICellRendererParams<CustomerListRow> & {
  onOpenQuickView?: (userId: string) => void
}

function CustomerNameCell(params: CustomerNameCellParams) {
  const { data, onOpenQuickView } = params
  if (!data) return null
  const name =
    `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
    data.fullName ||
    "—"

  return (
    <button
      type="button"
      className="text-primary cursor-pointer truncate font-medium hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        if (data._id) onOpenQuickView?.(data._id)
      }}
    >
      {name}
    </button>
  )
}

type ViewMeasurementsCellParams = ICellRendererParams<CustomerListRow> & {
  onViewMeasurements?: (userId: string) => void
}

function ViewMeasurementsCell(params: ViewMeasurementsCellParams) {
  const { data, onViewMeasurements } = params
  if (!data?._id) return null

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className="h-7 px-2 text-xs"
      onClick={(e) => {
        e.stopPropagation()
        onViewMeasurements?.(data._id)
      }}
    >
      View
    </Button>
  )
}

export function MeasurementsPageClient() {
  const router = useRouter()
  const {
    rows,
    loading,
    error,
    page,
    pageSize,
    searchType,
    searchInputValue,
    isClient,
    sortByEnum,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchType,
    setIsClient,
    setSortByEnum,
    setSearchQuery,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    patchCustomerRow,
  } = useCustomersList()

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [quickViewUserId, setQuickViewUserId] = useState<string | null>(null)

  const openQuickView = useCallback((userId: string) => {
    setQuickViewUserId(userId)
  }, [])

  const openMeasurementsForm = useCallback(
    (userId: string) => {
      router.push(`/customers/${userId}/measurements`)
    },
    [router]
  )

  const columnDefs = useMemo(
    () =>
      [
        {
          field: "fullName",
          headerName: "Customer",
          minWidth: 180,
          pinned: "left",
          lockPinned: true,
          cellRenderer: CustomerNameCell,
          cellRendererParams: {
            onOpenQuickView: openQuickView,
          },
          valueGetter: (p: ValueGetterParams<CustomerListRow>) =>
            `${p.data?.firstName ?? ""} ${p.data?.lastName ?? ""}`.trim() ||
            p.data?.fullName ||
            "",
          tooltipValueGetter: (p) => {
            const name =
              `${p.data?.firstName ?? ""} ${p.data?.lastName ?? ""}`.trim() ||
              p.data?.fullName ||
              ""
            if (!name && !p.data?.email) return null
            return p.data?.email ? `${name}\n${p.data.email}` : name
          },
        },
        {
          field: "customerSrNo",
          headerName: "Cus. No",
          minWidth: 90,
          maxWidth: 110,
          pinned: "left",
          lockPinned: true,
        },
        {
          colId: "measurements",
          headerName: "Measurements",
          minWidth: 120,
          maxWidth: 140,
          sortable: false,
          filter: false,
          cellRenderer: ViewMeasurementsCell,
          cellRendererParams: {
            onViewMeasurements: openMeasurementsForm,
          },
        },
        {
          colId: "registeredDate",
          headerName: "Registered Date",
          minWidth: 130,
          valueGetter: (p) => formatDate(p.data?.createdAt),
        },
        {
          colId: "stylist",
          headerName: "Stylist",
          minWidth: 140,
          valueGetter: (p) => p.data?.stylist?.[0]?.name ?? "—",
        },
        {
          colId: "lastUpdatedAt",
          headerName: "Last Updated",
          minWidth: 120,
          valueGetter: (p) => formatDate(p.data?.lastUpdatedAt?.timestamp),
        },
      ] as ColDef<CustomerListRow>[],
    [openMeasurementsForm, openQuickView]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          User Measurements
        </h1>
        <p className="text-muted-foreground text-sm">
          Find a customer, then open View to manage their measurements.
          Applied filters show below as chips you can remove.
        </p>
      </div>

      <CustomersFilterBar
        searchType={searchType}
        searchInputValue={searchInputValue}
        isClient={isClient}
        sortByEnum={sortByEnum}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading}
        onSearchTypeChange={setSearchType}
        onIsClientChange={setIsClient}
        onSortByChange={setSortByEnum}
        onSearchSubmit={setSearchQuery}
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={applyMoreFilters}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={clearFilter}
        onClearAllFilters={clearAllFilters}
        showCreateCustomer={false}
        searchParams={searchParams}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load customers. Check your session and try again.
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

      <QuickCustomerView
        open={!!quickViewUserId}
        userId={quickViewUserId}
        onOpenChange={(next) => {
          if (!next) setQuickViewUserId(null)
        }}
        onUpdated={patchCustomerRow}
      />
    </div>
  )
}
