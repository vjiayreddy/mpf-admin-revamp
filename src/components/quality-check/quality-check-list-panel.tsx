"use client"

import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ListFilterIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { buildQualityCheckColumnDefs } from "@/components/quality-check/quality-check-columns"
import {
  QualityCheckFilterBar,
  countAdvancedQualityCheckFilters,
} from "@/components/quality-check/quality-check-filter-bar"
import { QualityCheckProductsDialog } from "@/components/quality-check/quality-check-products-dialog"
import {
  QualityCheckView,
  type QualityCheckViewTarget,
} from "@/components/quality-check/quality-check-view"
import { Input } from "@/components/ui/input"
import {
  MORE_QUALITY_CHECK_FILTER_KEYS,
  QUALITY_CHECK_PARAMS,
} from "@/config/quality-check-filters"
import { useQualityCheckList } from "@/hooks/use-quality-check-list"
import type { QualityCheckOrderRow } from "@/lib/apollo/queries/store-orders"

export function QualityCheckListPanel() {
  const searchParams = useSearchParams()
  const list = useQualityCheckList()
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [productsOrder, setProductsOrder] =
    useState<QualityCheckOrderRow | null>(null)
  const [qcTarget, setQcTarget] = useState<QualityCheckViewTarget | null>(null)

  const onViewProducts = useCallback((row: QualityCheckOrderRow) => {
    setProductsOrder(row)
  }, [])

  const columnDefs = useMemo(
    () => buildQualityCheckColumnDefs({ onViewProducts }),
    [onViewProducts]
  )

  const paramsSnapshot = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedQualityCheckFilters(paramsSnapshot),
    [paramsSnapshot]
  )

  const clearMoreFilters = useCallback(() => {
    list.setParams(
      Object.fromEntries(MORE_QUALITY_CHECK_FILTER_KEYS.map((k) => [k, null]))
    )
  }, [list.setParams])

  const hasChips = list.activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Quality Check</h1>
        <p className="text-muted-foreground text-sm">
          Search orders, then refine with filters. Applied filters show below as
          chips you can remove.
        </p>
      </div>

      <QualityCheckFilterBar
        searchInputValue={list.searchTerm}
        stylistId={list.stylistId}
        studioId={list.studioId}
        stylists={list.stylists}
        stylistsLoading={list.stylistsLoading}
        studios={list.studios}
        studiosLoading={list.studiosLoading}
        activeFilters={list.activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={list.loading}
        searchParams={paramsSnapshot}
        onSearchSubmit={(value) =>
          list.setParams({
            [QUALITY_CHECK_PARAMS.searchTerm]: value.trim() || null,
          })
        }
        onStylistChange={(value) =>
          list.setParams({
            [QUALITY_CHECK_PARAMS.stylistId]: value || null,
          })
        }
        onStudioChange={(value) =>
          list.setParams({
            [QUALITY_CHECK_PARAMS.studioId]: value || null,
          })
        }
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={(updates) => list.setParams(updates)}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={(updates) => list.setParams(updates)}
        onClearAllFilters={list.clearAllFilters}
      />

      {list.error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load quality check orders. Check your session and try again.
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
        <DataGrid<QualityCheckOrderRow>
          rowData={list.rows}
          columnDefs={columnDefs}
          getRowId={(params) => params.data._id}
          loading={list.loading}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          persistKey="quality-check"
          className="rounded-none border-0"
        />
        <DataGridPagination
          page={list.currentPage}
          pageSize={list.pageSize}
          currentPageCount={list.rows.length}
          onPageChange={list.goToPage}
          disabled={list.loading}
        />
      </div>

      <QualityCheckProductsDialog
        open={Boolean(productsOrder)}
        onOpenChange={(next) => {
          if (!next) setProductsOrder(null)
        }}
        order={productsOrder}
        onViewQc={(target) => {
          setProductsOrder(null)
          setQcTarget(target)
        }}
      />

      <QualityCheckView
        open={Boolean(qcTarget)}
        onOpenChange={(next) => {
          if (!next) setQcTarget(null)
        }}
        target={qcTarget}
      />
    </div>
  )
}
