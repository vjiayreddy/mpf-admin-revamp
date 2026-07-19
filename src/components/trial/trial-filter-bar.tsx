"use client"

import { useEffect, useState, type FormEvent } from "react"
import { FilterIcon, SearchIcon } from "lucide-react"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { TrialActiveFilters } from "@/components/trial/trial-active-filters"
import { TrialMoreFilters } from "@/components/trial/trial-more-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ActiveTrialFilter } from "@/lib/trial/build-trial-filter"
import type { StylistOption } from "@/lib/apollo/queries/stylists"

type TrialFilterBarProps = {
  searchInputValue: string
  stylistId: string
  stylists: StylistOption[]
  activeFilters: ActiveTrialFilter[]
  advancedFilterCount: number
  loading?: boolean
  onSearchSubmit: (value: string) => void
  onStylistChange: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
  searchParams: URLSearchParams
}

export function TrialFilterBar({
  searchInputValue,
  stylistId,
  stylists,
  activeFilters,
  advancedFilterCount,
  loading,
  onSearchSubmit,
  onStylistChange,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
  searchParams,
}: TrialFilterBarProps) {
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
      {/* Row 1 — search dominant (customers pattern) */}
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
              placeholder="Search order no, customer…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search trails"
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
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1 sm:max-w-xs">
          <StylistSearchSelect
            stylists={stylists}
            value={stylistId || ""}
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

      <TrialActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <TrialMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}
