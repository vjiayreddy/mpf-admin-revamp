"use client"

import { useEffect, useState, type FormEvent } from "react"
import { FilterIcon, SearchIcon } from "lucide-react"

import { CustomersMoreFilters } from "@/components/customers/customers-more-filters"
import { FilterSelect } from "@/components/customers/filter-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SEARCH_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  type SearchType,
} from "@/config/customer-filters"

type CustomersFilterBarProps = {
  searchType: SearchType
  searchInputValue: string
  isClient: boolean
  sortByEnum: string
  activeFilterCount: number
  loading?: boolean
  onSearchTypeChange: (value: SearchType) => void
  onIsClientChange: (value: boolean) => void
  onSortByChange: (value: string) => void
  onSearchSubmit: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  searchParams: URLSearchParams
}

export function CustomersFilterBar({
  searchType,
  searchInputValue,
  isClient,
  sortByEnum,
  activeFilterCount,
  loading,
  onSearchTypeChange,
  onIsClientChange,
  onSortByChange,
  onSearchSubmit,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  searchParams,
}: CustomersFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit(draft)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Client"
          value={isClient ? "true" : "false"}
          onChange={(v) => onIsClientChange(v === "true")}
          options={[
            { value: "true", label: "Client" },
            { value: "false", label: "Non client" },
          ]}
          disabled={loading}
        />
        <FilterSelect
          label="Sort by"
          value={sortByEnum}
          onChange={onSortByChange}
          options={SORT_BY_OPTIONS}
          disabled={loading}
        />
        <FilterSelect
          label="Search type"
          value={searchType}
          onChange={(v) => onSearchTypeChange(v as SearchType)}
          options={SEARCH_TYPE_OPTIONS}
          disabled={loading}
        />
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onMoreFiltersOpenChange(true)}
          >
            <FilterIcon className="size-4" />
            More filters
            {activeFilterCount > 0 ? (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              searchType === "cusId"
                ? "Customer ID…"
                : "Search name, phone, email…"
            }
            className="pl-8"
            aria-label="Search customers"
            disabled={loading}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={loading}>
          Search
        </Button>
      </form>

      <CustomersMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}
