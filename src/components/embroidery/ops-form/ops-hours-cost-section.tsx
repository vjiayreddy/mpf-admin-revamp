"use client"

import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EmbroideryOpsFormValues } from "@/lib/embroidery/ops-form"

type OpsHoursCostSectionProps = {
  disabled?: boolean
}

export function OpsHoursCostSection({ disabled }: OpsHoursCostSectionProps) {
  const { register } = useFormContext<EmbroideryOpsFormValues>()

  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-5">
      <h2 className="text-sm font-semibold tracking-tight">
        Hours, cost &amp; dates
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-est-hrs">Est. hours</Label>
          <Input
            id="ops-est-hrs"
            type="number"
            step="any"
            disabled={disabled}
            {...register("estHrs")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-work-hrs">Work hours</Label>
          <Input
            id="ops-work-hrs"
            type="number"
            step="any"
            disabled={disabled}
            {...register("workHrs")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-paper-hrs">Paper hours</Label>
          <Input
            id="ops-paper-hrs"
            type="number"
            step="any"
            disabled={disabled}
            {...register("paperHrs")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-sample-hrs">Sample hours</Label>
          <Input
            id="ops-sample-hrs"
            type="number"
            step="any"
            disabled={disabled}
            {...register("sampleHrs")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-total-hrs">Total actual hours</Label>
          <Input
            id="ops-total-hrs"
            type="number"
            step="any"
            disabled={disabled}
            {...register("totalActualHrs")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-price">Price</Label>
          <Input
            id="ops-price"
            type="number"
            step="any"
            disabled={disabled}
            {...register("price")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-estimated-cost">Estimated cost</Label>
          <Input
            id="ops-estimated-cost"
            type="number"
            step="any"
            disabled={disabled}
            {...register("estimatedCost")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-estimated-cost-or-price">
            Estimated cost or price
          </Label>
          <Input
            id="ops-estimated-cost-or-price"
            type="number"
            step="any"
            disabled={disabled}
            {...register("estimatedCostOrPrice")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-emb-ready-date">Emb completion date</Label>
          <Input
            id="ops-emb-ready-date"
            type="date"
            disabled={disabled}
            {...register("embReadyDate")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-marking-expected-date">
            Marking expected date
          </Label>
          <Input
            id="ops-marking-expected-date"
            type="date"
            disabled={disabled}
            {...register("markingExpectedDate")}
          />
        </div>
      </div>
    </section>
  )
}
