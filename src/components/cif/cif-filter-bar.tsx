"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react"
import Link from "next/link"

import { CifActiveFilters } from "@/components/cif/cif-active-filters"
import { CifMoreFilters } from "@/components/cif/cif-more-filters"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CIF_STATUS_OPTIONS } from "@/config/cif-filters"
import { useAllStylists } from "@/hooks/use-all-stylists"
import type { ActiveCifFilter } from "@/lib/cif/build-cif-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type CifFilterBarProps = {
  searchInputValue: string
  status: string
  stylistId: string
  activeFilters: ActiveCifFilter[]
  advancedFilterCount: number
  loading?: boolean
  addHref: string
  onSearchSubmit: (value: string) => void
  onStatusChange: (value: string) => void
  onStylistChange: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
  searchParams: URLSearchParams
}

export function CifFilterBar({
  searchInputValue,
  status,
  stylistId,
  activeFilters,
  advancedFilterCount,
  loading,
  addHref,
  onSearchSubmit,
  onStatusChange,
  onStylistChange,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
  searchParams,
}: CifFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)
  const statusId = useId()
  const { stylists, loading: stylistsLoading } = useAllStylists()

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
              placeholder="Search name, phone, or email…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search CIF records"
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
        <Button
          type="button"
          className="h-9 shrink-0 sm:px-4"
          nativeButton={false}
          render={<Link href={addHref} />}
        >
          <PlusIcon className="size-4" />
          Add CIF
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={statusId} className="sr-only">
          Status filter
        </label>
        <select
          id={statusId}
          className={cn(compactSelectClass, "min-w-[9rem]")}
          value={status || "all"}
          disabled={loading}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Status: All</option>
          {CIF_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Status: {opt.label}
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

      <CifActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <CifMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}
