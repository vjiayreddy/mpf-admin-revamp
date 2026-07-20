"use client"

import { useEffect, useId, useMemo, useState, type FormEvent } from "react"
import { FilterIcon, SearchIcon } from "lucide-react"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { QualityCheckActiveFilters } from "@/components/quality-check/quality-check-active-filters"
import { QualityCheckMoreFilters } from "@/components/quality-check/quality-check-more-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MORE_QUALITY_CHECK_FILTER_KEYS } from "@/config/quality-check-filters"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import type { StudioOption } from "@/lib/apollo/queries/studios"
import type { ActiveQualityCheckFilter } from "@/lib/quality-check/build-quality-check-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type QualityCheckFilterBarProps = {
  searchInputValue: string
  stylistId: string
  studioId: string
  stylists: StylistOption[]
  stylistsLoading?: boolean
  studios: StudioOption[]
  studiosLoading?: boolean
  activeFilters: ActiveQualityCheckFilter[]
  advancedFilterCount: number
  loading?: boolean
  searchParams: URLSearchParams
  onSearchSubmit: (value: string) => void
  onStylistChange: (value: string) => void
  onStudioChange: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
}

export function QualityCheckFilterBar({
  searchInputValue,
  stylistId,
  studioId,
  stylists,
  stylistsLoading,
  studios,
  studiosLoading,
  activeFilters,
  advancedFilterCount,
  loading,
  searchParams,
  onSearchSubmit,
  onStylistChange,
  onStudioChange,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
}: QualityCheckFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)
  const studioIdLabel = useId()

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit(draft)
  }

  const studioOptions = useMemo(
    () =>
      studios.map((s) => ({
        id: s._id,
        label: s.name || s.code || s._id,
      })),
    [studios]
  )

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:p-4">
      {/* Row 1 — search dominant */}
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
              placeholder="Search name, phone, or order…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search quality check orders"
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

      {/* Row 2 — compact secondary toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-[14rem] shrink-0">
          <StylistSearchSelect
            stylists={stylists}
            value={stylistId}
            onChange={onStylistChange}
            loading={stylistsLoading}
            disabled={loading}
          />
        </div>

        <label htmlFor={studioIdLabel} className="sr-only">
          Studio
        </label>
        <select
          id={studioIdLabel}
          aria-label="Studio"
          className={cn(compactSelectClass, "min-w-[9rem] max-w-[14rem]")}
          value={studioId}
          disabled={loading || studiosLoading}
          onChange={(e) => onStudioChange(e.target.value)}
        >
          <option value="">All studios</option>
          {studioOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={loading}
          onClick={() => onMoreFiltersOpenChange(true)}
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

      <QualityCheckActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <QualityCheckMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}

/** Count of advanced (More filters) params currently set. */
export function countAdvancedQualityCheckFilters(
  searchParams: URLSearchParams
): number {
  return MORE_QUALITY_CHECK_FILTER_KEYS.filter((key) =>
    Boolean(searchParams.get(key)?.trim())
  ).length
}
