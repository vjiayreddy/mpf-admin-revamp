"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react"

import { ProductsActiveFilters } from "@/components/products/products-active-filters"
import { ProductsMoreFilters } from "@/components/products/products-more-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PRODUCT_STATUS_OPTIONS } from "@/config/product-filters"
import type { InternalBrand } from "@/lib/apollo/queries/products"
import type { ActiveProductFilter } from "@/lib/products/build-products-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type ProductsFilterBarProps = {
  searchInputValue: string
  status: string
  internalBrand: string
  brands: InternalBrand[]
  activeFilters: ActiveProductFilter[]
  advancedFilterCount: number
  loading?: boolean
  onSearchSubmit: (value: string) => void
  onStatusChange: (value: string) => void
  onInternalBrandChange: (value: string) => void
  moreFiltersOpen: boolean
  onMoreFiltersOpenChange: (open: boolean) => void
  onApplyMoreFilters: (updates: Record<string, string | null>) => void
  onClearMoreFilters: () => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
  searchParams: URLSearchParams
}

export function ProductsFilterBar({
  searchInputValue,
  status,
  internalBrand,
  brands,
  activeFilters,
  advancedFilterCount,
  loading,
  onSearchSubmit,
  onStatusChange,
  onInternalBrandChange,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  onApplyMoreFilters,
  onClearMoreFilters,
  onClearFilter,
  onClearAllFilters,
  searchParams,
}: ProductsFilterBarProps) {
  const router = useRouter()
  const [draft, setDraft] = useState(searchInputValue)
  const statusId = useId()
  const brandId = useId()

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
              placeholder="Search products…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search products"
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
          Status
        </label>
        <select
          id={statusId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={status || "all"}
          disabled={loading}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Status: All</option>
          {PRODUCT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Status: {opt.label}
            </option>
          ))}
        </select>

        <label htmlFor={brandId} className="sr-only">
          Brand
        </label>
        <select
          id={brandId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={internalBrand || "all"}
          disabled={loading}
          onChange={(e) => onInternalBrandChange(e.target.value)}
        >
          <option value="all">Brand: All</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>
              Brand: {brand.title || brand.name || brand._id}
            </option>
          ))}
        </select>

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
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {advancedFilterCount}
            </Badge>
          ) : null}
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8"
          onClick={() => router.push("/products/form")}
        >
          <PlusIcon className="size-4" />
          Add product
        </Button>
      </div>

      <ProductsActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <ProductsMoreFilters
        open={moreFiltersOpen}
        onOpenChange={onMoreFiltersOpenChange}
        searchParams={searchParams}
        onApply={onApplyMoreFilters}
        onClear={onClearMoreFilters}
      />
    </div>
  )
}
