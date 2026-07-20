"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  CLIENT_CONNECT_FILTER_PARAMS,
  CLIENT_CONNECT_MORE_FILTER_KEYS,
  DEFAULT_CC_TYPE,
} from "@/config/client-connect-filters"
import {
  MORE_FILTER_KEYS,
  type SearchType,
} from "@/config/customer-filters"
import { authClient } from "@/lib/auth-client"
import {
  buildClientConnectFilterFromSearchParams,
  countAdvancedClientConnectFilters,
  getCcTypeFromSearchParams,
  getClearAllClientConnectFilterUpdates,
  getStudioIdFromSearchParams,
  listActiveClientConnectFilters,
} from "@/lib/client-connect/build-filter"
import { useAllStudios } from "@/hooks/use-all-studios"
import {
  CLIENT_CONNECT_PAGE_LIMIT,
  GET_CLIENT_CONNECT_BY_FILTER,
  type ClientConnectListRow,
  type GetClientConnectByFilterData,
  type GetClientConnectByFilterVars,
} from "@/lib/apollo/queries/client-connect"

function parseTeamsRoleFilter(teamsJson: string | null | undefined): unknown[] {
  if (!teamsJson) return []
  try {
    const teams = JSON.parse(teamsJson) as unknown
    if (Array.isArray(teams) && teams.length > 0) {
      return [teams[0]]
    }
  } catch {
    // ignore
  }
  return []
}

export function useClientConnectList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchType = (searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.searchType) ||
    "default") as SearchType
  const searchTerm =
    searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.searchTerm) ?? ""
  const customerSrNo =
    searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.customerSrNo) ?? ""
  const isClient =
    (searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.isClient) ?? "true") ===
    "true"
  const sortByEnum =
    searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.sortByEnum) ||
    "REGISTERED_DATE"
  const ccType = getCcTypeFromSearchParams(new URLSearchParams(paramsKey))
  const studioId = getStudioIdFromSearchParams(new URLSearchParams(paramsKey))

  const sessionRoleFilter = useMemo(
    () => parseTeamsRoleFilter(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const { studioNameById } = useAllStudios()

  const gqlFilter = useMemo(
    () =>
      buildClientConnectFilterFromSearchParams(
        new URLSearchParams(paramsKey),
        sessionRoleFilter
      ),
    [paramsKey, sessionRoleFilter]
  )

  const activeFilters = useMemo(
    () =>
      listActiveClientConnectFilters(new URLSearchParams(paramsKey), {
        studioNameById,
      }),
    [paramsKey, studioNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedClientConnectFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchRows, { data, loading, error }] = useLazyQuery<
    GetClientConnectByFilterData,
    GetClientConnectByFilterVars
  >(GET_CLIENT_CONNECT_BY_FILTER, {
    fetchPolicy: "cache-and-network",
  })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<ClientConnectListRow>>
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
        params.set(CLIENT_CONNECT_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [CLIENT_CONNECT_FILTER_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  const setSearchType = useCallback(
    (next: SearchType) => {
      setParams({
        [CLIENT_CONNECT_FILTER_PARAMS.searchType]:
          next === "default" ? null : next,
        [CLIENT_CONNECT_FILTER_PARAMS.searchTerm]: null,
        [CLIENT_CONNECT_FILTER_PARAMS.customerSrNo]: null,
      })
    },
    [setParams]
  )

  const setIsClient = useCallback(
    (next: boolean) => {
      setParams({
        [CLIENT_CONNECT_FILTER_PARAMS.isClient]: next ? null : "false",
      })
    },
    [setParams]
  )

  const setSortByEnum = useCallback(
    (next: string) => {
      setParams({
        [CLIENT_CONNECT_FILTER_PARAMS.sortByEnum]:
          next === "REGISTERED_DATE" ? null : next,
      })
    },
    [setParams]
  )

  const setCcType = useCallback(
    (next: string) => {
      setParams({
        [CLIENT_CONNECT_FILTER_PARAMS.ccType]:
          next === DEFAULT_CC_TYPE ? null : next,
      })
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (searchType === "cusId") {
        setParams({
          [CLIENT_CONNECT_FILTER_PARAMS.customerSrNo]: trimmed || null,
          [CLIENT_CONNECT_FILTER_PARAMS.searchTerm]: null,
        })
        return
      }
      setParams({
        [CLIENT_CONNECT_FILTER_PARAMS.searchTerm]: trimmed || null,
        [CLIENT_CONNECT_FILTER_PARAMS.customerSrNo]: null,
      })
    },
    [searchType, setParams]
  )

  const applyMoreFilters = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearMoreFilters = useCallback(() => {
    const updates: Record<string, string | null> = {}
    for (const key of MORE_FILTER_KEYS) {
      updates[key] = null
    }
    for (const key of CLIENT_CONNECT_MORE_FILTER_KEYS) {
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
    setParams(getClearAllClientConnectFilterUpdates())
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [CLIENT_CONNECT_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchRows({
      variables: {
        page: page + 1,
        limit: CLIENT_CONNECT_PAGE_LIMIT,
        ccType,
        studioId: studioId || undefined,
        filter: gqlFilter,
      },
    })
  }, [fetchRows, page, gqlFilter, session?.user, ccType, studioId])

  const serverRows: ClientConnectListRow[] =
    data?.getClientConnectByFilter ?? []

  const rows: ClientConnectListRow[] = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row._id]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

  const searchInputValue = searchType === "cusId" ? customerSrNo : searchTerm

  const reload = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    setRowPatches({})
    void fetchRows({
      variables: {
        page: page + 1,
        limit: CLIENT_CONNECT_PAGE_LIMIT,
        ccType,
        studioId: studioId || undefined,
        filter: gqlFilter,
      },
    })
  }, [fetchRows, page, gqlFilter, session?.user, ccType, studioId])

  const patchRow = useCallback(
    (userId: string, patch: Partial<ClientConnectListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: CLIENT_CONNECT_PAGE_LIMIT,
    searchType,
    searchInputValue,
    isClient,
    sortByEnum,
    ccType,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchType,
    setIsClient,
    setSortByEnum,
    setCcType,
    setSearchQuery,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reload,
    patchRow,
  }
}
