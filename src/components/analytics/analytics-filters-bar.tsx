"use client"

import { useId, useState } from "react"
import { CalendarIcon, FilterIcon } from "lucide-react"

import { StudioMultiSelect } from "@/components/customers/studio-multi-select"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ANALYTICS_TIME_PERIOD_OPTIONS,
  type AnalyticsTimePeriod,
} from "@/config/analytics-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type AnalyticsFiltersBarProps = {
  stylistId: string
  studioIds: string[]
  timePeriod: AnalyticsTimePeriod
  startDateInput: string
  endDateInput: string
  onStylistChange: (value: string) => void
  onTimePeriodChange: (value: AnalyticsTimePeriod) => void
  onStudioIdsChange: (ids: string[]) => void
  onApplyCustomDates: (start: string, end: string) => void
  onClearFilters: () => void
}

export function AnalyticsFiltersBar({
  stylistId,
  studioIds,
  timePeriod,
  startDateInput,
  endDateInput,
  onStylistChange,
  onTimePeriodChange,
  onStudioIdsChange,
  onApplyCustomDates,
  onClearFilters,
}: AnalyticsFiltersBarProps) {
  const periodId = useId()
  const { stylists, loading: stylistsLoading } = useAllStylists()
  const { studios, loading: studiosLoading } = useAllStudios()
  const [moreOpen, setMoreOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(startDateInput)
  const [draftEnd, setDraftEnd] = useState(endDateInput)
  const [draftStudios, setDraftStudios] = useState<string[]>(studioIds)

  const openMore = () => {
    setDraftStart(startDateInput)
    setDraftEnd(endDateInput)
    setDraftStudios(studioIds)
    setMoreOpen(true)
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={periodId} className="sr-only">
          Time period
        </label>
        <select
          id={periodId}
          className={cn(compactSelectClass, "min-w-[9rem]")}
          value={timePeriod}
          onChange={(e) =>
            onTimePeriodChange(e.target.value as AnalyticsTimePeriod)
          }
        >
          {ANALYTICS_TIME_PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="w-[13rem] [&_label]:sr-only">
          <StylistSearchSelect
            label="Stylist"
            stylists={stylists}
            value={stylistId}
            onChange={onStylistChange}
            loading={stylistsLoading}
          />
        </div>

        <div className="flex-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={openMore}
        >
          <CalendarIcon className="size-4" />
          Dates & studios
          {studioIds.length > 0 ? (
            <span className="bg-primary text-primary-foreground ml-1 rounded px-1.5 text-[10px]">
              {studioIds.length}
            </span>
          ) : null}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={onClearFilters}
        >
          <FilterIcon className="size-4" />
          Reset
        </Button>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle>Analytics filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="analytics-start">
                Start date
              </label>
              <Input
                id="analytics-start"
                type="date"
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="analytics-end">
                End date
              </label>
              <Input
                id="analytics-end"
                type="date"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
              />
            </div>
            <StudioMultiSelect
              label="Studios"
              studios={studios}
              selectedIds={draftStudios}
              onChange={setDraftStudios}
              loading={studiosLoading}
            />
          </div>
          <SheetFooter className="border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftStudios([])
                onStudioIdsChange([])
              }}
            >
              Clear studios
            </Button>
            <Button
              type="button"
              onClick={() => {
                onStudioIdsChange(draftStudios)
                if (draftStart && draftEnd) {
                  onApplyCustomDates(draftStart, draftEnd)
                }
                setMoreOpen(false)
              }}
            >
              Apply
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
