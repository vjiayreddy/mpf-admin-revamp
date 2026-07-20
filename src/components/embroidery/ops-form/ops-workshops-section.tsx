"use client"

import { useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"

import {
  GroupedMultiAutocomplete,
  type GroupedMultiOption,
} from "@/components/embroidery/ops-form/grouped-multi-autocomplete"
import { Label } from "@/components/ui/label"
import { useWorkshopsByType } from "@/hooks/use-workshops-by-type"
import type { EmbroideryOpsFormValues } from "@/lib/embroidery/ops-form"
import type { WorkshopOption } from "@/lib/apollo/queries/workshops"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type OpsWorkshopsSectionProps = {
  enabled: boolean
  disabled?: boolean
}

function workshopOptions(workshops: WorkshopOption[]): GroupedMultiOption[] {
  return workshops.map((w) => ({
    id: w._id,
    name: w.name?.trim() || w.label?.trim() || w._id,
  }))
}

function MultiWorkshopAutocomplete({
  id,
  label,
  name,
  workshopType,
  enabled,
  disabled,
}: {
  id: string
  label: string
  name: "workshopIds" | "machineWorkshopIds"
  workshopType: string
  enabled: boolean
  disabled?: boolean
}) {
  const { control } = useFormContext<EmbroideryOpsFormValues>()
  const { workshops, loading } = useWorkshopsByType(workshopType, enabled)

  const options = useMemo(() => workshopOptions(workshops), [workshops])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <GroupedMultiAutocomplete
          id={id}
          label={label}
          options={options}
          value={field.value}
          onChange={field.onChange}
          loading={loading}
          disabled={disabled}
          searchPlaceholder={`Search ${label.toLowerCase()}…`}
          emptyPlaceholder="No workshops found"
          noMatchPlaceholder="No workshops match"
          loadingPlaceholder="Loading workshops…"
          listMaxHeightClassName="max-h-40"
        />
      )}
    />
  )
}

export function OpsWorkshopsSection({
  enabled,
  disabled,
}: OpsWorkshopsSectionProps) {
  const { control } = useFormContext<EmbroideryOpsFormValues>()
  const { workshops, loading } = useWorkshopsByType(
    "COMPUTERIZED_EMBROIDERY",
    enabled
  )

  return (
    <section className="bg-card flex w-full flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold tracking-tight">Workshops</h2>
      <div className="flex w-full flex-col gap-4">
        <MultiWorkshopAutocomplete
          id="ops-hand-workshops"
          label="Hand workshops"
          name="workshopIds"
          workshopType="HAND_EMBROIDERY"
          enabled={enabled}
          disabled={disabled}
        />
        <MultiWorkshopAutocomplete
          id="ops-machine-workshops"
          label="Machine workshops"
          name="machineWorkshopIds"
          workshopType="MACHINE_EMBROIDERY"
          enabled={enabled}
          disabled={disabled}
        />
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="ops-computerized-workshop">
            Computerized workshop
          </Label>
          <Controller
            name="computerizedWorkshopId"
            control={control}
            render={({ field }) => (
              <select
                id="ops-computerized-workshop"
                className={selectClass}
                disabled={disabled || loading}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">
                  {loading ? "Loading…" : "Select workshop…"}
                </option>
                {workshops.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name || w.label || w._id}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>
    </section>
  )
}
