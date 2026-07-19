"use client"

import { Suspense, useCallback, useMemo, useRef, useState } from "react"
import type { ColDef, GridApi, ICellRendererParams } from "ag-grid-community"
import { ListFilterIcon, MessageCircleIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import {
  QuickTrialView,
  type QuickTrialViewTarget,
} from "@/components/trial/quick-trial-view"
import { TrialFilterBar } from "@/components/trial/trial-filter-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTrialList } from "@/hooks/use-trial-list"
import type { OrderTrialRow } from "@/lib/apollo/queries/trial"
import {
  customerFullName,
  formatStoreOrderDate,
  truncateWords,
} from "@/lib/track-orders/format"
import { openTrialWhatsAppShare } from "@/lib/trial/whatsapp-share"

function TrialPageInner() {
  const {
    rows,
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
    reload,
    patchTrialRow,
  } = useTrialList()

  const gridApiRef = useRef<GridApi<OrderTrialRow> | null>(null)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [viewTarget, setViewTarget] = useState<QuickTrialViewTarget | null>(
    null
  )
  const [viewOpen, setViewOpen] = useState(false)

  const openListTrial = useCallback((trial: OrderTrialRow) => {
    setViewTarget({ kind: "trialId", trialId: trial._id })
    setViewOpen(true)
  }, [])

  const handleTrialUpdated = useCallback(
    ({
      trialId,
      patch,
    }: {
      trialId: string
      patch: Partial<OrderTrialRow>
    }) => {
      const nextPatch: Partial<OrderTrialRow> = {
        trialStatus: patch.trialStatus,
        trialRating: patch.trialRating,
        trialDecision: patch.trialDecision,
        measurementStatus: patch.measurementStatus,
        note: patch.note,
      }
      patchTrialRow(trialId, nextPatch)

      // Force AG Grid to paint the patched row (valueGetters can lag).
      requestAnimationFrame(() => {
        const api = gridApiRef.current
        if (!api) return
        const node = api.getRowNode(trialId)
        if (node?.data) {
          const updated = { ...node.data, ...nextPatch }
          api.applyTransaction({ update: [updated] })
          api.redrawRows({ rowNodes: [node] })
        } else {
          api.refreshCells({
            force: true,
            columns: [
              "trialStatus",
              "trialRating",
              "trialDecision",
              "note",
              "measurementStatus",
            ],
          })
        }
      })

      // Delayed background sync — patches survive a stale list response.
      window.setTimeout(() => {
        void reload()
      }, 1500)
    },
    [patchTrialRow, reload]
  )

  const listColumns = useMemo<ColDef<OrderTrialRow>[]>(
    () => [
      {
        colId: "orderNo",
        headerName: "Order No",
        minWidth: 100,
        flex: 0.7,
        valueGetter: (p) => p.data?.storeProductOrder?.orderNo ?? "—",
      },
      {
        colId: "customerId",
        headerName: "CusId",
        minWidth: 90,
        flex: 0.6,
        valueGetter: (p) => p.data?.storeProductOrder?.customerId ?? "—",
      },
      {
        colId: "name",
        headerName: "Name",
        minWidth: 160,
        flex: 1.2,
        valueGetter: (p) =>
          customerFullName(
            p.data?.storeProductOrder?.customerFirstName,
            p.data?.storeProductOrder?.customerLastName
          ),
      },
      {
        colId: "trailForm",
        headerName: "Trail Form",
        minWidth: 90,
        flex: 0.6,
        cellRenderer: (params: ICellRendererParams<OrderTrialRow>) => {
          const row = params.data
          if (!row) return null
          return (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7"
              onClick={(e) => {
                e.stopPropagation()
                openListTrial(row)
              }}
            >
              View
            </Button>
          )
        },
      },
      {
        colId: "share",
        headerName: "Share",
        minWidth: 100,
        flex: 0.7,
        cellRenderer: (params: ICellRendererParams<OrderTrialRow>) => {
          const row = params.data
          if (!row) return null
          return (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              onClick={(e) => {
                e.stopPropagation()
                openTrialWhatsAppShare(row._id)
              }}
            >
              <MessageCircleIcon className="size-3.5" />
              Share
            </Button>
          )
        },
      },
      {
        colId: "stylist",
        headerName: "Stylist",
        minWidth: 140,
        flex: 1,
        valueGetter: (p) => p.data?.stylist?.name ?? "—",
      },
      {
        colId: "orderTrailDate",
        headerName: "Order Trail Date",
        minWidth: 130,
        flex: 0.9,
        valueGetter: (p) =>
          formatStoreOrderDate(p.data?.storeProductOrder?.trialDate),
      },
      {
        colId: "actualTrailDate",
        headerName: "Actual Trail Date",
        minWidth: 130,
        flex: 0.9,
        valueGetter: (p) => formatStoreOrderDate(p.data?.trialDate),
      },
      {
        colId: "finalDelivery",
        headerName: "Final Delivery",
        minWidth: 130,
        flex: 0.9,
        valueGetter: (p) => formatStoreOrderDate(p.data?.deliveryDate),
      },
      {
        colId: "trialStatus",
        field: "trialStatus",
        headerName: "Trial Status",
        minWidth: 130,
        flex: 0.9,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "trialRating",
        field: "trialRating",
        headerName: "Rating",
        minWidth: 100,
        flex: 0.7,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "trialDecision",
        field: "trialDecision",
        headerName: "Decision",
        minWidth: 110,
        flex: 0.8,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "note",
        field: "note",
        headerName: "Notes",
        minWidth: 180,
        flex: 1.2,
        valueFormatter: (p) =>
          truncateWords(
            typeof p.value === "string" ? p.value : null,
            10
          ),
      },
      {
        colId: "measurementStatus",
        field: "measurementStatus",
        headerName: "Measurement",
        minWidth: 120,
        flex: 0.8,
        valueFormatter: (p) => p.value || "—",
      },
    ],
    [openListTrial]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Trial</h1>
        <p className="text-muted-foreground text-sm">
          Search trails, then refine with filters. Applied filters show below as
          chips you can remove.
        </p>
      </div>

      <TrialFilterBar
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
          Failed to load trails. Check your session and try again.
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
        <DataGrid<OrderTrialRow>
          rowData={rows}
          columnDefs={listColumns}
          loading={loading}
          getRowId={(params) => params.data._id}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          className="rounded-none border-0"
          gridApiRef={gridApiRef}
        />
        <DataGridPagination
          page={page}
          pageSize={pageSize}
          currentPageCount={rows.length}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      <QuickTrialView
        open={viewOpen}
        target={viewTarget}
        showEditButton
        showUpdate
        showWhatsApp
        onOpenChange={(next) => {
          setViewOpen(next)
          if (!next) setViewTarget(null)
        }}
        onUpdated={handleTrialUpdated}
      />
    </div>
  )
}

export function TrialPageClient() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground p-4 text-sm">Loading trial…</div>
      }
    >
      <TrialPageInner />
    </Suspense>
  )
}
