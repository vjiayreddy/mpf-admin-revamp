"use client"

import { useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"

import {
  GET_ALL_STUDIOS,
  type GetAllStudiosData,
  type StudioOption,
} from "@/lib/apollo/queries/studios"

/** Shared studios list — cache-first so filters/chips stay cheap. */
export function useAllStudios() {
  const [fetchStudios, { data, loading, error }] = useLazyQuery<GetAllStudiosData>(
    GET_ALL_STUDIOS,
    {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
    }
  )

  useEffect(() => {
    void fetchStudios()
  }, [fetchStudios])

  const studios = data?.getAllStudios ?? []

  const studioNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const studio of studios) {
      if (!studio?._id) continue
      const label =
        studio.name?.trim() ||
        studio.code?.trim() ||
        studio._id
      map.set(studio._id, label)
    }
    return map
  }, [studios])

  return {
    studios: studios as StudioOption[],
    studioNameById,
    loading,
    error,
  }
}
