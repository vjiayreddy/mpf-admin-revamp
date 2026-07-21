"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { DownloadIcon, FilterIcon, PlusIcon, SearchIcon } from "lucide-react"

import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog"
import { CustomerExportDialog } from "@/components/customers/customer-export-dialog"
import { CustomersActiveFilters } from "@/components/customers/customers-active-filters"
import { CustomersMoreFilters } from "@/components/customers/customers-more-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SEARCH_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  type SearchType,
} from "@/config/customer-filters"
import type { ActiveCustomerFilter } from "@/lib/customers/build-users-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type CustomersFilterBarProps = {
  searchType: SearchType
  searchInputValue: string
  isClient: boolean
  sortByEnum: string
  activeFilters: ActiveCustomerFilter[]
  advancedFilterCount: number
  loading?: boolean
  onSearchTypeChange: (value: SearchType) => void
  onIsClientChange: (value: boolean) => void
  onSortByChange: (value: string) => void
  onSearchSubmit: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
  onCustomerCreated?: (userId: string) => void
  /** When false, hides Add customer. Defaults to true. */
  showCreateCustomer?: boolean
  searchParams: URLSearchParams
}

export function CustomersFilterBar({
  searchType,
  searchInputValue,
  isClient,
  sortByEnum,
  activeFilters,
  advancedFilterCount,
  loading,
  onSearchTypeChange,
  onIsClientChange,
  onSortByChange,
  onSearchSubmit,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
  onCustomerCreated,
  showCreateCustomer = true,
  searchParams,
}: CustomersFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)
  const [createOpen, setCreateOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const searchTypeId = useId()
  const clientId = useId()
  const sortId = useId()

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit(draft)
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:p-4">
      {/* Row 1 — search dominant */}
      <form
        onSubmit={submit}
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <div className="border-input flex min-w-0 flex-1 overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <label htmlFor={searchTypeId} className="sr-only">
            Search type
          </label>
          <select
            id={searchTypeId}
            value={searchType}
            disabled={loading}
            onChange={(e) => onSearchTypeChange(e.target.value as SearchType)}
            className="border-input bg-muted/40 text-foreground h-9 shrink-0 border-0 border-r px-2 text-sm outline-none disabled:opacity-50"
          >
            {SEARCH_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === "default" ? "Name" : "Cus. ID"}
              </option>
            ))}
          </select>
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                searchType === "cusId"
                  ? "Search by customer ID…"
                  : "Search name, phone, or email…"
              }
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search customers"
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
        <label htmlFor={clientId} className="sr-only">
          Client filter
        </label>
        <select
          id={clientId}
          className={compactSelectClass}
          value={isClient ? "true" : "false"}
          disabled={loading}
          onChange={(e) => onIsClientChange(e.target.value === "true")}
        >
          <option value="true">Client</option>
          <option value="false">Non client</option>
        </select>

        <label htmlFor={sortId} className="sr-only">
          Sort by
        </label>
        <select
          id={sortId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={sortByEnum}
          disabled={loading}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          {SORT_BY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setExportOpen(true)}
        >
          <DownloadIcon className="size-4" />
          Export
        </Button>

        {showCreateCustomer ? (
          <Button
            type="button"
            size="sm"
            className="h-8"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon className="size-4" />
            Add customer
          </Button>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
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

      <CustomersActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <CustomersMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />

      {showCreateCustomer ? (
        <CreateCustomerDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={onCustomerCreated}
        />
      ) : null}

      <CustomerExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        searchParams={searchParams}
      />
    </div>
  )
}
