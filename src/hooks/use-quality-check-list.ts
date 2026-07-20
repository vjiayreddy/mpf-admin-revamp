"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  QUALITY_CHECK_PAGE_SIZE,
  QUALITY_CHECK_PARAMS,
} from "@/config/quality-check-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  buildQualityCheckQueryVars,
  getClearAllQualityCheckFilterUpdates,
  listActiveQualityCheckFilters,
} from "@/lib/quality-check/build-quality-check-filter"
import {
  GET_QUALITY_CHECK_ORDERS_LIST,
  type GetAllStoreOrdersVars,
  type GetQualityCheckOrdersListData,
  type QualityCheckOrderRow,
} from "@/lib/apollo/queries/store-orders"

export function useQualityCheckList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists, loading: stylistsLoading } = useAllStylists(
    Boolean(session?.user)
  )
  const { studios, studioNameById, loading: studiosLoading } = useAllStudios()

  const paramsKey = searchParams.toString()
  const pageParam = searchParams.get(QUALITY_CHECK_PARAMS.page)
  const page =
    pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN

  const defaultStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const gqlVars = useMemo(
    () =>
      buildQualityCheckQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        defaultStylistId
      ),
    [paramsKey, page, defaultStylistId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveQualityCheckFilters(
        new URLSearchParams(paramsKey),
        stylistNameById,
        studioNameById
      ),
    [paramsKey, stylistNameById, studioNameById]
  )

  const [fetchList, { data, loading, error }] = useLazyQuery<
    GetQualityCheckOrdersListData,
    GetAllStoreOrdersVars
  >(GET_QUALITY_CHECK_ORDERS_LIST, {
    fetchPolicy: "network-only",
  })

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
      if (resetPage) params.set(QUALITY_CHECK_PARAMS.page, "0")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) {
      setParams({ [QUALITY_CHECK_PARAMS.page]: "0" }, false)
      return
    }
    void fetchList({ variables: gqlVars })
  }, [fetchList, gqlVars, page, setParams])

  const rows: QualityCheckOrderRow[] = data?.getAllStoreOrders ?? []
  const pageSize = QUALITY_CHECK_PAGE_SIZE
  const hasNextPage = rows.length >= pageSize
  const currentPage = Number.isInteger(page) && page >= 0 ? page : 0

  return {
    rows,
    loading,
    error,
    currentPage,
    pageSize,
    hasNextPage,
    totalEstimate:
      currentPage * pageSize + rows.length + (hasNextPage ? 1 : 0),
    searchTerm: searchParams.get(QUALITY_CHECK_PARAMS.searchTerm) ?? "",
    stylistId: searchParams.get(QUALITY_CHECK_PARAMS.stylistId) ?? "",
    studioId: searchParams.get(QUALITY_CHECK_PARAMS.studioId) ?? "",
    stylists,
    stylistsLoading,
    studios,
    studiosLoading,
    activeFilters,
    setParams,
    clearAllFilters: () => setParams(getClearAllQualityCheckFilterUpdates()),
    goToPage: (next: number) =>
      setParams({ [QUALITY_CHECK_PARAMS.page]: String(Math.max(0, next)) }, false),
  }
}
