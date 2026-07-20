"use client"

import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ListFilterIcon } from "lucide-react"

import { buildEmbroideryColumnDefs } from "@/components/embroidery/embroidery-columns"
import { EmbroideryDesignSummaryDialog } from "@/components/embroidery/embroidery-design-summary-dialog"
import { EmbroideryFilterBar } from "@/components/embroidery/embroidery-filter-bar"
import { EmbroideryUpdateDetailsDialog } from "@/components/embroidery/embroidery-update-details-dialog"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { EMBROIDERY_FILTER_PARAMS } from "@/config/embroidery-filters"
import { useEmbroideryList } from "@/hooks/use-embroidery-list"
import type { EmbroideryListRow } from "@/lib/apollo/queries/embroidery"

export function EmbroideryListPanel() {
  const searchParams = useSearchParams()
  const list = useEmbroideryList()
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [designRow, setDesignRow] = useState<EmbroideryListRow | null>(null)
  const [detailsRow, setDetailsRow] = useState<EmbroideryListRow | null>(null)

  const openOpsForm = useCallback((row: EmbroideryListRow) => {
    if (!row._id) return
    window.open(`/embroidery/form?id=${encodeURIComponent(row._id)}`, "_blank")
  }, [])

  const columnDefs = useMemo(
    () =>
      buildEmbroideryColumnDefs({
        onOpenOpsForm: openOpsForm,
        onOpenDesign: setDesignRow,
        onUpdateDetails: setDetailsRow,
      }),
    [openOpsForm]
  )

  const gridHeight = "h-[calc(100vh-16rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Embroidery list
        </h1>
        <p className="text-muted-foreground text-sm">
          Filter by order status, emb status, and more. Save column layouts
          with the Columns menu.
        </p>
      </div>

      <EmbroideryFilterBar
        searchInputValue={list.searchTerm}
        stylistId={list.stylistId}
        orderStatus={list.orderStatus}
        embStatus={list.embStatus}
        workType={list.workType}
        sortByEnum={list.sortByEnum}
        stylists={list.stylists}
        stylistsLoading={list.stylistsLoading}
        activeFilters={list.activeFilters}
        loading={list.loading}
        searchParams={new URLSearchParams(searchParams.toString())}
        onSearchSubmit={(value) =>
          list.setParams({
            [EMBROIDERY_FILTER_PARAMS.searchTerm]: value.trim() || null,
          })
        }
        onStylistChange={(value) =>
          list.setParams({
            [EMBROIDERY_FILTER_PARAMS.stylistId]: value || null,
          })
        }
        onOrderStatusChange={(value) =>
          list.setParams({
            [EMBROIDERY_FILTER_PARAMS.orderStatus]: value || null,
          })
        }
        onEmbStatusChange={(values) =>
          list.setParams({
            [EMBROIDERY_FILTER_PARAMS.embStatus]:
              values.length > 0 ? values.join(",") : null,
          })
        }
        onWorkTypeChange={(value) =>
          list.setParams({
            [EMBROIDERY_FILTER_PARAMS.workType]: value || null,
          })
        }
        onSortChange={(value) =>
          list.setParams({
            [EMBROIDERY_FILTER_PARAMS.sortByEnum]: value || null,
          })
        }
        onApplyMoreFilters={(updates) => list.setParams(updates)}
        onClearFilter={list.clearFilter}
        onClearAllFilters={list.clearAllFilters}
      />

      {list.error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load embroidery list. Check your session and try again.
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
            disabled={list.loading}
          />
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Narrows the current page only — not a server search
          </span>
        </div>
        <DataGrid
          rowData={list.rows}
          columnDefs={columnDefs}
          loading={list.loading}
          getRowId={(params) => params.data._id}
          quickFilterText={pageQuickFilter}
          getRowHeight={() => 56}
          heightClassName={gridHeight}
          persistKey="embroidery"
          className="mpf-embroidery-grid rounded-none border-0"
          defaultColDef={{ flex: 0 }}
        />
        <DataGridPagination
          page={list.page}
          pageSize={list.pageSize}
          currentPageCount={list.rows.length}
          totalCount={list.totalCount}
          onPageChange={list.setPage}
          disabled={list.loading}
        />
      </div>

      <EmbroideryDesignSummaryDialog
        embroideryId={designRow?._id ?? null}
        open={Boolean(designRow)}
        onOpenChange={(open) => {
          if (!open) setDesignRow(null)
        }}
      />

      <EmbroideryUpdateDetailsDialog
        row={detailsRow}
        open={Boolean(detailsRow)}
        onOpenChange={(open) => {
          if (!open) setDetailsRow(null)
        }}
        onUpdated={(id, patch) => {
          list.patchRow(id, patch)
        }}
      />
    </div>
  )
}
