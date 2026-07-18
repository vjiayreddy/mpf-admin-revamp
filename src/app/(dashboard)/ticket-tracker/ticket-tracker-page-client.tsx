"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  CellClassParams,
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { EditTicketDialog } from "@/components/tickets/edit-ticket-dialog"
import { QuickTicketView } from "@/components/tickets/quick-ticket-view"
import { TicketsFilterBar } from "@/components/tickets/tickets-filter-bar"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useTicketsList } from "@/hooks/use-tickets-list"
import type {
  TicketDetail,
  TicketListRow,
} from "@/lib/apollo/queries/tickets"
import {
  ticketCategoryTone,
  ticketChipClass,
  ticketPriorityTone,
  ticketStatusTone,
} from "@/lib/tickets/ticket-chip-styles"
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

function formatTime(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function isDueOverdue(row?: TicketListRow | null) {
  if (!row?.dueDate) return false
  if (row.status === "Resolved" || row.status === "Closed") return false
  const due = new Date(row.dueDate)
  if (Number.isNaN(due.getTime())) return false
  return due.getTime() < Date.now()
}

type TicketIdCellParams = ICellRendererParams<TicketListRow> & {
  onOpenQuickView?: (ticketId: string) => void
}

function TicketIdCell(params: TicketIdCellParams) {
  const { data, onOpenQuickView } = params
  if (!data) return null
  return (
    <button
      type="button"
      className="text-primary cursor-pointer font-mono text-sm font-semibold hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        if (data._id) onOpenQuickView?.(data._id)
      }}
    >
      {data.ticketId ?? "—"}
    </button>
  )
}

function ChipCell({
  value,
  toneClass,
}: {
  value?: string | null
  toneClass: string
}) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        toneClass
      )}
    >
      {value}
    </span>
  )
}

export function TicketTrackerPageClient() {
  const {
    rows,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    searchInputValue,
    status,
    priority,
    category,
    activeFilters,
    setPage,
    setSearchQuery,
    setStatus,
    setPriority,
    setCategory,
    clearFilter,
    clearAllFilters,
    reloadTickets,
    patchTicketRow,
  } = useTicketsList()

  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [quickViewId, setQuickViewId] = useState<string | null>(null)
  const [editTicket, setEditTicket] = useState<TicketDetail | null>(null)

  const openQuickView = useCallback((ticketId: string) => {
    setQuickViewId(ticketId)
  }, [])

  const columnDefs = useMemo(
    () =>
      [
        {
          field: "ticketId",
          headerName: "Ticket ID",
          minWidth: 120,
          pinned: "left",
          cellRenderer: TicketIdCell,
          cellRendererParams: {
            onOpenQuickView: openQuickView,
          },
        },
        {
          field: "title",
          headerName: "Title",
          minWidth: 200,
          flex: 1,
          tooltipValueGetter: (p) => p.data?.title || null,
        },
        {
          field: "category",
          headerName: "Category",
          minWidth: 140,
          cellRenderer: (p: ICellRendererParams<TicketListRow>) => (
            <ChipCell
              value={p.value}
              toneClass={ticketChipClass(ticketCategoryTone(p.value))}
            />
          ),
        },
        {
          field: "priority",
          headerName: "Priority",
          minWidth: 110,
          cellRenderer: (p: ICellRendererParams<TicketListRow>) => (
            <ChipCell
              value={p.value}
              toneClass={ticketChipClass(ticketPriorityTone(p.value))}
            />
          ),
        },
        {
          field: "status",
          headerName: "Status",
          minWidth: 140,
          cellRenderer: (p: ICellRendererParams<TicketListRow>) => (
            <ChipCell
              value={p.value}
              toneClass={ticketChipClass(ticketStatusTone(p.value))}
            />
          ),
        },
        {
          colId: "assignedTo",
          headerName: "Assigned To",
          minWidth: 150,
          valueGetter: (p: ValueGetterParams<TicketListRow>) =>
            p.data?.assignedTo?.name || "Unassigned",
          cellClass: (p) =>
            p.value === "Unassigned" ? "text-muted-foreground italic" : "",
        },
        {
          colId: "createdAt",
          headerName: "Created Date",
          minWidth: 130,
          valueGetter: (p) => formatDate(p.data?.createdAt),
          tooltipValueGetter: (p) => {
            const d = formatDate(p.data?.createdAt)
            const t = formatTime(p.data?.createdAt)
            if (d === "—") return null
            return t ? `${d} ${t}` : d
          },
        },
        {
          colId: "dueDate",
          headerName: "Due Date",
          minWidth: 130,
          valueGetter: (p) => formatDate(p.data?.dueDate),
          cellClassRules: {
            "mpf-cell-overdue": (params: CellClassParams<TicketListRow>) =>
              isDueOverdue(params.data),
          },
          tooltipValueGetter: (p) => {
            const d = formatDate(p.data?.dueDate)
            if (d === "—") return null
            const t = formatTime(p.data?.dueDate)
            const label = t ? `${d} ${t}` : d
            return isDueOverdue(p.data) ? `${label} (overdue)` : label
          },
        },
      ] as ColDef<TicketListRow>[],
    [openQuickView]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Ticket Tracker
        </h1>
        <p className="text-muted-foreground text-sm">
          Search and filter tickets, then open a ticket for details or edit
          priority and due date.
          {totalCount > 0 ? (
            <span className="text-muted-foreground/80">
              {" "}
              · {totalCount.toLocaleString()} total
            </span>
          ) : null}
        </p>
      </div>

      <TicketsFilterBar
        searchInputValue={searchInputValue}
        status={status}
        priority={priority}
        category={category}
        activeFilters={activeFilters}
        loading={loading}
        onSearchSubmit={setSearchQuery}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onCategoryChange={setCategory}
        onClearFilter={clearFilter}
        onClearAllFilters={clearAllFilters}
        onTicketCreated={() => reloadTickets()}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load tickets. Check your session and try again.
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
          totalCount={totalCount}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      <QuickTicketView
        open={!!quickViewId}
        ticketId={quickViewId}
        onOpenChange={(next) => {
          if (!next) setQuickViewId(null)
        }}
        onEdit={(ticket) => {
          setEditTicket(ticket)
        }}
      />

      <EditTicketDialog
        open={!!editTicket}
        ticket={editTicket}
        onOpenChange={(next) => {
          if (!next) setEditTicket(null)
        }}
        onUpdated={(patch) => {
          if (editTicket?._id) {
            patchTicketRow(editTicket._id, patch)
          }
          reloadTickets({ preservePatches: true })
        }}
      />
    </div>
  )
}
