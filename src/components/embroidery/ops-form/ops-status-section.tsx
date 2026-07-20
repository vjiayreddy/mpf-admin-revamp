"use client"

import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ANY_DELAY_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
  EMB_STATUS_OPTIONS,
  MARKING_STATUS_OPTIONS,
  PAPER_STATUS_OPTIONS,
  QC_STATUS_OPTIONS,
  SAMPLE_STATUS_OPTIONS,
} from "@/config/embroidery-status"
import type { EmbroideryOpsFormValues } from "@/lib/embroidery/ops-form"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type OpsStatusSectionProps = {
  disabled?: boolean
}

function StatusSelect({
  id,
  label,
  name,
  options,
  disabled,
}: {
  id: string
  label: string
  name: keyof EmbroideryOpsFormValues
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  const { register } = useFormContext<EmbroideryOpsFormValues>()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClass}
        disabled={disabled}
        {...register(name)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function OpsStatusSection({ disabled }: OpsStatusSectionProps) {
  const { register } = useFormContext<EmbroideryOpsFormValues>()

  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold tracking-tight">Status</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatusSelect
          id="ops-emb-status"
          label="Emb status"
          name="embStatus"
          options={EMB_STATUS_OPTIONS}
          disabled={disabled}
        />
        <StatusSelect
          id="ops-marking-status"
          label="Marking status"
          name="markingStatus"
          options={MARKING_STATUS_OPTIONS}
          disabled={disabled}
        />
        <StatusSelect
          id="ops-sample-status"
          label="Sample status"
          name="sampleStatus"
          options={SAMPLE_STATUS_OPTIONS}
          disabled={disabled}
        />
        <StatusSelect
          id="ops-paper-status"
          label="Paper status"
          name="paperStatus"
          options={PAPER_STATUS_OPTIONS}
          disabled={disabled}
        />
        <StatusSelect
          id="ops-approval-status"
          label="Approval status"
          name="approvalStatus"
          options={APPROVAL_STATUS_OPTIONS}
          disabled={disabled}
        />
        <StatusSelect
          id="ops-qc-status"
          label="QC status"
          name="qcStatus"
          options={QC_STATUS_OPTIONS}
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-paper-no">Paper no</Label>
          <Input
            id="ops-paper-no"
            disabled={disabled}
            {...register("paperNo")}
          />
        </div>
        <StatusSelect
          id="ops-any-delays"
          label="Any delays"
          name="anyDelays"
          options={ANY_DELAY_OPTIONS}
          disabled={disabled}
        />
        <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-3">
          <Label htmlFor="ops-marking-remarks">Marking remarks</Label>
          <Textarea
            id="ops-marking-remarks"
            rows={2}
            disabled={disabled}
            {...register("markingRemarks")}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-3">
          <Label htmlFor="ops-approval-remarks">Approval remarks</Label>
          <Textarea
            id="ops-approval-remarks"
            rows={2}
            disabled={disabled}
            {...register("approvalRemarks")}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-3">
          <Label htmlFor="ops-emb-remark">Emb remark</Label>
          <Textarea
            id="ops-emb-remark"
            rows={2}
            disabled={disabled}
            {...register("embRemark")}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 xl:col-span-3">
          <Label htmlFor="ops-note">Note</Label>
          <Textarea
            id="ops-note"
            rows={2}
            disabled={disabled}
            {...register("note")}
          />
        </div>
      </div>
    </section>
  )
}
