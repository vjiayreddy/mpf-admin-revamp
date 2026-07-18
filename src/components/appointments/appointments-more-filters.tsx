"use client"

import { useEffect, useState } from "react"

import { FilterDateField, FilterFieldset } from "@/components/customers/filter-fields"
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
import { APPOINTMENT_FILTER_PARAMS } from "@/config/appointment-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

type DraftState = {
  startAppointmentDate: string
  endAppointmentDate: string
  studioIds: string[]
}

function splitCsvIds(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = APPOINTMENT_FILTER_PARAMS
  return {
    startAppointmentDate: isoToDateInput(
      searchParams.get(p.startAppointmentDate)
    ),
    endAppointmentDate: isoToDateInput(searchParams.get(p.endAppointmentDate)),
    studioIds: splitCsvIds(searchParams.get(p.studio)),
  }
}

type AppointmentsMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function AppointmentsMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: AppointmentsMoreFiltersProps) {
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
    const p = APPOINTMENT_FILTER_PARAMS
    onApply({
      [p.startAppointmentDate]: dateInputToIso(draft.startAppointmentDate),
      [p.endAppointmentDate]: dateInputToIso(draft.endAppointmentDate),
      [p.studio]:
        draft.studioIds.length > 0 ? draft.studioIds.join(",") : null,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter by appointment date range and studios.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <FilterFieldset legend="Appointment date">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.startAppointmentDate}
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    startAppointmentDate: value,
                  }))
                }
              />
              <FilterDateField
                label="To"
                value={draft.endAppointmentDate}
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    endAppointmentDate: value,
                  }))
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
