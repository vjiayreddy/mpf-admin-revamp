"use client"

import { useMemo, useCallback, memo } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AnalyticsDrillDownRow } from "@/lib/apollo/queries/analytics"

export type AnalyticsDrillDownDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  loading?: boolean
  rows: AnalyticsDrillDownRow[]
  totalCount?: number | null
  page: number
  onPageChange: (page: number) => void
  pageSize?: number
}

type DrillRow = Record<string, string> & {
  __rowId: string
  __sr: string
}

const HIDDEN_COLS = new Set([
  "orderNo",
  "Store Order No",
  "Order No",
  "storeOrderId",
  "storeOrderProductId",
  "storeOrderNo",
])

function isImageUrl(value: string) {
  return /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value)
}

const ImageCell = memo(function ImageCell(
  params: ICellRendererParams<DrillRow, string>
) {
  const value = params.value
  if (!value) return <span className="text-muted-foreground">—</span>
  if (!isImageUrl(value)) {
    return <span className="truncate">{value}</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={value}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-10 w-auto rounded object-cover"
    />
  )
})

function toGridRows(
  rows: AnalyticsDrillDownRow[],
  page: number,
  pageSize: number
): { columns: string[]; rowData: DrillRow[] } {
  const columns = (rows[0]?.columns ?? []).filter(
    (col): col is string => Boolean(col) && !HIDDEN_COLS.has(col)
  )

  const rowData: DrillRow[] = new Array(rows.length)
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i]?.row ?? []
    const record: DrillRow = {
      __rowId: `${page}-${i}`,
      __sr: String(page * pageSize + i + 1),
    }
    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c]
      const key = cell?.column
      if (!key || HIDDEN_COLS.has(key)) continue
      record[key] = cell?.value ?? ""
    }
    rowData[i] = record
  }

  return { columns, rowData }
}

export function AnalyticsDrillDownDialog({
  open,
  onOpenChange,
  title,
  loading,
  rows,
  totalCount,
  page,
  onPageChange,
  pageSize = 100,
}: AnalyticsDrillDownDialogProps) {
  const { columns, rowData } = useMemo(
    () => (open ? toGridRows(rows, page, pageSize) : { columns: [], rowData: [] }),
    [open, rows, page, pageSize]
  )

  const columnDefs = useMemo<ColDef<DrillRow>[]>(() => {
    const defs: ColDef<DrillRow>[] = [
      {
        colId: "__sr",
        headerName: "#",
        field: "__sr",
        width: 64,
        maxWidth: 72,
        minWidth: 56,
        flex: 0,
        pinned: "left",
        sortable: false,
        filter: false,
        suppressHeaderMenuButton: true,
      },
    ]

    for (const col of columns) {
      const isImage =
        /image/i.test(col) || col === "fabricImage" || col === "referenceImage"
      defs.push({
        colId: col,
        headerName: col,
        field: col,
        minWidth: isImage ? 100 : 140,
        flex: isImage ? 0 : 1,
        tooltipValueGetter: (p) => {
          const v = p.value
          if (v == null || v === "" || isImageUrl(String(v))) return null
          return String(v)
        },
        cellRenderer: isImage ? ImageCell : undefined,
        valueGetter: (p: ValueGetterParams<DrillRow>) =>
          p.data?.[col] ?? "",
      })
    }
    return defs
  }, [columns])

  const getRowId = useCallback(
    (params: { data: DrillRow }) => params.data.__rowId,
    []
  )

  const empty = !loading && open && rowData.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(90vh,860px)] max-w-[min(96vw,1200px)] flex-col gap-0 p-0"
        showCloseButton
      >
        <DialogHeader className="bg-card">
          <DialogTitle className="truncate pr-2">{title}</DialogTitle>
          <DialogDescription>
            {totalCount != null
              ? `${totalCount.toLocaleString()} record${totalCount === 1 ? "" : "s"}`
              : "Drill-down details"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 pb-1">
          {empty ? (
            <p className="text-muted-foreground flex min-h-[20rem] flex-1 items-center justify-center text-sm">
              No rows for this drill-down.
            </p>
          ) : open ? (
            <DataGrid<DrillRow>
              rowData={rowData}
              columnDefs={columnDefs}
              loading={loading}
              getRowId={getRowId}
              heightClassName="min-h-0 h-full flex-1"
              className="rounded-lg"
            />
          ) : null}
        </div>

        <DialogFooter>
          <DataGridPagination
            page={page}
            pageSize={pageSize}
            currentPageCount={rowData.length}
            totalCount={totalCount ?? undefined}
            onPageChange={onPageChange}
            disabled={!!loading}
            className="w-full border-0 px-1 py-0"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


