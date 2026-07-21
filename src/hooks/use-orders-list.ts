"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ORDERS_PAGE_SIZE, ORDERS_PARAMS } from "@/config/orders-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  buildOrdersQueryVars,
  getClearAllOrdersFilterUpdates,
  listActiveOrdersFilters,
} from "@/lib/orders/build-orders-filter"
import {
  GET_ORDERS_LIST,
  type GetAllStoreOrdersVars,
  type GetOrdersListData,
  type OrdersListRow,
} from "@/lib/apollo/queries/store-orders"

export function useOrdersList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists, loading: stylistsLoading } = useAllStylists(
    Boolean(session?.user)
  )
  const { studios, studioNameById, loading: studiosLoading } = useAllStudios()

  const paramsKey = searchParams.toString()
  const pageParam = searchParams.get(ORDERS_PARAMS.page)
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
      buildOrdersQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        defaultStylistId
      ),
    [paramsKey, page, defaultStylistId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveOrdersFilters(
        new URLSearchParams(paramsKey),
        stylistNameById,
        studioNameById
      ),
    [paramsKey, stylistNameById, studioNameById]
  )

  const [fetchList, { data, loading, error }] = useLazyQuery<
    GetOrdersListData,
    GetAllStoreOrdersVars
  >(GET_ORDERS_LIST, {
    fetchPolicy: "network-only",
  })

  const refetch = useCallback(() => {
    void fetchList({ variables: gqlVars })
  }, [fetchList, gqlVars])

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
      if (resetPage) params.set(ORDERS_PARAMS.page, "0")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) {
      setParams({ [ORDERS_PARAMS.page]: "0" }, false)
      return
    }
    void fetchList({ variables: gqlVars })
  }, [fetchList, gqlVars, page, setParams])

  const rows: OrdersListRow[] = data?.getAllStoreOrders ?? []
  const pageSize = ORDERS_PAGE_SIZE
  const hasNextPage = rows.length >= pageSize
  const currentPage = Number.isInteger(page) && page >= 0 ? page : 0

  return {
    rows,
    loading,
    error,
    currentPage,
    pageSize,
    hasNextPage,
    searchTerm: searchParams.get(ORDERS_PARAMS.searchTerm) ?? "",
    orderStatus: searchParams.get(ORDERS_PARAMS.orderStatus) ?? "",
    stylistId: searchParams.get(ORDERS_PARAMS.stylistId) ?? "",
    studioId: searchParams.get(ORDERS_PARAMS.studioId) ?? "",
    stylists,
    stylistsLoading,
    studios,
    studiosLoading,
    activeFilters,
    setParams,
    clearAllFilters: () => setParams(getClearAllOrdersFilterUpdates()),
    goToPage: (next: number) =>
      setParams(
        { [ORDERS_PARAMS.page]: String(Math.max(0, next)) },
        false
      ),
    refetch,
  }
}
