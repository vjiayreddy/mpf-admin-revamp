"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT,
  EMBROIDERY_FILTER_PARAMS,
} from "@/config/embroidery-filters"
import { authClient } from "@/lib/auth-client"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import {
  buildEmbroideryQueryVars,
  getClearAllEmbroideryFilterUpdates,
  listActiveEmbroideryFilters,
} from "@/lib/embroidery/build-embroidery-filter"
import {
  EMBROIDERY_PAGE_SIZE,
  GET_EMBROIDERY_BY_FILTER,
  type EmbroideryListRow,
  type GetEmbroideryByFilterData,
  type GetEmbroideryByFilterVars,
} from "@/lib/apollo/queries/embroidery"
import { useAllStylists } from "@/hooks/use-all-stylists"

export function useEmbroideryList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists, loading: stylistsLoading } = useAllStylists(
    Boolean(session?.user)
  )

  const paramsKey = searchParams.toString()
  const pageParam = searchParams.get(EMBROIDERY_FILTER_PARAMS.page)
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
      buildEmbroideryQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        new URLSearchParams(paramsKey).get(EMBROIDERY_FILTER_PARAMS.stylistId) ||
          new URLSearchParams(paramsKey).get(EMBROIDERY_FILTER_PARAMS.userId)
          ? null
          : defaultStylistId
      ),
    [paramsKey, page, defaultStylistId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveEmbroideryFilters(
        new URLSearchParams(paramsKey),
        stylistNameById
      ),
    [paramsKey, stylistNameById]
  )

  const [fetchList, { data, loading, error }] = useLazyQuery<
    GetEmbroideryByFilterData,
    GetEmbroideryByFilterVars
  >(GET_EMBROIDERY_BY_FILTER, {
    fetchPolicy: "network-only",
  })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<EmbroideryListRow>>
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
        params.set(EMBROIDERY_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [EMBROIDERY_FILTER_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(getClearAllEmbroideryFilterUpdates())
  }, [setParams])

  useEffect(() => {
    const updates: Record<string, string | null> = {}
    // Migrate legacy listScope tabs → embStatus / orderStatus
    const legacyScope = searchParams.get("listScope")
    if (legacyScope) {
      updates.listScope = null
      if (legacyScope === "completed") {
        if (!searchParams.get(EMBROIDERY_FILTER_PARAMS.embStatus)) {
          updates[EMBROIDERY_FILTER_PARAMS.embStatus] = "COMPLETED"
        }
        if (!searchParams.get(EMBROIDERY_FILTER_PARAMS.orderStatus)) {
          updates[EMBROIDERY_FILTER_PARAMS.orderStatus] = "ALL"
        }
      } else if (legacyScope === "all") {
        if (!searchParams.get(EMBROIDERY_FILTER_PARAMS.orderStatus)) {
          updates[EMBROIDERY_FILTER_PARAMS.orderStatus] = "ALL"
        }
      }
    }
    if (pageParam === null) {
      updates[EMBROIDERY_FILTER_PARAMS.page] = "0"
    }
    if (
      !searchParams.get(EMBROIDERY_FILTER_PARAMS.orderStatus) &&
      updates[EMBROIDERY_FILTER_PARAMS.orderStatus] === undefined
    ) {
      updates[EMBROIDERY_FILTER_PARAMS.orderStatus] = DEFAULT_ORDER_STATUS
    }
    if (!searchParams.get(EMBROIDERY_FILTER_PARAMS.sortByEnum)) {
      updates[EMBROIDERY_FILTER_PARAMS.sortByEnum] = DEFAULT_SORT
    }
    if (
      defaultStylistId &&
      !searchParams.get(EMBROIDERY_FILTER_PARAMS.stylistId) &&
      !searchParams.get(EMBROIDERY_FILTER_PARAMS.userId)
    ) {
      updates[EMBROIDERY_FILTER_PARAMS.stylistId] = defaultStylistId
    }
    if (Object.keys(updates).length) {
      setParams(updates, false)
    }
  }, [pageParam, searchParams, defaultStylistId, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchList({ variables: gqlVars })
  }, [fetchList, page, gqlVars, session?.user])

  const serverRows = data?.getEmbroideryByFilter?.embroideries ?? []
  const totalCount = data?.getEmbroideryByFilter?.totalCount ?? 0

  const rows = useMemo(() => {
    if (!Object.keys(rowPatches).length) return serverRows
    return serverRows.map((row) => {
      const patch = rowPatches[row._id]
      return patch ? { ...row, ...patch } : row
    })
  }, [serverRows, rowPatches])

  const patchRow = useCallback(
    (id: string, patch: Partial<EmbroideryListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch },
      }))
    },
    []
  )

  const reload = useCallback(() => {
    if (!session?.user) return
    void fetchList({ variables: gqlVars })
  }, [fetchList, gqlVars, session?.user])

  return {
    rows,
    loading,
    error,
    totalCount,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: EMBROIDERY_PAGE_SIZE,
    setPage,
    setParams,
    clearFilter,
    clearAllFilters,
    activeFilters,
    stylists,
    stylistsLoading,
    searchTerm: searchParams.get(EMBROIDERY_FILTER_PARAMS.searchTerm) ?? "",
    stylistId: searchParams.get(EMBROIDERY_FILTER_PARAMS.stylistId) ?? "",
    orderStatus:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.orderStatus) ??
      DEFAULT_ORDER_STATUS,
    workType: searchParams.get(EMBROIDERY_FILTER_PARAMS.workType) ?? "",
    sortByEnum:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.sortByEnum) ?? DEFAULT_SORT,
    startEmbTrialDate:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.startEmbTrialDate) ?? "",
    endEmbTrialDate:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.endEmbTrialDate) ?? "",
    approvalStatus:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.approvalStatus) ?? "",
    embStatus: searchParams.get(EMBROIDERY_FILTER_PARAMS.embStatus) ?? "",
    markingStatus:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.markingStatus) ?? "",
    qcStatus: searchParams.get(EMBROIDERY_FILTER_PARAMS.qcStatus) ?? "",
    sampleStatus:
      searchParams.get(EMBROIDERY_FILTER_PARAMS.sampleStatus) ?? "",
    userId: searchParams.get(EMBROIDERY_FILTER_PARAMS.userId) ?? "",
    patchRow,
    reload,
  }
}
