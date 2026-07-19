"use client"

import { useEffect, useState } from "react"

import { FilterSelect } from "@/components/customers/filter-fields"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  TRIAL_DECISION_OPTIONS,
  TRIAL_MEASUREMENT_STATUS_OPTIONS,
  TRIAL_PARAMS,
  TRIAL_RATING_OPTIONS,
  TRIAL_STATUS_OPTIONS,
} from "@/config/trial-filters"

type DraftState = {
  trialStatus: string
  trialDecision: string
  trialRating: string
  measurementStatus: string
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = TRIAL_PARAMS
  return {
    trialStatus: searchParams.get(p.trialStatus) ?? "",
    trialDecision: searchParams.get(p.trialDecision) ?? "",
    trialRating: searchParams.get(p.trialRating) ?? "",
    measurementStatus: searchParams.get(p.measurementStatus) ?? "",
  }
}

type TrialMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function TrialMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: TrialMoreFiltersProps) {
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  useEffect(() => {
    if (open) setDraft(draftFromParams(searchParams))
  }, [open, searchParams])

  const apply = () => {
    const p = TRIAL_PARAMS
    onApply({
      [p.trialStatus]: draft.trialStatus || null,
      [p.trialDecision]: draft.trialDecision || null,
      [p.trialRating]: draft.trialRating || null,
      [p.measurementStatus]: draft.measurementStatus || null,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Refine trails by status, decision, rating, and measurement.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <FilterSelect
            label="Trail status"
            value={draft.trialStatus}
            allowEmpty
            emptyLabel="Any"
            options={TRIAL_STATUS_OPTIONS}
            onChange={(value) =>
              setDraft((d) => ({ ...d, trialStatus: value }))
            }
          />
          <FilterSelect
            label="Trail decision"
            value={draft.trialDecision}
            allowEmpty
            emptyLabel="Any"
            options={TRIAL_DECISION_OPTIONS}
            onChange={(value) =>
              setDraft((d) => ({ ...d, trialDecision: value }))
            }
          />
          <FilterSelect
            label="Trail rating"
            value={draft.trialRating}
            allowEmpty
            emptyLabel="Any"
            options={TRIAL_RATING_OPTIONS}
            onChange={(value) =>
              setDraft((d) => ({ ...d, trialRating: value }))
            }
          />
          <FilterSelect
            label="Measurement status"
            value={draft.measurementStatus}
            allowEmpty
            emptyLabel="Any"
            options={TRIAL_MEASUREMENT_STATUS_OPTIONS}
            onChange={(value) =>
              setDraft((d) => ({ ...d, measurementStatus: value }))
            }
          />
        </div>

        <SheetFooter className="gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClear()
              onOpenChange(false)
            }}
          >
            Clear
          </Button>
          <Button type="button" onClick={apply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
