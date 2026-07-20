"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import type {
  CellClassParams,
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { ClientConnectFilterBar } from "@/components/client-connect/client-connect-filter-bar"
import { ClientConnectRowActions } from "@/components/client-connect/client-connect-row-actions"
import { CcDetailsSheet } from "@/components/client-connect/cc-details-sheet"
import { QuickCustomerView } from "@/components/customers/quick-customer-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useClientConnectList } from "@/hooks/use-client-connect-list"
import type { ClientConnectListRow } from "@/lib/apollo/queries/client-connect"

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

function isCcOverdue(iso?: string | null) {
  if (!iso) return false
  const due = new Date(iso)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function displayName(row?: ClientConnectListRow | null) {
  if (!row) return "—"
  return (
    `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() ||
    row.fullName ||
    "—"
  )
}

type NameCellParams = ICellRendererParams<ClientConnectListRow> & {
  onOpenQuickView?: (userId: string) => void
}

function NameCell(params: NameCellParams) {
  const { data, onOpenQuickView } = params
  if (!data) return null
  const name = displayName(data)
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

function StatusCell({
  value,
}: ICellRendererParams<ClientConnectListRow, string>) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="bg-muted inline-flex rounded-md px-2 py-0.5 text-xs capitalize">
      {value}
    </span>
  )
}

function CusNoCell(params: ICellRendererParams<ClientConnectListRow>) {
  const { data } = params
  if (!data?._id) return params.value ?? "—"
  return (
    <Link
      href={`/customers/${data._id}`}
      className="text-primary font-medium hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {data.customerSrNo ?? "Profile"}
    </Link>
  )
}

type ActionsCellParams = ICellRendererParams<ClientConnectListRow> & {
  onOpenDiary?: (userId: string) => void
  onOpenQuickView?: (userId: string) => void
}

function ActionsCell(params: ActionsCellParams) {
  const row = params.data
  if (!row) return null
  return (
    <ClientConnectRowActions
      row={row}
      onOpenDiary={() => params.onOpenDiary?.(row._id)}
      onOpenQuickView={() => params.onOpenQuickView?.(row._id)}
    />
  )
}

export function ClientConnectPageClient() {
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
    ccType,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchType,
    setIsClient,
    setSortByEnum,
    setCcType,
    setSearchQuery,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reload,
    patchRow,
  } = useClientConnectList()

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [createdNotice, setCreatedNotice] = useState<string | null>(null)
  const [quickViewUserId, setQuickViewUserId] = useState<string | null>(null)
  const [diaryUserId, setDiaryUserId] = useState<string | null>(null)

  const openQuickView = useCallback((userId: string) => {
    setQuickViewUserId(userId)
  }, [])

  const openDiary = useCallback((userId: string) => {
    setDiaryUserId(userId)
  }, [])

  const columnDefs = useMemo(
    () =>
      [
        {
          field: "fullName",
          headerName: "Customer",
          minWidth: 180,
          pinned: "left",
          lockPinned: true,
          cellRenderer: NameCell,
          cellRendererParams: { onOpenQuickView: openQuickView },
          valueGetter: (p: ValueGetterParams<ClientConnectListRow>) =>
            displayName(p.data),
        },
        {
          field: "customerSrNo",
          headerName: "Cus. No",
          minWidth: 90,
          maxWidth: 110,
          pinned: "left",
          lockPinned: true,
          cellRenderer: CusNoCell,
        },
        {
          colId: "phone",
          headerName: "Phone",
          minWidth: 150,
          valueGetter: (p) => {
            if (!p.data?.phone) return "—"
            return `+${p.data.countryCode ?? ""} ${p.data.phone}`.trim()
          },
        },
        {
          colId: "stylist",
          headerName: "Stylist",
          minWidth: 140,
          valueGetter: (p) => p.data?.stylist?.name ?? "—",
        },
        {
          colId: "studios",
          headerName: "Studio",
          minWidth: 140,
          valueGetter: (p) =>
            p.data?.studios
              ?.map((s) => s?.name)
              .filter(Boolean)
              .join(", ") || "—",
        },
        {
          field: "userStatus",
          headerName: "Status",
          minWidth: 110,
          cellRenderer: StatusCell,
        },
        {
          colId: "registeredDate",
          headerName: "Registered",
          minWidth: 120,
          valueGetter: (p) => formatDate(p.data?.createdAt),
        },
        {
          colId: "ccDueDate",
          headerName: "CC Due",
          minWidth: 120,
          valueGetter: (p) => formatDate(p.data?.ccDueDate?.timestamp),
          cellClassRules: {
            "mpf-cell-overdue": (
              params: CellClassParams<ClientConnectListRow>
            ) => isCcOverdue(params.data?.ccDueDate?.timestamp),
          },
        },
        {
          colId: "lastUpdatedAt",
          headerName: "Last Updated",
          minWidth: 120,
          valueGetter: (p) => formatDate(p.data?.lastUpdatedAt?.timestamp),
        },
        {
          colId: "campaigns",
          headerName: "Campaigns",
          minWidth: 140,
          valueGetter: (p) => {
            const camps = p.data?.clientConnect?.campaigns
            if (!camps?.length) return "—"
            return camps
              .map((c) => c.ccType?.replace(/_/g, " "))
              .filter(Boolean)
              .join(", ")
          },
        },
        {
          colId: "actions",
          headerName: "",
          maxWidth: 72,
          minWidth: 64,
          sortable: false,
          filter: false,
          pinned: "right",
          cellRenderer: ActionsCell,
          cellRendererParams: {
            onOpenDiary: openDiary,
            onOpenQuickView: openQuickView,
          },
        },
      ] as ColDef<ClientConnectListRow>[],
    [openQuickView, openDiary]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Client Connect
        </h1>
        <p className="text-muted-foreground text-sm">
          Follow up campaigns by connect type. Open a diary to WhatsApp, call,
          or log notes.
        </p>
      </div>

      <ClientConnectFilterBar
        searchType={searchType}
        searchInputValue={searchInputValue}
        isClient={isClient}
        sortByEnum={sortByEnum}
        ccType={ccType}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading}
        onSearchTypeChange={setSearchType}
        onIsClientChange={setIsClient}
        onSortByChange={setSortByEnum}
        onCcTypeChange={setCcType}
        onSearchSubmit={setSearchQuery}
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={applyMoreFilters}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={clearFilter}
        onClearAllFilters={clearAllFilters}
        onCustomerCreated={(userId) => {
          setCreatedNotice(`Customer created (${userId}).`)
          reload()
        }}
        searchParams={searchParams}
      />

      {createdNotice ? (
        <p
          className="text-sm text-emerald-700 dark:text-emerald-400"
          role="status"
        >
          {createdNotice}
        </p>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load Client Connect. Check your session and try again.
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
          persistKey="client-connect"
          className="rounded-none border-0"
          onRowDoubleClicked={(e) => {
            if (e.data?._id) openDiary(e.data._id)
          }}
        />
        <DataGridPagination
          page={page}
          pageSize={pageSize}
          currentPageCount={rows.length}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      {!loading && rows.length === 0 && !error ? (
        <p className="text-muted-foreground text-sm">
          No clients for this connect type and filter set.
        </p>
      ) : null}

      <QuickCustomerView
        open={!!quickViewUserId}
        userId={quickViewUserId}
        onOpenChange={(next) => {
          if (!next) setQuickViewUserId(null)
        }}
        onUpdated={(userId, patch) => {
          patchRow(userId, patch as Partial<ClientConnectListRow>)
        }}
      />

      <CcDetailsSheet
        open={!!diaryUserId}
        userId={diaryUserId}
        onOpenChange={(next) => {
          if (!next) setDiaryUserId(null)
        }}
      />
    </div>
  )
}
