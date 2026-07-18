import {
  DEFAULT_PRODUCT_OCCASION_ID,
  MORE_PRODUCT_FILTER_KEYS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_FILTER_PARAMS,
  PRODUCT_STATUS_OPTIONS,
} from "@/config/product-filters"
import {
  PRODUCTS_PAGE_LIMIT,
  type ProductFilterInput,
  type ProductsFilterVars,
} from "@/lib/apollo/queries/products"

/**
 * Pure builder: URL search params → GraphQL ProductFilter input.
 * Always includes occasionId — the API rejects requests without it.
 */
export function buildProductsFilterFromSearchParams(
  searchParams: URLSearchParams
): ProductFilterInput {
  const p = PRODUCT_FILTER_PARAMS
  const filter: ProductFilterInput = {
    occasionId: DEFAULT_PRODUCT_OCCASION_ID,
  }

  const search = searchParams.get(p.searchTerm)?.trim()
  if (search) filter.adminSearchTerm = search

  const status = searchParams.get(p.status)
  if (status && status !== "all" && status !== "ALL") {
    filter.status = status
  }

  const catId = searchParams.get(p.catId)
  if (catId && catId !== "all") {
    filter.catIds = [catId]
  }

  const internalBrand = searchParams.get(p.internalBrand)
  if (internalBrand && internalBrand !== "all") {
    filter.internalBrandId = internalBrand
  }

  const occasionId = searchParams.get(p.occasionId)
  if (occasionId && occasionId !== "all") {
    filter.occasionId = occasionId
  }

  return filter
}

export function buildProductsQueryVars(
  searchParams: URLSearchParams,
  page0Based: number
): ProductsFilterVars {
  return {
    params: buildProductsFilterFromSearchParams(searchParams),
    page: page0Based + 1,
    limit: PRODUCTS_PAGE_LIMIT,
  }
}

export type ActiveProductFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value
}

export function listActiveProductFilters(
  searchParams: URLSearchParams,
  opts?: {
    brandNameById?: Map<string, string>
  }
): ActiveProductFilter[] {
  const p = PRODUCT_FILTER_PARAMS
  const chips: ActiveProductFilter[] = []

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) {
    chips.push({
      id: "searchTerm",
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const status = searchParams.get(p.status)
  if (status && status !== "all" && status !== "ALL") {
    chips.push({
      id: "status",
      label: "Status",
      displayValue: optionLabel(PRODUCT_STATUS_OPTIONS, status),
      clear: { [p.status]: null },
    })
  }

  const internalBrand = searchParams.get(p.internalBrand)
  if (internalBrand && internalBrand !== "all") {
    chips.push({
      id: "internalBrand",
      label: "Brand",
      displayValue:
        opts?.brandNameById?.get(internalBrand) ?? internalBrand,
      clear: { [p.internalBrand]: null },
    })
  }

  const catId = searchParams.get(p.catId)
  if (catId && catId !== "all") {
    chips.push({
      id: "catId",
      label: "Category",
      displayValue: optionLabel(PRODUCT_CATEGORY_OPTIONS, catId),
      clear: { [p.catId]: null },
    })
  }

  const occasionId = searchParams.get(p.occasionId)
  if (
    occasionId &&
    occasionId !== "all" &&
    occasionId !== DEFAULT_PRODUCT_OCCASION_ID
  ) {
    chips.push({
      id: "occasionId",
      label: "Occasion",
      displayValue: occasionId,
      clear: { [p.occasionId]: null },
    })
  }

  return chips
}

export function countAdvancedProductFilters(
  searchParams: URLSearchParams
): number {
  let count = 0
  for (const key of MORE_PRODUCT_FILTER_KEYS) {
    const value = searchParams.get(key)
    if (value && value !== "all") count += 1
  }
  return count
}

export function getClearAllProductFilterUpdates(): Record<string, null> {
  return {
    [PRODUCT_FILTER_PARAMS.searchTerm]: null,
    [PRODUCT_FILTER_PARAMS.status]: null,
    [PRODUCT_FILTER_PARAMS.internalBrand]: null,
    [PRODUCT_FILTER_PARAMS.catId]: null,
    [PRODUCT_FILTER_PARAMS.occasionId]: null,
  }
}

export function getClearMoreProductFilterUpdates(): Record<string, null> {
  const updates: Record<string, null> = {}
  for (const key of MORE_PRODUCT_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}
