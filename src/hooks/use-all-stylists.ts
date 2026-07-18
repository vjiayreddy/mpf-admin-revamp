"use client"

import { useQuery } from "@apollo/client/react"

import {
  GET_ALL_STYLISTS,
  type GetAllStylistsData,
  type StylistOption,
} from "@/lib/apollo/queries/stylists"

export function useAllStylists(enabled = true) {
  const { data, loading, error } = useQuery<GetAllStylistsData>(
    GET_ALL_STYLISTS,
    {
      skip: !enabled,
      fetchPolicy: "cache-first",
    }
  )

  return {
    stylists: (data?.getAllStylists ?? []) as StylistOption[],
    loading,
    error,
  }
}
