"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { useWorkshopsByType } from "@/hooks/use-workshops-by-type"
import type { EmbroideryOpsFormValues } from "@/lib/embroidery/ops-form"
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

function MultiWorkshopSelect({
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

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            id={id}
            multiple
            disabled={disabled || loading}
            className={cn(selectClass, "h-28 py-2")}
            value={field.value}
            onChange={(e) => {
              field.onChange(
                Array.from(e.target.selectedOptions).map((o) => o.value)
              )
            }}
          >
            {loading ? (
              <option disabled>Loading workshops…</option>
            ) : workshops.length === 0 ? (
              <option disabled>No workshops found</option>
            ) : (
              workshops.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name || w.label || w._id}
                </option>
              ))
            )}
          </select>
        )}
      />
      <p className="text-muted-foreground text-xs">
        Hold Cmd/Ctrl to select multiple.
      </p>
    </div>
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
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold tracking-tight">Workshops</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <MultiWorkshopSelect
          id="ops-hand-workshops"
          label="Hand workshops"
          name="workshopIds"
          workshopType="HAND_EMBROIDERY"
          enabled={enabled}
          disabled={disabled}
        />
        <MultiWorkshopSelect
          id="ops-machine-workshops"
          label="Machine workshops"
          name="machineWorkshopIds"
          workshopType="MACHINE_EMBROIDERY"
          enabled={enabled}
          disabled={disabled}
        />
        <div className="flex flex-col gap-2">
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
