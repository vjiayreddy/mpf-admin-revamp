"use client"

import { useMemo, useRef } from "react"
import { AgGridReact, type AgGridReactProps } from "ag-grid-react"
import type { ColDef, RowClickedEvent } from "ag-grid-community"
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
  headerFontWeight: 600,
  headerTextColor: "var(--foreground)",
  oddRowBackgroundColor:
    "color-mix(in oklch, var(--muted) 45%, transparent)",
  rowHoverColor: "color-mix(in oklch, var(--muted) 80%, transparent)",
  selectedRowBackgroundColor:
    "color-mix(in oklch, var(--primary) 12%, transparent)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  headerFontSize: 12,
  spacing: 8,
  borderRadius: 8,
  cellHorizontalPadding: 12,
})

export type DataGridProps<TData> = {
  rowData: TData[] | null | undefined
  columnDefs: ColDef<TData>[]
  loading?: boolean
  getRowId?: AgGridReactProps<TData>["getRowId"]
  onRowClicked?: (event: RowClickedEvent<TData>) => void
  className?: string
  heightClassName?: string
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
  className,
  heightClassName = "h-[calc(100vh-14rem)]",
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
        getRowId={getRowId}
        onRowClicked={onRowClicked}
        animateRows={false}
        rowBuffer={10}
        debounceVerticalScrollbar
        suppressCellFocus
        enableCellTextSelection
        ensureDomOrder
        valueCache
        suppressScrollOnNewData
        domLayout="normal"
      />
    </div>
  )
}
