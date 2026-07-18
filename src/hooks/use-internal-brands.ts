"use client"

import { useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"

import {
  GET_ALL_INTERNAL_BRANDS,
  type GetAllInternalBrandsData,
  type InternalBrand,
} from "@/lib/apollo/queries/products"

export function useInternalBrands() {
  const [fetchBrands, { data, loading, error }] =
    useLazyQuery<GetAllInternalBrandsData>(GET_ALL_INTERNAL_BRANDS, {
      fetchPolicy: "cache-first",
    })

  useEffect(() => {
    void fetchBrands()
  }, [fetchBrands])

  const brands: InternalBrand[] = useMemo(
    () =>
      (data?.getAllInternalBrands ?? []).filter(
        (b) => b._id && !b.isDeleted
      ),
    [data?.getAllInternalBrands]
  )

  const brandNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const brand of brands) {
      map.set(brand._id, brand.title || brand.name || brand._id)
    }
    return map
  }, [brands])

  return { brands, brandNameById, loading, error }
}
