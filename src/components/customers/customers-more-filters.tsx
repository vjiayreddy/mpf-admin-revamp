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
  CUSTOMER_FILTER_PARAMS,
  CUSTOMER_TYPE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/config/customer-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

type DraftState = {
  startCreatedDate: string
  endCreatedDate: string
  startCCDueDate: string
  endCCDueDate: string
  startLastUpdatedDate: string
  endLastUpdatedDate: string
  customerType: string
  userStatus: string
  countryCode: string
  studioIds: string[]
  secondaryStudioIds: string[]
}

function splitCsvIds(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = CUSTOMER_FILTER_PARAMS
  return {
    startCreatedDate: isoToDateInput(searchParams.get(p.startCreatedDate)),
    endCreatedDate: isoToDateInput(searchParams.get(p.endCreatedDate)),
    startCCDueDate: isoToDateInput(searchParams.get(p.startCCDueDate)),
    endCCDueDate: isoToDateInput(searchParams.get(p.endCCDueDate)),
    startLastUpdatedDate: isoToDateInput(
      searchParams.get(p.startLastUpdatedDate)
    ),
    endLastUpdatedDate: isoToDateInput(searchParams.get(p.endLastUpdatedDate)),
    customerType: searchParams.get(p.customerType) ?? "",
    userStatus: searchParams.get(p.userStatus) ?? "",
    countryCode: searchParams.get(p.countryCode) ?? "",
    studioIds: splitCsvIds(searchParams.get(p.studioIds)),
    secondaryStudioIds: splitCsvIds(searchParams.get(p.secondaryStudioIds)),
  }
}

type CustomersMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function CustomersMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: CustomersMoreFiltersProps) {
  const { studios, loading: studiosLoading } = useAllStudios()
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  // Sync draft only when sheet opens — avoids re-renders while typing URL changes
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
    const p = CUSTOMER_FILTER_PARAMS
    onApply({
      [p.startCreatedDate]: dateInputToIso(draft.startCreatedDate),
      [p.endCreatedDate]: dateInputToIso(draft.endCreatedDate),
      [p.startCCDueDate]: dateInputToIso(draft.startCCDueDate),
      [p.endCCDueDate]: dateInputToIso(draft.endCCDueDate),
      [p.startLastUpdatedDate]: dateInputToIso(draft.startLastUpdatedDate),
      [p.endLastUpdatedDate]: dateInputToIso(draft.endLastUpdatedDate),
      [p.customerType]: draft.customerType || null,
      [p.userStatus]: draft.userStatus || null,
      [p.countryCode]: draft.countryCode.trim() || null,
      [p.studioIds]:
        draft.studioIds.length > 0 ? draft.studioIds.join(",") : null,
      [p.secondaryStudioIds]:
        draft.secondaryStudioIds.length > 0
          ? draft.secondaryStudioIds.join(",")
          : null,
    })
    onOpenChange(false)
  }

  const handleClear = () => {
    onClear()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Date ranges, status, type, and studio filters. Apply writes to the
            URL so lists stay bookmarkable.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <FilterFieldset legend="Registered date">
            <div className="grid grid-cols-2 gap-2">
              <FilterDateField
                label="Start"
                value={draft.startCreatedDate}
                onChange={(v) => setField("startCreatedDate", v)}
              />
              <FilterDateField
                label="End"
                value={draft.endCreatedDate}
                onChange={(v) => setField("endCreatedDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="CC due date">
            <div className="grid grid-cols-2 gap-2">
              <FilterDateField
                label="Start"
                value={draft.startCCDueDate}
                onChange={(v) => setField("startCCDueDate", v)}
              />
              <FilterDateField
                label="End"
                value={draft.endCCDueDate}
                onChange={(v) => setField("endCCDueDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Last updated">
            <div className="grid grid-cols-2 gap-2">
              <FilterDateField
                label="Start"
                value={draft.startLastUpdatedDate}
                onChange={(v) => setField("startLastUpdatedDate", v)}
              />
              <FilterDateField
                label="End"
                value={draft.endLastUpdatedDate}
                onChange={(v) => setField("endLastUpdatedDate", v)}
              />
            </div>
          </FilterFieldset>

          <FilterFieldset legend="Other filters">
            <FilterSelect
              label="Customer type"
              value={draft.customerType}
              onChange={(v) => setField("customerType", v)}
              options={CUSTOMER_TYPE_OPTIONS}
              allowEmpty
              emptyLabel="Any"
            />
            <FilterSelect
              label="Status"
              value={draft.userStatus}
              onChange={(v) => setField("userStatus", v)}
              options={USER_STATUS_OPTIONS}
              allowEmpty
              emptyLabel="Any"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs">
                Country calling code
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 91"
                value={draft.countryCode}
                onChange={(e) => setField("countryCode", e.target.value)}
                className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <StudioMultiSelect
              label="Primary studio"
              studios={studios}
              selectedIds={draft.studioIds}
              onChange={(ids) => setField("studioIds", ids)}
              loading={studiosLoading}
            />
            <StudioMultiSelect
              label="Secondary studios"
              studios={studios}
              selectedIds={draft.secondaryStudioIds}
              onChange={(ids) => setField("secondaryStudioIds", ids)}
              loading={studiosLoading}
            />
          </FilterFieldset>
        </div>

        <SheetFooter className="border-t sm:flex-row">
          <Button type="button" className="flex-1" onClick={handleApply}>
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleClear}
          >
            Clear
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
