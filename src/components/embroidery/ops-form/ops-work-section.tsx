"use client"

import { Controller, useFormContext } from "react-hook-form"

import { WorkAreaGroupedAutocomplete } from "@/components/embroidery/ops-form/work-area-grouped-autocomplete"
import { Label } from "@/components/ui/label"
import { WORK_TYPE_OPTIONS } from "@/config/embroidery-status"
import type {
  EmbroideryOpsFormValues,
  WorkAreaOption,
} from "@/lib/embroidery/ops-form"
import { cn } from "@/lib/utils"

type OpsWorkSectionProps = {
  areaOptions: WorkAreaOption[]
  areasLoading: boolean
  disabled?: boolean
  workAreasRequired?: boolean
}

export function OpsWorkSection({
  areaOptions,
  areasLoading,
  disabled,
  workAreasRequired = true,
}: OpsWorkSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<EmbroideryOpsFormValues>()

  const workTypeError = errors.workType?.message
  const workAreaError = errors.workAreaIds?.message

  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold tracking-tight">Work</h2>

      <div className="flex flex-col gap-2">
        <Label>
          Work type
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Controller
          name="workType"
          control={control}
          render={({ field }) => (
            <div
              className={cn(
                "flex flex-wrap gap-3 rounded-lg",
                workTypeError && "ring-destructive/40 ring-2 ring-offset-2"
              )}
            >
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
        {workTypeError ? (
          <p className="text-destructive text-xs" role="alert">
            {workTypeError}
          </p>
        ) : null}
      </div>

      <Controller
        name="workAreaIds"
        control={control}
        render={({ field }) => (
          <WorkAreaGroupedAutocomplete
            id="ops-work-areas"
            options={areaOptions}
            value={field.value}
            onChange={field.onChange}
            loading={areasLoading}
            disabled={disabled}
            error={workAreaError}
            required={workAreasRequired}
          />
        )}
      />
    </section>
  )
}
