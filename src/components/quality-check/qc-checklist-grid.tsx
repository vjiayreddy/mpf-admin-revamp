"use client"

import { useMemo } from "react"
import type {
  CellValueChangedEvent,
  ColDef,
  ValueFormatterParams,
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { themeQuartz } from "ag-grid-community"
import { useFormContext } from "react-hook-form"

import { ensureAgGridModules } from "@/components/data-grid/register-ag-grid"
import {
  QC_CHECKLIST_FIELDS,
  type QualityCheckFormValues,
} from "@/lib/quality-check/form"
import type { QcChecklistFieldKey } from "@/lib/quality-check/checklist-fields"
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

export type QcChecklistGridRow = {
  key: QcChecklistFieldKey
  title: string
  check: boolean
  rating: number | null
  note: string
}

type QcChecklistGridProps = {
  className?: string
  disabled?: boolean
}

export function QcChecklistGrid({ className, disabled }: QcChecklistGridProps) {
  const { watch, setValue } = useFormContext<QualityCheckFormValues>()
  const values = watch()

  const rowData = useMemo<QcChecklistGridRow[]>(
    () =>
      QC_CHECKLIST_FIELDS.map((field) => {
        const section = values[field.key]
        return {
          key: field.key,
          title: field.title,
          check: Boolean(section?.check),
          rating: section?.rating ?? null,
          note: section?.note ?? "",
        }
      }),
    [values]
  )

  const columnDefs = useMemo<ColDef<QcChecklistGridRow>[]>(
    () => [
      {
        colId: "title",
        field: "title",
        headerName: "Check",
        editable: false,
        minWidth: 160,
        flex: 1.2,
        cellClass: "font-medium",
      },
      {
        colId: "check",
        field: "check",
        headerName: "OK",
        editable: !disabled,
        width: 88,
        maxWidth: 100,
        cellEditor: "agCheckboxCellEditor",
        cellRenderer: "agCheckboxCellRenderer",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
      },
      {
        colId: "rating",
        field: "rating",
        headerName: "Rating",
        editable: !disabled,
        width: 110,
        maxWidth: 130,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["", "1", "2", "3", "4", "5"],
        },
        valueGetter: (p) => {
          const v = p.data?.rating
          return v == null ? "" : String(v)
        },
        valueSetter: (p) => {
          if (!p.data) return false
          const raw = p.newValue
          if (raw == null || raw === "" || raw === "—") {
            p.data.rating = null
          } else {
            const n = Number(raw)
            p.data.rating = Number.isFinite(n) ? n : null
          }
          return true
        },
        valueFormatter: (p: ValueFormatterParams<QcChecklistGridRow>) => {
          if (p.value == null || p.value === "") return "—"
          return String(p.value)
        },
      },
      {
        colId: "note",
        field: "note",
        headerName: "Note",
        editable: !disabled,
        minWidth: 220,
        flex: 2,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        cellEditorParams: {
          maxLength: 2000,
          rows: 4,
          cols: 40,
        },
        tooltipField: "note",
      },
    ],
    [disabled]
  )

  const onCellValueChanged = (
    event: CellValueChangedEvent<QcChecklistGridRow>
  ) => {
    const key = event.data?.key
    const field = event.colDef.field
    if (!key || !field || field === "title" || field === "key") return

    let next = event.newValue
    if (field === "rating") {
      // valueSetter already wrote number|null onto data; prefer that
      next = event.data.rating
    }
    if (field === "check") {
      next = Boolean(next)
    }
    if (field === "note") {
      next = next == null ? "" : String(next)
    }

    setValue(
      `${key}.${field}` as
        | `${QcChecklistFieldKey}.check`
        | `${QcChecklistFieldKey}.rating`
        | `${QcChecklistFieldKey}.note`,
      next,
      { shouldDirty: true, shouldTouch: true }
    )
  }

  return (
    <div
      className={cn(
        "mpf-data-grid overflow-hidden rounded-lg border",
        className
      )}
    >
      <div className="bg-muted/30 border-b px-3 py-2">
        <p className="text-muted-foreground text-xs">
          Click a cell to edit · Rating 1–5 · Notes open in a popup
        </p>
      </div>
      <AgGridReact<QcChecklistGridRow>
        theme={gridTheme}
        className="w-full"
        rowData={rowData}
        columnDefs={columnDefs}
        getRowId={(p) => p.data.key}
        domLayout="autoHeight"
        singleClickEdit
        stopEditingWhenCellsLoseFocus
        onCellValueChanged={onCellValueChanged}
        suppressMovableColumns
        suppressCellFocus={false}
        enableCellTextSelection
        animateRows={false}
        tooltipShowDelay={400}
        defaultColDef={{
          sortable: false,
          filter: false,
          resizable: true,
          suppressHeaderMenuButton: true,
        }}
      />
    </div>
  )
}
