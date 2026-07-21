"use client"

import { useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"

import {
  GET_ALL_SECONDARY_COLORS,
  type GetAllSecondaryColorsData,
  type SecondaryColor,
} from "@/lib/apollo/queries/colors"

/** Shared secondary colors list — cache-first for order/product pickers. */
export function useAllSecondaryColors() {
  const [fetchColors, { data, loading, error }] =
    useLazyQuery<GetAllSecondaryColorsData>(GET_ALL_SECONDARY_COLORS, {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
    })

  useEffect(() => {
    void fetchColors()
  }, [fetchColors])

  const colors = useMemo(
    () =>
      (data?.getAllSecondaryColors ?? []).filter(
        (c): c is SecondaryColor & { colorname: string } =>
          Boolean(c?._id && c.colorname?.trim())
      ),
    [data?.getAllSecondaryColors]
  )

  const colorByName = useMemo(() => {
    const map = new Map<string, SecondaryColor>()
    for (const c of colors) {
      const name = c.colorname?.trim()
      if (!name) continue
      map.set(name.toLowerCase(), c)
    }
    return map
  }, [colors])

  return {
    colors,
    colorByName,
    loading,
    error,
  }
}
