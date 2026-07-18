"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  CUSTOMER_FILTER_PARAMS,
  MORE_FILTER_KEYS,
  type SearchType,
} from "@/config/customer-filters"
import { authClient } from "@/lib/auth-client"
import {
  buildUsersFilterFromSearchParams,
  countAdvancedCustomerFilters,
  getClearAllCustomerFilterUpdates,
  listActiveCustomerFilters,
} from "@/lib/customers/build-users-filter"
import {
  CUSTOMERS_PAGE_LIMIT,
  GET_USERS_BY_FILTER,
  type CustomerListRow,
  type GetUsersByFilterData,
  type GetUsersByFilterVars,
} from "@/lib/apollo/queries/users"

function parseTeamsRoleFilter(teamsJson: string | null | undefined): unknown[] {
  if (!teamsJson) return []
  try {
    const teams = JSON.parse(teamsJson) as unknown
    if (Array.isArray(teams) && teams.length > 0) {
      return [teams[0]]
    }
  } catch {
    // ignore malformed session payload
  }
  return []
}

export function useCustomersList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  // Stable string key so we only rebuild when query actually changes
  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(CUSTOMER_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchType = (searchParams.get(CUSTOMER_FILTER_PARAMS.searchType) ||
    "default") as SearchType
  const searchTerm = searchParams.get(CUSTOMER_FILTER_PARAMS.searchTerm) ?? ""
  const customerSrNo =
    searchParams.get(CUSTOMER_FILTER_PARAMS.customerSrNo) ?? ""
  const isClient =
    (searchParams.get(CUSTOMER_FILTER_PARAMS.isClient) ?? "true") === "true"
  const sortByEnum =
    searchParams.get(CUSTOMER_FILTER_PARAMS.sortByEnum) || "REGISTERED_DATE"

  const sessionRoleFilter = useMemo(
    () => parseTeamsRoleFilter(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const gqlFilter = useMemo(
    () =>
      buildUsersFilterFromSearchParams(
        new URLSearchParams(paramsKey),
        sessionRoleFilter
      ),
    [paramsKey, sessionRoleFilter]
  )

  const activeFilters = useMemo(
    () => listActiveCustomerFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedCustomerFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchUsers, { data, loading, error }] = useLazyQuery<
    GetUsersByFilterData,
    GetUsersByFilterVars
  >(GET_USERS_BY_FILTER, {
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
      if (resetPage) {
        params.set(CUSTOMER_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [CUSTOMER_FILTER_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  const setSearchType = useCallback(
    (next: SearchType) => {
      setParams({
        [CUSTOMER_FILTER_PARAMS.searchType]: next === "default" ? null : next,
        [CUSTOMER_FILTER_PARAMS.searchTerm]: null,
        [CUSTOMER_FILTER_PARAMS.customerSrNo]: null,
      })
    },
    [setParams]
  )

  const setIsClient = useCallback(
    (next: boolean) => {
      setParams({
        [CUSTOMER_FILTER_PARAMS.isClient]: next ? null : "false",
      })
    },
    [setParams]
  )

  const setSortByEnum = useCallback(
    (next: string) => {
      setParams({
        [CUSTOMER_FILTER_PARAMS.sortByEnum]:
          next === "REGISTERED_DATE" ? null : next,
      })
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (searchType === "cusId") {
        setParams({
          [CUSTOMER_FILTER_PARAMS.customerSrNo]: trimmed || null,
          [CUSTOMER_FILTER_PARAMS.searchTerm]: null,
        })
        return
      }
      setParams({
        [CUSTOMER_FILTER_PARAMS.searchTerm]: trimmed || null,
        [CUSTOMER_FILTER_PARAMS.customerSrNo]: null,
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
    setParams(updates)
  }, [setParams])

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(getClearAllCustomerFilterUpdates())
  }, [setParams])

  // Ensure URL always has a page (legacy: default to 0)
  useEffect(() => {
    if (pageParam === null) {
      setParams({ [CUSTOMER_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchUsers({
      variables: {
        page: page + 1,
        limit: CUSTOMERS_PAGE_LIMIT,
        filter: gqlFilter,
      },
    })
  }, [fetchUsers, page, gqlFilter, session?.user])

  const rows: CustomerListRow[] = data?.getUsersByFilter ?? []

  const searchInputValue =
    searchType === "cusId" ? customerSrNo : searchTerm

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: CUSTOMERS_PAGE_LIMIT,
    searchType,
    searchInputValue,
    isClient,
    sortByEnum,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchType,
    setIsClient,
    setSortByEnum,
    setSearchQuery,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
  }
}
