"use client"

import { useMemo, useRef } from "react"
import { AgGridReact, type AgGridReactProps } from "ag-grid-react"
import type {
  ColDef,
  GetRowIdParams,
  GridApi,
  IsFullWidthRowParams,
  RowClassParams,
  RowClickedEvent,
  RowHeightParams,
} from "ag-grid-community"
import { themeQuartz } from "ag-grid-community"

import { ensureAgGridModules } from "@/components/data-grid/register-ag-grid"
import { cn } from "@/lib/utils"

ensureAgGridModules()

const gridTheme = themeQuartz.withParams({
  accentColor: "var(--primary)",
  backgroundColor: "var(--card)",
  foregroundColor: "var(--foreground)",
  borderColor: "var(--border)",
  headerBackgroundColor: "var(--muted)",
  oddRowBackgroundColor: "transparent",
  rowHoverColor: "var(--muted)",
  selectedRowBackgroundColor:
    "color-mix(in oklch, var(--primary) 12%, transparent)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  headerFontSize: 12,
  spacing: 6,
  borderRadius: 8,
})

export type DataGridProps<TData> = {
  rowData: TData[] | null | undefined
  columnDefs: ColDef<TData>[]
  loading?: boolean
  getRowId?: AgGridReactProps<TData>["getRowId"]
  onRowClicked?: (event: RowClickedEvent<TData>) => void
  /** Filters the currently loaded rows only (not server search). */
  quickFilterText?: string
  className?: string
  heightClassName?: string
  /** Community stand-in for Enterprise master/detail. */
  isFullWidthRow?: (params: IsFullWidthRowParams<TData>) => boolean
  fullWidthCellRenderer?: AgGridReactProps<TData>["fullWidthCellRenderer"]
  getRowHeight?: (params: RowHeightParams<TData>) => number | undefined | null
  /**
   * When true with pinned columns, full-width content is split per section
   * (and can look crushed). Prefer false for detail panels.
   */
  embedFullWidthRows?: boolean
  /** Passed through to cell/full-width renderers as `params.context`. */
  context?: AgGridReactProps<TData>["context"]
  getRowClass?: (params: RowClassParams<TData>) => string | string[] | undefined
  onGridReady?: AgGridReactProps<TData>["onGridReady"]
  gridApiRef?: React.MutableRefObject<GridApi<TData> | null>
}

/**
 * Shared AG Grid wrapper. Server pagination lives outside the grid
 * (URL-driven) so we only mount one page of rows — better perf than
 * client-side paging over a fake total.
 */
export function DataGrid<TData>({
  rowData,
  columnDefs,
  loading = false,
  getRowId,
  onRowClicked,
  quickFilterText,
  className,
  heightClassName = "h-[calc(100vh-14rem)]",
  isFullWidthRow,
  fullWidthCellRenderer,
  getRowHeight,
  embedFullWidthRows = false,
  context,
  getRowClass,
  onGridReady,
  gridApiRef,
}: DataGridProps<TData>) {
  const gridRef = useRef<AgGridReact<TData>>(null)

  const defaultColDef = useMemo<ColDef<TData>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 110,
      suppressHeaderMenuButton: true,
      tooltipValueGetter: (params) => {
        const value = params.value
        if (value === null || value === undefined || value === "") return null
        const text = String(value)
        return text === "—" ? null : text
      },
    }),
    []
  )

  return (
    <div
      className={cn(
        "mpf-data-grid bg-card w-full overflow-hidden rounded-lg border",
        heightClassName,
        className
      )}
    >
      <AgGridReact<TData>
        ref={gridRef}
        theme={gridTheme}
        rowData={rowData ?? []}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        loading={loading}
        getRowId={getRowId as (params: GetRowIdParams<TData>) => string}
        onRowClicked={onRowClicked}
        quickFilterText={quickFilterText}
        isFullWidthRow={isFullWidthRow}
        fullWidthCellRenderer={fullWidthCellRenderer}
        getRowHeight={getRowHeight}
        embedFullWidthRows={embedFullWidthRows}
        context={context}
        getRowClass={getRowClass}
        onGridReady={(e) => {
          if (gridApiRef) gridApiRef.current = e.api
          onGridReady?.(e)
        }}
        tooltipShowDelay={400}
        tooltipHideDelay={10000}
        animateRows={false}
        rowBuffer={10}
        debounceVerticalScrollbar
        suppressCellFocus
        enableCellTextSelection
        ensureDomOrder
        valueCache={false}
        suppressScrollOnNewData
        domLayout="normal"
      />
    </div>
  )
}
