"use client"

import { useEffect, useState } from "react"

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
import {
  EMBROIDERY_FILTER_PARAMS,
  MORE_EMBROIDERY_FILTER_KEYS,
} from "@/config/embroidery-filters"
import {
  APPROVAL_STATUS_OPTIONS,
  MARKING_STATUS_OPTIONS,
  QC_STATUS_OPTIONS,
  SAMPLE_STATUS_OPTIONS,
} from "@/config/embroidery-status"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type EmbroideryMoreFiltersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function EmbroideryMoreFiltersDialog({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: EmbroideryMoreFiltersDialogProps) {
  const p = EMBROIDERY_FILTER_PARAMS
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [approvalStatus, setApprovalStatus] = useState("")
  const [markingStatus, setMarkingStatus] = useState("")
  const [qcStatus, setQcStatus] = useState("")
  const [sampleStatus, setSampleStatus] = useState("")

  useEffect(() => {
    if (!open) return
    setStart(isoToDateInput(searchParams.get(p.startEmbTrialDate)))
    setEnd(isoToDateInput(searchParams.get(p.endEmbTrialDate)))
    setApprovalStatus(searchParams.get(p.approvalStatus) ?? "")
    setMarkingStatus(searchParams.get(p.markingStatus) ?? "")
    setQcStatus(searchParams.get(p.qcStatus) ?? "")
    setSampleStatus(searchParams.get(p.sampleStatus) ?? "")
  }, [open, searchParams, p])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>More embroidery filters</DialogTitle>
          <DialogDescription>
            Narrow by trial date range and status fields.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emb-start-trial">Trial from</Label>
            <Input
              id="emb-start-trial"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emb-end-trial">Trial to</Label>
            <Input
              id="emb-end-trial"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emb-approval">Approval status</Label>
            <select
              id="emb-approval"
              className={selectClass}
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
            >
              <option value="">Any</option>
              {APPROVAL_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emb-marking">Marking status</Label>
            <select
              id="emb-marking"
              className={selectClass}
              value={markingStatus}
              onChange={(e) => setMarkingStatus(e.target.value)}
            >
              <option value="">Any</option>
              {MARKING_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emb-qc">QC status</Label>
            <select
              id="emb-qc"
              className={selectClass}
              value={qcStatus}
              onChange={(e) => setQcStatus(e.target.value)}
            >
              <option value="">Any</option>
              {QC_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="emb-sample">Sample status</Label>
            <select
              id="emb-sample"
              className={selectClass}
              value={sampleStatus}
              onChange={(e) => setSampleStatus(e.target.value)}
            >
              <option value="">Any</option>
              {SAMPLE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="justify-end gap-2 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const clear: Record<string, string | null> = {}
              for (const key of MORE_EMBROIDERY_FILTER_KEYS) {
                clear[key] = null
              }
              onClear()
              onApply(clear)
              onOpenChange(false)
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply({
                [p.startEmbTrialDate]: dateInputToIso(start),
                [p.endEmbTrialDate]: dateInputToIso(end),
                [p.approvalStatus]: approvalStatus || null,
                [p.markingStatus]: markingStatus || null,
                [p.qcStatus]: qcStatus || null,
                [p.sampleStatus]: sampleStatus || null,
              })
              onOpenChange(false)
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
