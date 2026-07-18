"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  MORE_PRODUCT_FILTER_KEYS,
  PRODUCT_FILTER_PARAMS,
} from "@/config/product-filters"
import { useInternalBrands } from "@/hooks/use-internal-brands"
import { authClient } from "@/lib/auth-client"
import {
  buildProductsQueryVars,
  countAdvancedProductFilters,
  getClearAllProductFilterUpdates,
  getClearMoreProductFilterUpdates,
  listActiveProductFilters,
} from "@/lib/products/build-products-filter"
import {
  GET_PRODUCTS_FILTER,
  PRODUCTS_PAGE_LIMIT,
  type ProductListRow,
  type ProductsFilterData,
  type ProductsFilterVars,
} from "@/lib/apollo/queries/products"

export function useProductsList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { brands, brandNameById } = useInternalBrands()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(PRODUCT_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(PRODUCT_FILTER_PARAMS.searchTerm) ?? ""
  const status = searchParams.get(PRODUCT_FILTER_PARAMS.status) ?? ""
  const internalBrand =
    searchParams.get(PRODUCT_FILTER_PARAMS.internalBrand) ?? ""
  const catId = searchParams.get(PRODUCT_FILTER_PARAMS.catId) ?? ""

  const gqlVars = useMemo(
    () =>
      buildProductsQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0
      ),
    [paramsKey, page]
  )

  const activeFilters = useMemo(
    () =>
      listActiveProductFilters(new URLSearchParams(paramsKey), {
        brandNameById,
      }),
    [paramsKey, brandNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedProductFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchProducts, { data, loading, error }] = useLazyQuery<
    ProductsFilterData,
    ProductsFilterVars
  >(GET_PRODUCTS_FILTER, {
    fetchPolicy: "network-only",
  })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<ProductListRow>>
  >({})

  useEffect(() => {
    setRowPatches({})
  }, [paramsKey])

  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      if (resetPage) {
        params.set(PRODUCT_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [PRODUCT_FILTER_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [PRODUCT_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const setStatus = useCallback(
    (value: string) => {
      setParams({
        [PRODUCT_FILTER_PARAMS.status]:
          !value || value === "all" || value === "ALL" ? null : value,
      })
    },
    [setParams]
  )

  const setInternalBrand = useCallback(
    (value: string) => {
      setParams({
        [PRODUCT_FILTER_PARAMS.internalBrand]:
          !value || value === "all" ? null : value,
      })
    },
    [setParams]
  )

  const applyMoreFilters = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearMoreFilters = useCallback(() => {
    setParams(getClearMoreProductFilterUpdates())
  }, [setParams])

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(getClearAllProductFilterUpdates())
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [PRODUCT_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchProducts({ variables: gqlVars })
  }, [fetchProducts, page, gqlVars, session?.user])

  const serverRows = data?.productsFilter?.products ?? []
  const totalCount = data?.productsFilter?.totalItemCount ?? 0

  const rows: ProductListRow[] = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row._id]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

  const reloadProducts = useCallback(
    (opts?: { preservePatches?: boolean }) => {
      if (!Number.isInteger(page) || page < 0) return
      if (!session?.user) return
      if (!opts?.preservePatches) {
        setRowPatches({})
      }
      void fetchProducts({ variables: gqlVars })
    },
    [fetchProducts, page, gqlVars, session?.user]
  )

  const patchProductRow = useCallback(
    (productId: string, patch: Partial<ProductListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    totalCount,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: PRODUCTS_PAGE_LIMIT,
    searchInputValue: searchTerm,
    status,
    internalBrand,
    catId,
    brands,
    activeFilters,
    advancedFilterCount,
    searchParams,
    moreFilterKeys: MORE_PRODUCT_FILTER_KEYS,
    setPage,
    setSearchQuery,
    setStatus,
    setInternalBrand,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadProducts,
    patchProductRow,
  }
}
