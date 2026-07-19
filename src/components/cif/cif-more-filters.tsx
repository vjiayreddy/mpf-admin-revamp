"use client"

import { useEffect, useState } from "react"

import {
  FilterDateField,
  FilterFieldset,
} from "@/components/customers/filter-fields"
import { StudioMultiSelect } from "@/components/customers/studio-multi-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CIF_FILTER_PARAMS } from "@/config/cif-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

type DraftState = {
  startEventDate: string
  endEventDate: string
  startFollowUpDate: string
  endFollowUpDate: string
  startCreatedDate: string
  endCreatedDate: string
  studioIds: string[]
  rating: string
}

function splitCsvIds(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = CIF_FILTER_PARAMS
  return {
    startEventDate: isoToDateInput(searchParams.get(p.startEventDate)),
    endEventDate: isoToDateInput(searchParams.get(p.endEventDate)),
    startFollowUpDate: isoToDateInput(searchParams.get(p.startFollowUpDate)),
    endFollowUpDate: isoToDateInput(searchParams.get(p.endFollowUpDate)),
    startCreatedDate: isoToDateInput(searchParams.get(p.startCreatedDate)),
    endCreatedDate: isoToDateInput(searchParams.get(p.endCreatedDate)),
    studioIds: splitCsvIds(searchParams.get(p.studio)),
    rating: searchParams.get(p.rating) ?? "",
  }
}

type CifMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function CifMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: CifMoreFiltersProps) {
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

  const handleApply = () => {
    const p = CIF_FILTER_PARAMS
    onApply({
      [p.startEventDate]: dateInputToIso(draft.startEventDate),
      [p.endEventDate]: dateInputToIso(draft.endEventDate),
      [p.startFollowUpDate]: dateInputToIso(draft.startFollowUpDate),
      [p.endFollowUpDate]: dateInputToIso(draft.endFollowUpDate),
      [p.startCreatedDate]: dateInputToIso(draft.startCreatedDate),
      [p.endCreatedDate]: dateInputToIso(draft.endCreatedDate),
      [p.studio]:
        draft.studioIds.length > 0 ? draft.studioIds.join(",") : null,
      [p.rating]: draft.rating.trim() || null,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter by event, follow-up, and created dates, studios, and rating.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <FilterFieldset legend="Event date">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startEventDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, startEventDate: value }))
                }
              />
              <FilterDateField
                label="To"
                value={draft.endEventDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, endEventDate: value }))
                }
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Follow-up date">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startFollowUpDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, startFollowUpDate: value }))
                }
              />
              <FilterDateField
                label="To"
                value={draft.endFollowUpDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, endFollowUpDate: value }))
                }
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Created date">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startCreatedDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, startCreatedDate: value }))
                }
              />
              <FilterDateField
                label="To"
                value={draft.endCreatedDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, endCreatedDate: value }))
                }
              />
            </div>
          </FilterFieldset>

          <StudioMultiSelect
            label="Studios"
            studios={studios}
            selectedIds={draft.studioIds}
            onChange={(studioIds) =>
              setDraft((prev) => ({ ...prev, studioIds }))
            }
            loading={studiosLoading}
          />

          <div className="space-y-1.5">
            <label htmlFor="cif-rating-filter" className="text-sm font-medium">
              Rating
            </label>
            <Input
              id="cif-rating-filter"
              type="number"
              min={0}
              max={5}
              step={1}
              value={draft.rating}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, rating: e.target.value }))
              }
              placeholder="e.g. 4"
            />
          </div>
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
