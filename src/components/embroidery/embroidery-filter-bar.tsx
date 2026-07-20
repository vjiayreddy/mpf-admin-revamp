"use client"

import { useEffect, useId, useMemo, useState, type FormEvent } from "react"
import { FilterIcon, SearchIcon } from "lucide-react"

import { EmbroideryActiveFilters } from "@/components/embroidery/embroidery-active-filters"
import { EmbroideryMoreFiltersDialog } from "@/components/embroidery/embroidery-more-filters-dialog"
import {
  EmbStatusMultiSelect,
  parseEmbStatusParam,
} from "@/components/embroidery/emb-status-multi-select"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  EMBROIDERY_SORT_OPTIONS,
  MORE_EMBROIDERY_FILTER_KEYS,
} from "@/config/embroidery-filters"
import {
  EMB_ORDER_STATUS_OPTIONS,
  WORK_TYPE_OPTIONS,
} from "@/config/embroidery-status"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import type { ActiveEmbroideryFilter } from "@/lib/embroidery/build-embroidery-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type EmbroideryFilterBarProps = {
  searchInputValue: string
  stylistId: string
  orderStatus: string
  embStatus: string
  workType: string
  sortByEnum: string
  stylists: StylistOption[]
  stylistsLoading?: boolean
  activeFilters: ActiveEmbroideryFilter[]
  loading?: boolean
  searchParams: URLSearchParams
  onSearchSubmit: (value: string) => void
  onStylistChange: (value: string) => void
  onOrderStatusChange: (value: string) => void
  onEmbStatusChange: (values: string[]) => void
  onWorkTypeChange: (value: string) => void
  onSortChange: (value: string) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
}

export function EmbroideryFilterBar({
  searchInputValue,
  stylistId,
  orderStatus,
  embStatus,
  workType,
  sortByEnum,
  stylists,
  stylistsLoading,
  activeFilters,
  loading,
  searchParams,
  onSearchSubmit,
  onStylistChange,
  onOrderStatusChange,
  onEmbStatusChange,
  onWorkTypeChange,
  onSortChange,
  onApplyMoreFilters,
  onClearFilter,
  onClearAllFilters,
}: EmbroideryFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)
  const [moreOpen, setMoreOpen] = useState(false)
  const orderStatusId = useId()
  const workTypeId = useId()
  const sortId = useId()

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const embStatusValues = useMemo(
    () => parseEmbStatusParam(embStatus),
    [embStatus]
  )

  const advancedCount = useMemo(() => {
    let n = 0
    for (const key of MORE_EMBROIDERY_FILTER_KEYS) {
      if (searchParams.get(key)) n += 1
    }
    return n
  }, [searchParams])

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
              placeholder="Search emb no, product, customer…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search embroidery"
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

        <label htmlFor={orderStatusId} className="sr-only">
          Order status
        </label>
        <select
          id={orderStatusId}
          className={cn(compactSelectClass, "min-w-[9rem]")}
          value={orderStatus}
          onChange={(e) => onOrderStatusChange(e.target.value)}
          disabled={loading}
        >
          {EMB_ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <EmbStatusMultiSelect
          value={embStatusValues}
          onChange={onEmbStatusChange}
          disabled={loading}
        />

        <label htmlFor={workTypeId} className="sr-only">
          Work type
        </label>
        <select
          id={workTypeId}
          className={cn(compactSelectClass, "min-w-[8rem]")}
          value={workType || ""}
          onChange={(e) => onWorkTypeChange(e.target.value)}
          disabled={loading}
        >
          <option value="">Work type</option>
          {WORK_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label htmlFor={sortId} className="sr-only">
          Sort by
        </label>
        <select
          id={sortId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={sortByEnum}
          onChange={(e) => onSortChange(e.target.value)}
          disabled={loading}
        >
          {EMBROIDERY_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setMoreOpen(true)}
          disabled={loading}
        >
          <FilterIcon className="size-4" />
          More filters
          {advancedCount > 0 ? (
            <Badge variant="secondary" className="ml-0.5">
              {advancedCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      <EmbroideryActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <EmbroideryMoreFiltersDialog
        open={moreOpen}
        onOpenChange={setMoreOpen}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={() => undefined}
      />
    </div>
  )
}
