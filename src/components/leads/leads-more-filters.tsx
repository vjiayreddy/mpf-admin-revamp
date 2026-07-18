"use client"

import { useEffect, useState } from "react"

import {
  FilterDateField,
  FilterFieldset,
  FilterSelect,
} from "@/components/customers/filter-fields"
import { StudioMultiSelect } from "@/components/customers/studio-multi-select"
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
  LEAD_FILTER_PARAMS,
  LEAD_RATING_OPTIONS,
} from "@/config/lead-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

type DraftState = {
  studioIds: string[]
  rating: string
  startLeadDate: string
  endLeadDate: string
  startFollowUpDate: string
  endFollowUpDate: string
  startExpectedClosureDate: string
  endExpectedClosureDate: string
  startEventDate: string
  endEventDate: string
  startLeadLinkOrderCloseDate: string
  endLeadLinkOrderCloseDate: string
}

function splitCsvIds(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = LEAD_FILTER_PARAMS
  return {
    studioIds: splitCsvIds(searchParams.get(p.studioIds)),
    rating: searchParams.get(p.rating) ?? "",
    startLeadDate: isoToDateInput(searchParams.get(p.startLeadDate)),
    endLeadDate: isoToDateInput(searchParams.get(p.endLeadDate)),
    startFollowUpDate: isoToDateInput(searchParams.get(p.startFollowUpDate)),
    endFollowUpDate: isoToDateInput(searchParams.get(p.endFollowUpDate)),
    startExpectedClosureDate: isoToDateInput(
      searchParams.get(p.startExpectedClosureDate)
    ),
    endExpectedClosureDate: isoToDateInput(
      searchParams.get(p.endExpectedClosureDate)
    ),
    startEventDate: isoToDateInput(searchParams.get(p.startEventDate)),
    endEventDate: isoToDateInput(searchParams.get(p.endEventDate)),
    startLeadLinkOrderCloseDate: isoToDateInput(
      searchParams.get(p.startLeadLinkOrderCloseDate)
    ),
    endLeadLinkOrderCloseDate: isoToDateInput(
      searchParams.get(p.endLeadLinkOrderCloseDate)
    ),
  }
}

type LeadsMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function LeadsMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: LeadsMoreFiltersProps) {
  const { studios, loading: studiosLoading } = useAllStudios()
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  useEffect(() => {
    if (open) {
      setDraft(draftFromParams(searchParams))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: open gate only
  }, [open])

  const setField = <K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    const p = LEAD_FILTER_PARAMS
    onApply({
      [p.studioIds]:
        draft.studioIds.length > 0 ? draft.studioIds.join(",") : null,
      [p.rating]: draft.rating || null,
      [p.startLeadDate]: dateInputToIso(draft.startLeadDate),
      [p.endLeadDate]: dateInputToIso(draft.endLeadDate),
      [p.startFollowUpDate]: dateInputToIso(draft.startFollowUpDate),
      [p.endFollowUpDate]: dateInputToIso(draft.endFollowUpDate),
      [p.startExpectedClosureDate]: dateInputToIso(
        draft.startExpectedClosureDate
      ),
      [p.endExpectedClosureDate]: dateInputToIso(draft.endExpectedClosureDate),
      [p.startEventDate]: dateInputToIso(draft.startEventDate),
      [p.endEventDate]: dateInputToIso(draft.endEventDate),
      [p.startLeadLinkOrderCloseDate]: dateInputToIso(
        draft.startLeadLinkOrderCloseDate
      ),
      [p.endLeadLinkOrderCloseDate]: dateInputToIso(
        draft.endLeadLinkOrderCloseDate
      ),
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter by studio, rating, and lead date ranges.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <StudioMultiSelect
            label="Studios"
            studios={studios}
            selectedIds={draft.studioIds}
            onChange={(studioIds) => setField("studioIds", studioIds)}
            loading={studiosLoading}
          />

          <FilterSelect
            label="Rating"
            value={draft.rating}
            onChange={(v) => setField("rating", v)}
            options={LEAD_RATING_OPTIONS}
            allowEmpty
            emptyLabel="Any"
          />

          <FilterFieldset legend="Lead date">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startLeadDate}
                onChange={(v) => setField("startLeadDate", v)}
              />
              <FilterDateField
                label="To"
                value={draft.endLeadDate}
                onChange={(v) => setField("endLeadDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Follow-up">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startFollowUpDate}
                onChange={(v) => setField("startFollowUpDate", v)}
              />
              <FilterDateField
                label="To"
                value={draft.endFollowUpDate}
                onChange={(v) => setField("endFollowUpDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Expected closure">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startExpectedClosureDate}
                onChange={(v) => setField("startExpectedClosureDate", v)}
              />
              <FilterDateField
                label="To"
                value={draft.endExpectedClosureDate}
                onChange={(v) => setField("endExpectedClosureDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Event">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startEventDate}
                onChange={(v) => setField("startEventDate", v)}
              />
              <FilterDateField
                label="To"
                value={draft.endEventDate}
                onChange={(v) => setField("endEventDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Link order close">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startLeadLinkOrderCloseDate}
                onChange={(v) => setField("startLeadLinkOrderCloseDate", v)}
              />
              <FilterDateField
                label="To"
                value={draft.endLeadLinkOrderCloseDate}
                onChange={(v) => setField("endLeadLinkOrderCloseDate", v)}
              />
            </div>
          </FilterFieldset>
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
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
