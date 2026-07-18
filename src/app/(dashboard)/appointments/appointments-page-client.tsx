"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { AppointmentEditDialog } from "@/components/appointments/appointment-edit-dialog"
import { AppointmentRowActions } from "@/components/appointments/appointment-row-actions"
import { AppointmentStatusDialog } from "@/components/appointments/appointment-status-dialog"
import { AppointmentsFilterBar } from "@/components/appointments/appointments-filter-bar"
import { QuickAppointmentView } from "@/components/appointments/quick-appointment-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useAppointmentsList } from "@/hooks/use-appointments-list"
import type { AppointmentListRow } from "@/lib/apollo/queries/appointments"

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

function formatTime(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

type RowActionsCellParams = ICellRendererParams<AppointmentListRow> & {
  onView?: (row: AppointmentListRow) => void
  onEditStatus?: (row: AppointmentListRow) => void
  onEditAppointment?: (row: AppointmentListRow) => void
}

function RowActionsCell(params: RowActionsCellParams) {
  const { data, onView, onEditStatus, onEditAppointment } = params
  if (!data) return null
  return (
    <AppointmentRowActions
      row={data}
      onView={() => onView?.(data)}
      onEditStatus={() => onEditStatus?.(data)}
      onEditAppointment={() => onEditAppointment?.(data)}
    />
  )
}

type AppIdCellParams = ICellRendererParams<AppointmentListRow> & {
  onOpenQuickView?: (row: AppointmentListRow) => void
}

function AppIdCell(params: AppIdCellParams) {
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
      {data.appointmentId ?? "—"}
    </button>
  )
}

function StatusCell({
  value,
}: ICellRendererParams<AppointmentListRow, string>) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="bg-muted inline-flex rounded-md px-2 py-0.5 text-xs capitalize">
      {value.replaceAll("_", " ")}
    </span>
  )
}

export function AppointmentsPageClient() {
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
    reloadAppointments,
    patchAppointmentRow,
  } = useAppointmentsList()

  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [selected, setSelected] = useState<AppointmentListRow | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const openQuickView = useCallback((row: AppointmentListRow) => {
    setSelected(row)
    setQuickViewOpen(true)
  }, [])

  const openStatus = useCallback((row: AppointmentListRow) => {
    setSelected(row)
    setStatusOpen(true)
  }, [])

  const openEdit = useCallback((row: AppointmentListRow) => {
    setSelected(row)
    setEditOpen(true)
  }, [])

  const columnDefs = useMemo(
    () =>
      [
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
            onEditStatus: openStatus,
            onEditAppointment: openEdit,
          },
        },
        {
          field: "appointmentId",
          headerName: "App Id",
          minWidth: 100,
          pinned: "left",
          cellRenderer: AppIdCell,
          cellRendererParams: {
            onOpenQuickView: openQuickView,
          },
        },
        {
          field: "appointmentType",
          headerName: "Type",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<AppointmentListRow>) =>
            p.data?.appointmentType || "—",
        },
        {
          colId: "createdDate",
          headerName: "Created Date",
          minWidth: 120,
          valueGetter: (p) => formatDate(p.data?.dateRecorded?.timestamp),
        },
        {
          colId: "name",
          headerName: "Name",
          minWidth: 160,
          valueGetter: (p) =>
            `${p.data?.firstName ?? ""} ${p.data?.lastName ?? ""}`.trim() ||
            "—",
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
          colId: "appointmentDate",
          headerName: "Appointment Date",
          minWidth: 140,
          valueGetter: (p) => formatDate(p.data?.appointmentDate?.timestamp),
        },
        {
          colId: "time",
          headerName: "Time",
          minWidth: 100,
          valueGetter: (p) =>
            formatTime(p.data?.appointmentSelectedTimestamp),
        },
        {
          colId: "studio",
          headerName: "Studio",
          minWidth: 140,
          valueGetter: (p) => p.data?.studio?.[0]?.name ?? "—",
        },
        {
          colId: "stylist",
          headerName: "Handled By",
          minWidth: 140,
          valueGetter: (p) => p.data?.stylist?.[0]?.name ?? "—",
        },
        {
          field: "currentStatus",
          headerName: "Current Status",
          minWidth: 130,
          valueGetter: (p) => p.data?.currentStatus || "Created",
          cellRenderer: StatusCell,
        },
      ] as ColDef<AppointmentListRow>[],
    [openQuickView, openStatus, openEdit]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground text-sm">
          Search appointments, filter by status and stylist, then refine with
          date and studio filters.
          {totalCount > 0 ? (
            <span className="text-muted-foreground/80">
              {" "}
              · {totalCount.toLocaleString()} total
            </span>
          ) : null}
        </p>
      </div>

      <AppointmentsFilterBar
        searchInputValue={searchInputValue}
        status={status}
        stylistId={stylistId}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading}
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
          Failed to load appointments. Check your session and try again.
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

      <QuickAppointmentView
        open={quickViewOpen}
        data={selected}
        onOpenChange={(next) => {
          setQuickViewOpen(next)
          if (!next) setSelected(null)
        }}
      />

      <AppointmentStatusDialog
        open={statusOpen}
        appointment={selected}
        onOpenChange={(next) => {
          setStatusOpen(next)
          if (!next && !editOpen && !quickViewOpen) setSelected(null)
        }}
        onUpdated={(patch) => {
          const id = selected?._id
          if (id && patch) {
            patchAppointmentRow(id, patch)
          }
          // Keep local patch so the grid updates even if list API is briefly stale
          reloadAppointments({ preservePatches: true })
        }}
      />

      <AppointmentEditDialog
        open={editOpen}
        appointment={selected}
        onOpenChange={(next) => {
          setEditOpen(next)
          if (!next && !statusOpen && !quickViewOpen) setSelected(null)
        }}
        onUpdated={(patch) => {
          const id = selected?._id
          if (id && patch) {
            patchAppointmentRow(id, patch)
          }
          reloadAppointments({ preservePatches: true })
        }}
      />
    </div>
  )
}
