"use client"

import { useEffect, useId, useMemo, useState, type FormEvent } from "react"
import { SearchIcon } from "lucide-react"

import { EmbroideryActiveFilters } from "@/components/embroidery/embroidery-active-filters"
import {
  EmbStatusMultiSelect,
  parseEmbStatusParam,
} from "@/components/embroidery/emb-status-multi-select"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EMBROIDERY_SORT_OPTIONS } from "@/config/embroidery-filters"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import type { ActiveEmbroideryFilter } from "@/lib/embroidery/build-embroidery-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type EmbroideryCalendarFiltersBarProps = {
  sortByEnum: string
  stylistId: string
  searchTerm: string
  embStatus: string
  orderCount: number
  loading?: boolean
  stylists: StylistOption[]
  stylistsLoading?: boolean
  activeFilters: ActiveEmbroideryFilter[]
  onSortByChange: (value: string) => void
  onStylistChange: (value: string) => void
  onSearchChange: (value: string) => void
  onEmbStatusChange: (values: string[]) => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
}

export function EmbroideryCalendarFiltersBar({
  sortByEnum,
  stylistId,
  searchTerm,
  embStatus,
  orderCount,
  loading,
  stylists,
  stylistsLoading,
  activeFilters,
  onSortByChange,
  onStylistChange,
  onSearchChange,
  onEmbStatusChange,
  onClearFilter,
  onClearAllFilters,
}: EmbroideryCalendarFiltersBarProps) {
  const [draft, setDraft] = useState(searchTerm)
  const sortId = useId()

  useEffect(() => {
    setDraft(searchTerm)
  }, [searchTerm])

  const embStatusValues = useMemo(
    () => parseEmbStatusParam(embStatus),
    [embStatus]
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSearchChange(draft)
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
              placeholder="Search…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search embroidery calendar"
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
        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <StylistSearchSelect
            stylists={stylists}
            value={stylistId}
            onChange={onStylistChange}
            loading={stylistsLoading}
            disabled={loading}
          />
        </div>

        <EmbStatusMultiSelect
          value={embStatusValues}
          onChange={onEmbStatusChange}
          disabled={loading}
        />

        <label htmlFor={sortId} className="sr-only">
          Date field
        </label>
        <select
          id={sortId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={sortByEnum}
          onChange={(e) => onSortByChange(e.target.value)}
          disabled={loading}
        >
          {EMBROIDERY_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Date: {o.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <p className="text-muted-foreground text-xs">{orderCount} loaded</p>
      </div>

      <EmbroideryActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />
    </div>
  )
}
