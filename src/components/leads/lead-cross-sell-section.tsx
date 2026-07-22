"use client"

import { useEffect, useMemo, useState } from "react"
import type {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
} from "ag-grid-community"
import { PencilIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { FilterIdMultiSelect } from "@/components/leads/filter-id-multi-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  newCrossSellRow,
  type LeadCrossSellRow,
} from "@/lib/leads/lead-form-schema"

type Option = { id: string; label: string }

type LeadCrossSellSectionProps = {
  rows: LeadCrossSellRow[]
  options: Option[]
  optionsLoading?: boolean
  labelById?: Map<string, string>
  disabled?: boolean
  onChange: (rows: LeadCrossSellRow[]) => void
}

function CrossSellActionsCell({
  data,
  onEdit,
  onDelete,
  disabled,
}: {
  data?: LeadCrossSellRow
  onEdit: (row: LeadCrossSellRow) => void
  onDelete: (id: string) => void
  disabled?: boolean
}) {
  if (!data) return null
  return (
    <div className="flex h-full items-center gap-1">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label="Edit cross sell"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(data)
        }}
      >
        <PencilIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label="Delete cross sell"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(data.id)
        }}
      >
        <Trash2Icon className="size-3.5 text-destructive" />
      </Button>
    </div>
  )
}

export function LeadCrossSellSection({
  rows,
  options,
  optionsLoading,
  labelById,
  disabled,
  onChange,
}: LeadCrossSellSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<LeadCrossSellRow | null>(null)
  const isEdit = Boolean(draft && rows.some((r) => r.id === draft.id))

  const openAdd = () => {
    setDraft(newCrossSellRow())
    setDialogOpen(true)
  }

  const openEdit = (row: LeadCrossSellRow) => {
    setDraft({ ...row, brandPartnerSubCatIds: [...row.brandPartnerSubCatIds] })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setDraft(null)
  }

  const saveDraft = () => {
    if (!draft) return
    const hasContent =
      draft.brandPartnerSubCatIds.length > 0 || Boolean(draft.remarks?.trim())
    if (!hasContent) {
      closeDialog()
      return
    }
    const index = rows.findIndex((r) => r.id === draft.id)
    if (index >= 0) {
      const next = [...rows]
      next[index] = draft
      onChange(next)
    } else {
      onChange([...rows, draft])
    }
    closeDialog()
  }

  const deleteRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id))
  }

  const categoriesLabel = (ids: string[] | undefined) => {
    if (!ids?.length) return "—"
    return (
      ids.map((id) => labelById?.get(id) ?? id).join(", ") || "—"
    )
  }

  const columnDefs = useMemo<ColDef<LeadCrossSellRow>[]>(
    () => [
      {
        colId: "categories",
        headerName: "Product categories",
        minWidth: 220,
        flex: 1.4,
        valueGetter: (p) => categoriesLabel(p.data?.brandPartnerSubCatIds),
        cellStyle: { whiteSpace: "normal", lineHeight: "1.35" },
      },
      {
        field: "remarks",
        headerName: "Remark",
        minWidth: 180,
        flex: 1,
        valueGetter: (p) => p.data?.remarks?.trim() || "—",
        cellStyle: { whiteSpace: "pre-line", lineHeight: "1.35" },
      },
      {
        colId: "actions",
        headerName: "Action",
        width: 100,
        sortable: false,
        pinned: "right",
        cellRenderer: (p: ICellRendererParams<LeadCrossSellRow>) => (
          <CrossSellActionsCell
            data={p.data}
            disabled={disabled}
            onEdit={openEdit}
            onDelete={deleteRow}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, rows, labelById]
  )

  useEffect(() => {
    if (!dialogOpen) setDraft(null)
  }, [dialogOpen])

  return (
    <section className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
            <ShoppingBagIcon className="text-muted-foreground size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Cross selling details
            </h2>
            <p className="text-muted-foreground text-xs">
              Brand-partner categories and remarks for upsell opportunities.
            </p>
          </div>
        </div>
        {rows.length > 0 ? (
          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={disabled}
            onClick={openAdd}
          >
            <PlusIcon className="size-4" />
            Add new
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-10 text-center">
          <p className="text-sm font-medium">No cross selling details yet</p>
          <p className="text-muted-foreground max-w-sm text-xs">
            Add product categories and notes for cross-sell follow-ups.
          </p>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={openAdd}
          >
            <PlusIcon className="size-4" />
            Add cross selling details
          </Button>
        </div>
      ) : (
        <DataGrid<LeadCrossSellRow>
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(p: GetRowIdParams<LeadCrossSellRow>) => p.data.id}
          getRowHeight={() => 48}
          heightClassName="h-[min(240px,36vh)] min-h-[140px]"
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: false,
            suppressHeaderMenuButton: true,
          }}
          persistKey="lead-form-cross-sell-v1"
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
          else setDialogOpen(true)
        }}
      >
        <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? "Update cross selling details"
                : "Add cross selling details"}
            </DialogTitle>
            <DialogDescription>
              Select categories and optionally add a remark.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="grid max-h-[min(70vh,480px)] gap-4 overflow-y-auto px-5 py-4">
              <FilterIdMultiSelect
                label="Cross selling categories"
                options={options}
                selectedIds={draft.brandPartnerSubCatIds}
                onChange={(brandPartnerSubCatIds) =>
                  setDraft({ ...draft, brandPartnerSubCatIds })
                }
                loading={optionsLoading}
                disabled={disabled}
                searchPlaceholder="Search categories…"
              />
              <div className="space-y-1.5">
                <Label htmlFor="cs-remarks">Cross selling remark</Label>
                <Textarea
                  id="cs-remarks"
                  rows={3}
                  placeholder="Enter any remark"
                  value={draft.remarks || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, remarks: e.target.value })
                  }
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="justify-end">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="button" disabled={disabled || !draft} onClick={saveDraft}>
              {isEdit ? "Update" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
