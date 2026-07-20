"use client"

import { useEffect, useState } from "react"

import {
  FilterDateField,
  FilterFieldset,
} from "@/components/customers/filter-fields"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { QUALITY_CHECK_PARAMS } from "@/config/quality-check-filters"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

type DraftState = {
  startTrialDate: string
  endTrialDate: string
  startDeliveryDate: string
  endDeliveryDate: string
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = QUALITY_CHECK_PARAMS
  return {
    startTrialDate: isoToDateInput(searchParams.get(p.startTrialDate)),
    endTrialDate: isoToDateInput(searchParams.get(p.endTrialDate)),
    startDeliveryDate: isoToDateInput(searchParams.get(p.startDeliveryDate)),
    endDeliveryDate: isoToDateInput(searchParams.get(p.endDeliveryDate)),
  }
}

type QualityCheckMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function QualityCheckMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: QualityCheckMoreFiltersProps) {
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  useEffect(() => {
    if (open) setDraft(draftFromParams(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open gate
  }, [open])

  const handleApply = () => {
    const p = QUALITY_CHECK_PARAMS
    onApply({
      [p.startTrialDate]: dateInputToIso(draft.startTrialDate),
      [p.endTrialDate]: dateInputToIso(draft.endTrialDate),
      [p.startDeliveryDate]: dateInputToIso(draft.startDeliveryDate),
      [p.endDeliveryDate]: dateInputToIso(draft.endDeliveryDate),
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter quality check orders by trial and delivery dates.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-4">
          <FilterFieldset legend="Trial date">
            <FilterDateField
              label="From"
              value={draft.startTrialDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startTrialDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endTrialDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endTrialDate: value }))
              }
            />
          </FilterFieldset>
          <FilterFieldset legend="Delivery date">
            <FilterDateField
              label="From"
              value={draft.startDeliveryDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startDeliveryDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endDeliveryDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endDeliveryDate: value }))
              }
            />
          </FilterFieldset>
        </div>
        <SheetFooter className="gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              onClear()
              onOpenChange(false)
            }}
          >
            Clear dates
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
