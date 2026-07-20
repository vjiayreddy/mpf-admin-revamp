"use client"

import { useMemo } from "react"
import { useQuery } from "@apollo/client/react"

import {
  GET_EMBROIDERY_AREA_MAPPING,
  type GetEmbroideryAreaMappingData,
  type GetEmbroideryAreaMappingVars,
} from "@/lib/apollo/queries/embroidery"
import { formatEmbroideryAreasToProduceOptions } from "@/lib/embroidery/ops-form"

export function useEmbroideryAreaMapping(
  catId: string | null | undefined,
  enabled = true
) {
  const skip = !enabled || !catId

  const { data, loading, error } = useQuery<
    GetEmbroideryAreaMappingData,
    GetEmbroideryAreaMappingVars
  >(GET_EMBROIDERY_AREA_MAPPING, {
    skip,
    fetchPolicy: "cache-first",
    variables: { catId: catId ?? "" },
  })

  const options = useMemo(
    () => formatEmbroideryAreasToProduceOptions(data),
    [data]
  )

  return {
    options,
    loading: skip ? false : loading,
    error,
  }
}
