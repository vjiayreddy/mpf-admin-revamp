"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { FilterIcon, SearchIcon } from "lucide-react"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { TrackOrdersActiveFilters } from "@/components/track-orders/track-orders-active-filters"
import { TrackOrdersMoreFilters } from "@/components/track-orders/track-orders-more-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MEASUREMENT_APPROVAL_OPTIONS,
  TRACK_ORDERS_SORT_OPTIONS,
  TRACK_ORDERS_STATUS_OPTIONS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-list-filters"
import type { ActiveTrackOrdersListFilter } from "@/lib/track-orders/build-track-orders-list-filter"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import type { StudioOption } from "@/lib/apollo/queries/studios"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type TrackOrdersFilterBarProps = {
  searchInputValue: string
  stylistId: string
  orderStatus: string
  sortByEnum: TrackOrdersSortBy
  measurementApprovalStatus: string
  stylists: StylistOption[]
  studios: StudioOption[]
  activeFilters: ActiveTrackOrdersListFilter[]
  advancedFilterCount: number
  loading?: boolean
  onSearchSubmit: (value: string) => void
  onStylistChange: (value: string) => void
  onOrderStatusChange: (value: string) => void
  onSortByChange: (value: TrackOrdersSortBy) => void
  onMeasurementApprovalChange: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
  searchParams: URLSearchParams
}

export function TrackOrdersFilterBar({
  searchInputValue,
  stylistId,
  orderStatus,
  sortByEnum,
  measurementApprovalStatus,
  stylists,
  studios,
  activeFilters,
  advancedFilterCount,
  loading,
  onSearchSubmit,
  onStylistChange,
  onOrderStatusChange,
  onSortByChange,
  onMeasurementApprovalChange,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
  searchParams,
}: TrackOrdersFilterBarProps) {
  const sortId = useId()
  const statusId = useId()
  const measurementId = useId()
  const [draft, setDraft] = useState(searchInputValue)

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit(draft)
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:p-4">
      <form
        onSubmit={submit}
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <div className="border-input flex min-w-0 flex-1 overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search orders…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search orders"
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-9 shrink-0 sm:px-4"
          disabled={loading}
        >
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <select
          id={sortId}
          className={cn(selectClass, "min-w-[9rem]")}
          value={sortByEnum}
          disabled={loading}
          onChange={(e) =>
            onSortByChange(e.target.value as TrackOrdersSortBy)
          }
          aria-label="Sort by"
        >
          {TRACK_ORDERS_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          id={statusId}
          className={cn(selectClass, "min-w-[10rem]")}
          value={orderStatus}
          disabled={loading}
          onChange={(e) => onOrderStatusChange(e.target.value)}
          aria-label="Order status"
        >
          {TRACK_ORDERS_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          id={measurementId}
          className={cn(selectClass, "min-w-[10rem]")}
          value={measurementApprovalStatus}
          disabled={loading}
          onChange={(e) => onMeasurementApprovalChange(e.target.value)}
          aria-label="Measurement approval"
        >
          {MEASUREMENT_APPROVAL_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
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
            disabled={loading}
          />
        </div>

        <div className="flex-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onMoreFiltersOpenChange(true)}
          disabled={loading}
        >
          <FilterIcon className="size-4" />
          More filters
          {advancedFilterCount > 0 ? (
            <Badge variant="secondary" className="ml-0.5">
              {advancedFilterCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      <TrackOrdersActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <TrackOrdersMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        studios={studios}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}
