"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { WORK_TYPE_OPTIONS } from "@/config/embroidery-status"
import type { EmbroideryOpsFormValues, WorkAreaOption } from "@/lib/embroidery/ops-form"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type OpsWorkSectionProps = {
  areaOptions: WorkAreaOption[]
  areasLoading: boolean
  disabled?: boolean
}

export function OpsWorkSection({
  areaOptions,
  areasLoading,
  disabled,
}: OpsWorkSectionProps) {
  const { control } = useFormContext<EmbroideryOpsFormValues>()

  const groups = areaOptions.reduce<Record<string, WorkAreaOption[]>>(
    (acc, opt) => {
      const key = opt.group || "Other"
      if (!acc[key]) acc[key] = []
      acc[key].push(opt)
      return acc
    },
    {}
  )

  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold tracking-tight">Work</h2>

      <div className="flex flex-col gap-2">
        <Label>Work type</Label>
        <Controller
          name="workType"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-3">
              {WORK_TYPE_OPTIONS.map((opt) => {
                const checked = field.value.includes(opt.value)
                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => {
                        if (checked) {
                          field.onChange(
                            field.value.filter((v) => v !== opt.value)
                          )
                        } else {
                          field.onChange([...field.value, opt.value])
                        }
                      }}
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ops-work-areas">Work areas</Label>
        <Controller
          name="workAreaIds"
          control={control}
          render={({ field }) => (
            <select
              id="ops-work-areas"
              multiple
              disabled={disabled || areasLoading}
              className={cn(selectClass, "h-36 py-2")}
              value={field.value}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(
                  (o) => o.value
                )
                field.onChange(selected)
              }}
            >
              {areasLoading ? (
                <option disabled>Loading areas…</option>
              ) : areaOptions.length === 0 ? (
                <option disabled>No work areas for this product</option>
              ) : (
                Object.entries(groups).map(([group, opts]) => (
                  <optgroup key={group} label={group}>
                    {opts.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
          )}
        />
        <p className="text-muted-foreground text-xs">
          Hold Cmd/Ctrl to select multiple areas.
        </p>
      </div>
    </section>
  )
}
