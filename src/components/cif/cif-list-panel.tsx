"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { CifFilterBar } from "@/components/cif/cif-filter-bar"
import { CifRowActions } from "@/components/cif/cif-row-actions"
import { QuickCifView } from "@/components/cif/quick-cif-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useCifList } from "@/hooks/use-cif-list"
import {
  crossSellLabels,
  studioName,
  stylistName,
  type CifListRow,
} from "@/lib/apollo/queries/cif"
import { cn } from "@/lib/utils"

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

function isPastDate(value?: string | null) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

type RowActionsCellParams = ICellRendererParams<CifListRow> & {
  onView?: (row: CifListRow) => void
}

function RowActionsCell(params: RowActionsCellParams) {
  const { data, onView } = params
  if (!data) return null
  return <CifRowActions row={data} onView={() => onView?.(data)} />
}

type FormNoCellParams = ICellRendererParams<CifListRow> & {
  onOpenQuickView?: (row: CifListRow) => void
}

function FormNoCell(params: FormNoCellParams) {
  const { data, onOpenQuickView } = params
  if (!data) return null
  return (
    <button
      type="button"
      className="text-primary cursor-pointer truncate font-medium hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        onOpenQuickView?.(data)
      }}
    >
      {data.cifSerialNumber ?? "—"}
    </button>
  )
}

function StatusCell({
  value,
}: ICellRendererParams<CifListRow, string>) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="bg-muted inline-flex rounded-md px-2 py-0.5 text-xs capitalize">
      {value.replaceAll("_", " ").toLowerCase()}
    </span>
  )
}

function FollowUpDateCell(
  params: ICellRendererParams<CifListRow, string>
) {
  const timestamp = params.data?.followUpDate?.timestamp
  const label = formatDate(timestamp)
  return (
    <span className={cn(isPastDate(timestamp) && "font-medium text-red-600")}>
      {label}
    </span>
  )
}

export type CifListPanelProps = {
  lockedUserId?: string
  showPageChrome?: boolean
  hideCustomerColumns?: boolean
}

export function CifListPanel({
  lockedUserId,
  showPageChrome = true,
  hideCustomerColumns = false,
}: CifListPanelProps) {
  const {
    rows,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    searchInputValue,
    status,
    stylistId,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery,
    setStatus,
    setStylistId,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
  } = useCifList(lockedUserId ? { lockedUserId } : undefined)

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [selected, setSelected] = useState<CifListRow | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const openQuickView = useCallback((row: CifListRow) => {
    setSelected(row)
    setQuickViewOpen(true)
  }, [])

  const addHref = lockedUserId
    ? `/cif/form?userId=${lockedUserId}`
    : "/cif/form"

  const columnDefs = useMemo(() => {
    const cols: ColDef<CifListRow>[] = [
      {
        colId: "actions",
        headerName: "More",
        minWidth: 70,
        maxWidth: 80,
        pinned: "left",
        sortable: false,
        filter: false,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          onView: openQuickView,
        },
      },
      {
        colId: "leadId",
        headerName: "Lead Id",
        minWidth: 100,
        valueGetter: (p: ValueGetterParams<CifListRow>) =>
          p.data?.leads?.[0]?.leadId ?? "—",
      },
      {
        colId: "cifSerialNumber",
        headerName: "Form No",
        minWidth: 110,
        pinned: "left",
        cellRenderer: FormNoCell,
        cellRendererParams: {
          onOpenQuickView: openQuickView,
        },
      },
      {
        field: "customerInfoStatus",
        headerName: "Status",
        minWidth: 130,
        cellRenderer: StatusCell,
      },
    ]

    if (!hideCustomerColumns) {
      cols.push(
        {
          colId: "name",
          headerName: "Name",
          minWidth: 160,
          valueGetter: (p) =>
            `${p.data?.firstName ?? ""} ${p.data?.lastName ?? ""}`.trim() ||
            "—",
        },
        {
          colId: "gender",
          headerName: "Gender",
          minWidth: 100,
          valueGetter: (p) => p.data?.gender || "—",
        },
        {
          colId: "phone",
          headerName: "Mobile",
          minWidth: 150,
          valueGetter: (p) => {
            if (!p.data?.phone) return "—"
            return `+${p.data.countryCode ?? ""} ${p.data.phone}`.trim()
          },
        }
      )
    }

    cols.push(
      {
        colId: "createdDate",
        headerName: "Created Date",
        minWidth: 120,
        valueGetter: (p) => formatDate(p.data?.createdDate?.timestamp),
      },
      {
        colId: "stylist",
        headerName: "Stylist",
        minWidth: 140,
        valueGetter: (p) => (p.data ? stylistName(p.data) : "—"),
      },
      {
        colId: "followUpDate",
        headerName: "Follow Up Date",
        minWidth: 130,
        cellRenderer: FollowUpDateCell,
      },
      {
        colId: "eventDate",
        headerName: "Event Date",
        minWidth: 120,
        valueGetter: (p) => formatDate(p.data?.eventDate?.timestamp),
      },
      {
        colId: "crossSell",
        headerName: "Cross Selling",
        minWidth: 160,
        valueGetter: (p) => (p.data ? crossSellLabels(p.data) : "—"),
      },
      {
        colId: "lookBookShared",
        headerName: "LookBook Shared",
        minWidth: 130,
        valueGetter: (p) => (p.data?.isLookBookShared ? "Yes" : "No"),
      },
      {
        colId: "studio",
        headerName: "Studio",
        minWidth: 140,
        valueGetter: (p) => (p.data ? studioName(p.data) : "—"),
      },
      {
        colId: "rating",
        headerName: "CIF Rating",
        minWidth: 110,
        valueGetter: (p) => p.data?.rating ?? "—",
      },
      {
        colId: "customerSerialNo",
        headerName: "Cust Id",
        minWidth: 110,
        valueGetter: (p) => p.data?.customerSerialNo ?? "—",
      }
    )

    return cols
  }, [openQuickView, hideCustomerColumns])

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      {showPageChrome ? (
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Customer Informations
          </h1>
          <p className="text-muted-foreground text-sm">
            Search CIF records, filter by status and stylist, then refine with
            date and studio filters.
            {totalCount > 0 ? (
              <span className="text-muted-foreground/80">
                {" "}
                · {totalCount.toLocaleString()} total
              </span>
            ) : null}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Customer Informations
          </h2>
          {totalCount > 0 ? (
            <p className="text-muted-foreground text-sm">
              {totalCount.toLocaleString()} total
            </p>
          ) : null}
        </div>
      )}

      <CifFilterBar
        searchInputValue={searchInputValue}
        status={status}
        stylistId={stylistId}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading}
        addHref={addHref}
        onSearchSubmit={setSearchQuery}
        onStatusChange={setStatus}
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
          Failed to load CIF records. Check your session and try again.
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

      <QuickCifView
        open={quickViewOpen}
        data={selected}
        onOpenChange={(next) => {
          setQuickViewOpen(next)
          if (!next) setSelected(null)
        }}
      />
    </div>
  )
}
