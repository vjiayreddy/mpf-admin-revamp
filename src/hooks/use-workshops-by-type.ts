"use client"

import { useQuery } from "@apollo/client/react"

import {
  GET_WORKSHOPS_BY_FILTER,
  type GetWorkshopsByFilterData,
  type GetWorkshopsByFilterVars,
  type WorkshopOption,
} from "@/lib/apollo/queries/workshops"

/** Load workshops for a given type (e.g. STITCHING), matching legacy Autocomplete. */
export function useWorkshopsByType(
  workshopType: string | null | undefined,
  enabled = true
) {
  const skip = !enabled || !workshopType

  const { data, loading, error } = useQuery<
    GetWorkshopsByFilterData,
    GetWorkshopsByFilterVars
  >(GET_WORKSHOPS_BY_FILTER, {
    skip,
    fetchPolicy: "cache-first",
    variables: {
      filter: {
        workshopType: workshopType ?? undefined,
      },
      page: 0,
      limit: 500,
    },
  })

  const workshops = (data?.getWorkshopsByFilter?.workshops ?? []).filter(
    (w) => w && !w.isDeleted
  ) as WorkshopOption[]

  return {
    workshops,
    loading: skip ? false : loading,
    error,
  }
}
