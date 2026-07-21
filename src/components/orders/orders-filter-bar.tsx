"use client"

import { useEffect, useId, useMemo, useState, type FormEvent } from "react"
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { OrdersActiveFilters } from "@/components/orders/orders-active-filters"
import { OrdersMoreFilters } from "@/components/orders/orders-more-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MORE_ORDERS_FILTER_KEYS,
  ORDER_STATUS_FILTER_OPTIONS,
} from "@/config/orders-filters"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import type { StudioOption } from "@/lib/apollo/queries/studios"
import type { ActiveOrdersFilter } from "@/lib/orders/build-orders-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type OrdersFilterBarProps = {
  searchInputValue: string
  orderStatus: string
  stylistId: string
  studioId: string
  stylists: StylistOption[]
  stylistsLoading?: boolean
  studios: StudioOption[]
  studiosLoading?: boolean
  activeFilters: ActiveOrdersFilter[]
  advancedFilterCount: number
  loading?: boolean
  searchParams: URLSearchParams
  onSearchSubmit: (value: string) => void
  onOrderStatusChange: (value: string) => void
  onStylistChange: (value: string) => void
  onStudioChange: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
}

export function OrdersFilterBar({
  searchInputValue,
  orderStatus,
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
  onOrderStatusChange,
  onStylistChange,
  onStudioChange,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
}: OrdersFilterBarProps) {
  const router = useRouter()
  const [draft, setDraft] = useState(searchInputValue)
  const statusId = useId()
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
        <label htmlFor={statusId} className="sr-only">
          Order status
        </label>
        <select
          id={statusId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={orderStatus}
          disabled={loading}
          onChange={(e) => onOrderStatusChange(e.target.value)}
        >
          <option value="">All statuses</option>
          {ORDER_STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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
          variant="secondary"
          size="sm"
          className="h-8"
          onClick={() => router.push("/orders/form")}
        >
          <PlusIcon className="size-4" />
          Add order
        </Button>

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

      <OrdersActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <OrdersMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}

export function countAdvancedOrdersFiltersFromKeys(
  searchParams: URLSearchParams
): number {
  return MORE_ORDERS_FILTER_KEYS.filter((key) =>
    Boolean(searchParams.get(key)?.trim())
  ).length
}
