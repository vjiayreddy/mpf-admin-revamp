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
  RowDoubleClickedEvent,
  RowHeightParams,
} from "ag-grid-community"
import { themeQuartz } from "ag-grid-community"

import { ensureAgGridModules } from "@/components/data-grid/register-ag-grid"
import { GridColumnsPresetMenu } from "@/components/data-grid/grid-columns-preset-menu"
import { useGridColumnPersistence } from "@/hooks/use-grid-column-persistence"
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
  onRowDoubleClicked?: (event: RowDoubleClickedEvent<TData>) => void
  /** Filters the currently loaded rows only (not server search). */
  quickFilterText?: string
  className?: string
  heightClassName?: string
  /** Merged over the shared defaults (e.g. disable flex for drag-widen + scroll). */
  defaultColDef?: ColDef<TData>
  /**
   * `autoHeight` sizes the grid to its rows (no fixed viewport height).
   * Default `normal` uses `heightClassName` for a scrollable pane.
   */
  domLayout?: "normal" | "autoHeight" | "print"
  /** Keep the horizontal scrollbar visible so users know more columns exist. */
  alwaysShowHorizontalScroll?: boolean
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
  /**
   * When set, column order/size/visibility/pin/sort are restored and
   * auto-saved per signed-in user (prefs.db). Shows a Columns preset menu.
   */
  persistKey?: string
  /** Hide the built-in Columns menu (still persists when `persistKey` is set). */
  hidePresetMenu?: boolean
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
  onRowDoubleClicked,
  quickFilterText,
  className,
  heightClassName = "h-[calc(100vh-14rem)]",
  defaultColDef: defaultColDefOverride,
  domLayout = "normal",
  alwaysShowHorizontalScroll = false,
  isFullWidthRow,
  fullWidthCellRenderer,
  getRowHeight,
  embedFullWidthRows = false,
  context,
  getRowClass,
  onGridReady,
  gridApiRef,
  persistKey,
  hidePresetMenu = false,
}: DataGridProps<TData>) {
  const gridRef = useRef<AgGridReact<TData>>(null)
  const autoHeight = domLayout === "autoHeight"

  const persistence = useGridColumnPersistence<TData>({
    persistKey,
    gridApiRef,
    onGridReady,
  })

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
      ...defaultColDefOverride,
    }),
    [defaultColDefOverride]
  )

  const showMenu = Boolean(persistKey) && !hidePresetMenu

  return (
    <div
      className={cn(
        "mpf-data-grid bg-card relative flex w-full flex-col rounded-lg border",
        autoHeight
          ? "h-auto min-h-0 overflow-x-auto overflow-y-hidden"
          : cn("overflow-hidden", heightClassName),
        className
      )}
    >
      {showMenu && persistKey ? (
        <div className="bg-muted/20 flex shrink-0 items-center justify-end border-b px-2 py-1.5">
          <GridColumnsPresetMenu
            gridKey={persistKey}
            presets={persistence.presets}
            onPresetsChange={persistence.setPresets}
            getColumnState={persistence.getColumnState}
            applyColumnState={persistence.applyColumnState}
            onResetLayout={persistence.resetColumnState}
          />
        </div>
      ) : null}
      <div className={cn("min-h-0 w-full", autoHeight ? "h-auto" : "h-full flex-1")}>
        <AgGridReact<TData>
          ref={gridRef}
          theme={gridTheme}
          className="h-full w-full"
          rowData={rowData ?? []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          loading={loading}
          getRowId={getRowId as (params: GetRowIdParams<TData>) => string}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          quickFilterText={quickFilterText}
          isFullWidthRow={isFullWidthRow}
          fullWidthCellRenderer={fullWidthCellRenderer}
          getRowHeight={getRowHeight}
          embedFullWidthRows={embedFullWidthRows}
          context={context}
          getRowClass={getRowClass}
          onGridReady={persistence.handleGridReady}
          maintainColumnOrder={persistence.maintainColumnOrder}
          {...persistence.columnListeners}
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
          domLayout={domLayout}
          alwaysShowHorizontalScroll={alwaysShowHorizontalScroll}
        />
      </div>
    </div>
  )
}
