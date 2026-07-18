"use client"

import { useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"

import {
  GET_ALL_OCCASIONS,
  type GetAllOccasionsData,
  type OccasionListItem,
} from "@/lib/apollo/queries/products"

export function useOccasions() {
  const [fetchOccasions, { data, loading, error }] =
    useLazyQuery<GetAllOccasionsData>(GET_ALL_OCCASIONS, {
      fetchPolicy: "cache-first",
    })

  useEffect(() => {
    void fetchOccasions()
  }, [fetchOccasions])

  const occasions: OccasionListItem[] = useMemo(
    () => data?.getAllOccasions ?? [],
    [data?.getAllOccasions]
  )

  return { occasions, loading, error }
}
