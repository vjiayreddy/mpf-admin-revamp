"use client"

import { useEffect, useMemo, useState } from "react"
import type {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
} from "ag-grid-community"
import { CalendarDaysIcon, ImageIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  LEAD_BUDGET_OPTIONS,
  LEAD_OCCASION_IMAGE_UPLOAD_PATH,
  LEAD_OCCASION_OPTIONS,
  leadBudgetLabel,
  leadOccasionLabel,
} from "@/config/lead-form"
import {
  newOccasionRow,
  type LeadOccasionRow,
} from "@/lib/leads/lead-form-schema"
import { uploadUrlsFromResult } from "@/lib/uppy/config"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

const PLACEHOLDER_IMAGE =
  "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"

type LeadOccasionSectionProps = {
  rows: LeadOccasionRow[]
  userId?: string
  disabled?: boolean
  onChange: (rows: LeadOccasionRow[]) => void
}

function OccasionActionsCell({
  data,
  onEdit,
  onDelete,
  disabled,
}: {
  data?: LeadOccasionRow
  onEdit: (row: LeadOccasionRow) => void
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
        aria-label="Edit occasion"
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
        aria-label="Delete occasion"
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

export function LeadOccasionSection({
  rows,
  userId,
  disabled,
  onChange,
}: LeadOccasionSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<LeadOccasionRow | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const isEdit = Boolean(draft && rows.some((r) => r.id === draft.id))

  const openAdd = () => {
    setDraft(newOccasionRow())
    setDialogOpen(true)
  }

  const openEdit = (row: LeadOccasionRow) => {
    setDraft({ ...row })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setDraft(null)
    setUploadOpen(false)
  }

  const saveDraft = () => {
    if (!draft) return
    const hasContent =
      draft.occasion?.trim() ||
      draft.budget?.trim() ||
      draft.outfitsNote?.trim() ||
      draft.priceQuote?.trim() ||
      draft.refImage?.trim()
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

  const columnDefs = useMemo<ColDef<LeadOccasionRow>[]>(
    () => [
      {
        colId: "refImage",
        headerName: "Ref image",
        width: 90,
        sortable: false,
        cellRenderer: (p: ICellRendererParams<LeadOccasionRow>) => {
          const src = p.data?.refImage?.trim() || PLACEHOLDER_IMAGE
          return (
            <div className="flex h-full items-center py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="size-10 rounded-md border object-cover"
              />
            </div>
          )
        },
      },
      {
        field: "occasion",
        headerName: "Occasion",
        minWidth: 140,
        flex: 1,
        valueGetter: (p) => leadOccasionLabel(p.data?.occasion),
      },
      {
        field: "outfitsNote",
        headerName: "Note",
        minWidth: 160,
        flex: 1.2,
        valueGetter: (p) => p.data?.outfitsNote?.trim() || "—",
        cellStyle: { whiteSpace: "pre-line", lineHeight: "1.35" },
      },
      {
        field: "budget",
        headerName: "Budget",
        minWidth: 110,
        valueGetter: (p) => leadBudgetLabel(p.data?.budget),
      },
      {
        field: "priceQuote",
        headerName: "Price quote",
        minWidth: 110,
        valueGetter: (p) => p.data?.priceQuote?.trim() || "—",
      },
      {
        colId: "actions",
        headerName: "Action",
        width: 100,
        sortable: false,
        pinned: "right",
        cellRenderer: (p: ICellRendererParams<LeadOccasionRow>) => (
          <OccasionActionsCell
            data={p.data}
            disabled={disabled}
            onEdit={openEdit}
            onDelete={deleteRow}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, rows]
  )

  useEffect(() => {
    if (!dialogOpen) setDraft(null)
  }, [dialogOpen])

  const uploadPath = userId?.trim()
    ? `${LEAD_OCCASION_IMAGE_UPLOAD_PATH}/${userId.trim()}`
    : LEAD_OCCASION_IMAGE_UPLOAD_PATH

  return (
    <section className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
            <CalendarDaysIcon className="text-muted-foreground size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Occasion details
            </h2>
            <p className="text-muted-foreground text-xs">
              Event type, budget, outfit notes, and reference images.
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
          <p className="text-sm font-medium">No occasion details yet</p>
          <p className="text-muted-foreground max-w-sm text-xs">
            Add wedding, engagement, or other event details with budget and
            reference images.
          </p>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={openAdd}
          >
            <PlusIcon className="size-4" />
            Add occasion details
          </Button>
        </div>
      ) : (
        <DataGrid<LeadOccasionRow>
          rowData={rows}
          columnDefs={columnDefs}
          getRowId={(p: GetRowIdParams<LeadOccasionRow>) => p.data.id}
          getRowHeight={() => 52}
          heightClassName="h-[min(280px,40vh)] min-h-[160px]"
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: false,
            suppressHeaderMenuButton: true,
          }}
          persistKey="lead-form-occasions-v1"
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
              {isEdit ? "Update occasion details" : "Add occasion details"}
            </DialogTitle>
            <DialogDescription>
              Capture the event, budget range, quote, and a reference image.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="grid max-h-[min(70vh,560px)] gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="occ-type">Occasion</Label>
                <select
                  id="occ-type"
                  className={selectClass}
                  value={draft.occasion || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, occasion: e.target.value })
                  }
                >
                  <option value="">Select occasion</option>
                  {LEAD_OCCASION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occ-budget">Budget</Label>
                <select
                  id="occ-budget"
                  className={selectClass}
                  value={draft.budget || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, budget: e.target.value })
                  }
                >
                  <option value="">Select budget</option>
                  {LEAD_BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {draft.budget &&
                  !LEAD_BUDGET_OPTIONS.some((o) => o.value === draft.budget) ? (
                    <option value={draft.budget}>{draft.budget}</option>
                  ) : null}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="occ-quote">Price quote</Label>
                <Input
                  id="occ-quote"
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter price quote"
                  value={draft.priceQuote || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, priceQuote: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="occ-note">Outfit note</Label>
                <Textarea
                  id="occ-note"
                  rows={2}
                  placeholder="Enter outfit note"
                  value={draft.outfitsNote || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, outfitsNote: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Reference image</Label>
                <div
                  className={cn(
                    "flex min-h-[120px] items-center justify-center rounded-lg border border-dashed px-3 py-4",
                    draft.refImage ? "justify-start" : null
                  )}
                >
                  {draft.refImage?.trim() ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={draft.refImage}
                        alt="Occasion reference"
                        className="size-[120px] rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full"
                        aria-label="Remove image"
                        disabled={disabled}
                        onClick={() => setDraft({ ...draft, refImage: "" })}
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => setUploadOpen(true)}
                    >
                      <ImageIcon className="size-4" />
                      Upload image
                    </Button>
                  )}
                </div>
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

      {uploadOpen ? (
        <UppyFileUpload
          open
          uppyId="lead-occasion-ref-image"
          uploadPath={uploadPath}
          maxNumberOfFiles={1}
          enableImageEditor
          enableCompressor
          allowedFileTypes={[".png", ".jpg", ".jpeg", ".webp", ".gif"]}
          onClose={() => setUploadOpen(false)}
          onCompleted={(result) => {
            const urls = uploadUrlsFromResult(result.successful)
            setUploadOpen(false)
            if (!urls[0] || !draft) return
            setDraft({ ...draft, refImage: urls[0] })
          }}
        />
      ) : null}
    </section>
  )
}
