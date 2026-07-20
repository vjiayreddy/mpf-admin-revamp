"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  CellClassParams,
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"
import { useLazyQuery } from "@apollo/client/react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"

import { BookLeadAppointmentDialog } from "@/components/leads/book-lead-appointment-dialog"
import { LeadRowActions } from "@/components/leads/lead-row-actions"
import { LeadStatusDialog } from "@/components/leads/lead-status-dialog"
import { LeadsFilterBar } from "@/components/leads/leads-filter-bar"
import { QuickLeadView } from "@/components/leads/quick-lead-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useLeadsList } from "@/hooks/use-leads-list"
import {
  GET_ALL_LEADS,
  type GetAllLeadsData,
  type GetAllLeadsVars,
  type LeadListRow,
} from "@/lib/apollo/queries/leads"
import {
  customerFullName,
  formatLeadDate,
  formatLeadDateTime,
  formatPhone,
  isFollowUpOverdue,
  latestStatus,
} from "@/lib/leads/format"

type LeadIdCellParams = ICellRendererParams<LeadListRow> & {
  onOpen?: (row: LeadListRow) => void
}

function LeadIdCell(params: LeadIdCellParams) {
  const row = params.data
  if (!row) return null
  return (
    <button
      type="button"
      className="text-primary cursor-pointer font-mono text-sm font-semibold hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        params.onOpen?.(row)
      }}
    >
      {row.leadId ?? "—"}
    </button>
  )
}

export function LeadsPageClient() {
  const router = useRouter()
  const {
    rows,
    loading,
    error,
    page,
    pageSize,
    searchInputValue,
    status,
    creditToSalesTeamIds,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery,
    setStatus,
    setCreditToSalesTeamIds,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadLeads,
    buildExportVars,
  } = useLeadsList()

  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<LeadListRow | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [fetchExport] = useLazyQuery<GetAllLeadsData, GetAllLeadsVars>(
    GET_ALL_LEADS,
    { fetchPolicy: "network-only" }
  )

  const openView = useCallback((row: LeadListRow) => {
    setSelected(row)
    setViewOpen(true)
  }, [])

  const openStatus = useCallback((row: LeadListRow) => {
    setSelected(row)
    setStatusOpen(true)
  }, [])

  const openBook = useCallback((row: LeadListRow) => {
    setSelected(row)
    setBookOpen(true)
  }, [])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const result = await fetchExport({ variables: buildExportVars() })
      const leads = result.data?.getAllLeads?.leads ?? []
      const sheetRows = leads.map((lead) => ({
        "Lead Id": lead.leadId ?? "",
        Name: customerFullName(lead.firstName, lead.lastName),
        Phone: formatPhone(lead.countryCode, lead.phone),
        Email: lead.email ?? "",
        Status: latestStatus(lead.status)?.name ?? "",
        Source: lead.source?.[0]?.name ?? "",
        Studio: lead.studio?.[0]?.name ?? "",
        "Credit To": lead.creditedSalesTeam?.[0]?.name ?? "",
        "Lead Date": formatLeadDate(lead.leadDate?.timestamp),
        "Follow Up": formatLeadDate(lead.currentStatusDate?.timestamp),
        Rating: lead.rating ?? "",
        Remarks: lead.remarks ?? "",
      }))
      const ws = XLSX.utils.json_to_sheet(sheetRows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Leads")
      XLSX.writeFile(wb, `leads-export-${Date.now()}.xlsx`)
    } finally {
      setExporting(false)
    }
  }, [buildExportVars, fetchExport])

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
          cellRenderer: (p: ICellRendererParams<LeadListRow>) =>
            p.data ? (
              <LeadRowActions
                row={p.data}
                onView={() => openView(p.data!)}
                onStatus={() => openStatus(p.data!)}
                onBookAppointment={() => openBook(p.data!)}
              />
            ) : null,
        },
        {
          colId: "leadId",
          headerName: "Lead Id",
          minWidth: 110,
          pinned: "left",
          cellRenderer: LeadIdCell,
          cellRendererParams: { onOpen: openView },
        },
        {
          colId: "orderId",
          headerName: "Order Id",
          minWidth: 100,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.orders?.[0]?.orderNo ?? "—",
        },
        {
          colId: "linkedOrders",
          headerName: "Linked Orders",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.linkedOrders
              ?.map((o) => o.orderSerialNo)
              .filter(Boolean)
              .join(", ") || "—",
        },
        {
          colId: "cifId",
          headerName: "CIF Id",
          minWidth: 100,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.customerInformationForms?.[0]?.cifSerialNumber ?? "—",
        },
        {
          colId: "leadDate",
          headerName: "Date",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatLeadDate(p.data?.leadDate?.timestamp),
        },
        {
          colId: "leadDateTime",
          headerName: "Registered Time",
          minWidth: 150,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatLeadDateTime(p.data?.leadDate?.timestamp),
        },
        {
          colId: "name",
          headerName: "Name",
          minWidth: 150,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            customerFullName(p.data?.firstName, p.data?.lastName),
        },
        {
          colId: "phone",
          headerName: "Phone",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatPhone(p.data?.countryCode, p.data?.phone),
        },
        {
          colId: "source",
          headerName: "Source",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.source?.[0]?.name ?? "—",
        },
        {
          colId: "status",
          headerName: "Status",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            latestStatus(p.data?.status)?.name ?? "—",
        },
        {
          colId: "creditTo",
          headerName: "Credit To",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.creditedSalesTeam?.[0]?.name ?? "—",
        },
        {
          colId: "followUp",
          headerName: "Follow Up Date",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatLeadDate(p.data?.currentStatusDate?.timestamp),
          cellClass: (p: CellClassParams<LeadListRow>) =>
            isFollowUpOverdue(p.data) ? "text-destructive font-medium" : "",
        },
        {
          colId: "expClosure",
          headerName: "Expected Closure Date",
          minWidth: 150,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatLeadDate(p.data?.expClosureDate?.timestamp),
        },
        {
          colId: "eventDate",
          headerName: "Event Date",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatLeadDate(p.data?.eventDate?.timestamp),
        },
        {
          colId: "crossSell",
          headerName: "Cross Selling",
          minWidth: 140,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.crossSellingDetails?.brandPartnerSubCategories
              ?.map((c) => c.name || c.title)
              .filter(Boolean)
              .join(", ") || "—",
        },
        {
          colId: "studio",
          headerName: "Studio",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.studio?.[0]?.name ?? "—",
        },
        {
          field: "rating",
          headerName: "Rating",
          minWidth: 90,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            p.data?.rating ?? "—",
        },
        {
          colId: "linkClose",
          headerName: "Link Order Close Date",
          minWidth: 150,
          valueGetter: (p: ValueGetterParams<LeadListRow>) =>
            formatLeadDate(p.data?.leadLinkOrderCloseDate?.timestamp),
        },
      ] as ColDef<LeadListRow>[],
    [openView, openStatus, openBook]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-muted-foreground text-sm">
          Pre-sales opportunities — search, filter, update status, and book
          appointments.
          {exporting ? (
            <span className="text-muted-foreground/80"> · Exporting…</span>
          ) : null}
        </p>
      </div>

      <LeadsFilterBar
        searchInputValue={searchInputValue}
        status={status}
        creditToSalesTeamIds={creditToSalesTeamIds}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading || exporting}
        onSearchSubmit={setSearchQuery}
        onStatusChange={setStatus}
        onCreditToChange={setCreditToSalesTeamIds}
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={applyMoreFilters}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={clearFilter}
        onClearAllFilters={clearAllFilters}
        searchParams={searchParams}
        onAddLead={() => router.push("/leads/form")}
        onExport={() => void handleExport()}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load leads. Check your session and try again.
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
        </div>
        <DataGrid
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={(params) => params.data._id}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          persistKey="leads"
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

      <QuickLeadView
        open={viewOpen}
        lead={selected}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) setSelected(null)
        }}
        onEdit={(lead) => {
          setViewOpen(false)
          router.push(`/leads/form?leadId=${lead._id}`)
        }}
      />

      <LeadStatusDialog
        open={statusOpen}
        lead={selected}
        onOpenChange={(open) => {
          setStatusOpen(open)
          if (!open) setSelected(null)
        }}
        onSaved={reloadLeads}
      />

      <BookLeadAppointmentDialog
        open={bookOpen}
        lead={selected}
        onOpenChange={(open) => {
          setBookOpen(open)
          if (!open) setSelected(null)
        }}
        onSaved={reloadLeads}
      />
    </div>
  )
}
