"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  CIF_FILTER_PARAMS,
  MORE_CIF_FILTER_KEYS,
} from "@/config/cif-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { authClient } from "@/lib/auth-client"
import {
  buildCifFilterFromSearchParams,
  countAdvancedCifFilters,
  getClearAllCifFilterUpdates,
  listActiveCifFilters,
  personalStylistIdFromTeamsJson,
} from "@/lib/cif/build-cif-filter"
import {
  CIF_PAGE_LIMIT,
  GET_ALL_CIF_LIST,
  type GetAllCifListData,
  type GetAllCifListVars,
} from "@/lib/apollo/queries/cif"

export type UseCifListOptions = {
  /** When set, always filter by this user and keep it scoped on clear-all. */
  lockedUserId?: string
}

export function useCifList(options?: UseCifListOptions) {
  const lockedUserId = options?.lockedUserId
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(CIF_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm = searchParams.get(CIF_FILTER_PARAMS.searchTerm) ?? ""
  const status =
    searchParams.get(CIF_FILTER_PARAMS.customerInfoStatus) ?? ""
  const stylistId = searchParams.get(CIF_FILTER_PARAMS.stylistId) ?? ""

  const defaultStylistId = useMemo(() => {
    if (lockedUserId) return null
    return personalStylistIdFromTeamsJson(session?.user?.teamsJson)
  }, [lockedUserId, session?.user?.teamsJson])

  const { studioNameById } = useAllStudios()
  const { stylists } = useAllStylists()

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const gqlFilter = useMemo(() => {
    const params = new URLSearchParams(paramsKey)
    if (lockedUserId) {
      params.set(CIF_FILTER_PARAMS.userId, lockedUserId)
    }
    return buildCifFilterFromSearchParams(params, defaultStylistId)
  }, [paramsKey, defaultStylistId, lockedUserId])

  const activeFilters = useMemo(
    () =>
      listActiveCifFilters(new URLSearchParams(paramsKey), {
        studioNameById,
        stylistNameById,
        hideUserIdChip: Boolean(lockedUserId),
      }),
    [paramsKey, studioNameById, stylistNameById, lockedUserId]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedCifFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchCifList, { data, loading, error }] = useLazyQuery<
    GetAllCifListData,
    GetAllCifListVars
  >(GET_ALL_CIF_LIST, {
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
      if (lockedUserId) {
        params.set(CIF_FILTER_PARAMS.userId, lockedUserId)
      }
      if (resetPage) {
        params.set(CIF_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams, lockedUserId]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [CIF_FILTER_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [CIF_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const setStatus = useCallback(
    (value: string) => {
      setParams({
        [CIF_FILTER_PARAMS.customerInfoStatus]:
          !value || value === "all" ? null : value,
      })
    },
    [setParams]
  )

  const setStylistId = useCallback(
    (value: string) => {
      setParams({
        [CIF_FILTER_PARAMS.stylistId]: value || null,
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
    const updates: Record<string, string | null> = {}
    for (const key of MORE_CIF_FILTER_KEYS) {
      updates[key] = null
    }
    setParams(updates)
  }, [setParams])

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(
      getClearAllCifFilterUpdates({
        preserveUserId: Boolean(lockedUserId),
      })
    )
  }, [setParams, lockedUserId])

  useEffect(() => {
    const updates: Record<string, string | null> = {}
    let needsUpdate = false

    if (pageParam === null) {
      updates[CIF_FILTER_PARAMS.page] = "0"
      needsUpdate = true
    }

    if (
      lockedUserId &&
      searchParams.get(CIF_FILTER_PARAMS.userId) !== lockedUserId
    ) {
      updates[CIF_FILTER_PARAMS.userId] = lockedUserId
      needsUpdate = true
    }

    if (needsUpdate) {
      setParams(updates, false)
    }
  }, [pageParam, setParams, lockedUserId, searchParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    if (lockedUserId && !gqlFilter.userId) return

    void fetchCifList({
      variables: {
        page: page + 1,
        limit: CIF_PAGE_LIMIT,
        filter: gqlFilter,
      },
    })
  }, [fetchCifList, page, gqlFilter, session?.user, lockedUserId])

  const rows = data?.getAllCustomerInformationList?.customers ?? []
  const totalCount = data?.getAllCustomerInformationList?.totalCount ?? 0

  const reloadCifList = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    if (lockedUserId && !gqlFilter.userId) return
    void fetchCifList({
      variables: {
        page: page + 1,
        limit: CIF_PAGE_LIMIT,
        filter: gqlFilter,
      },
    })
  }, [fetchCifList, page, gqlFilter, session?.user, lockedUserId])

  return {
    rows,
    totalCount,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: CIF_PAGE_LIMIT,
    searchInputValue: searchTerm,
    status,
    stylistId,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery,
    setStatus,
    setStylistId,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadCifList,
  }
}
