"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT_BY,
  MORE_TRACK_ORDERS_LIST_FILTER_KEYS,
  TRACK_ORDERS_LIST_PARAMS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-list-filters"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { authClient } from "@/lib/auth-client"
import {
  buildTrackOrdersListQueryVars,
  countAdvancedTrackOrdersListFilters,
  getClearAllTrackOrdersListFilterUpdates,
  getClearMoreTrackOrdersListFilterUpdates,
  listActiveTrackOrdersListFilters,
} from "@/lib/track-orders/build-track-orders-list-filter"
import {
  GET_TRACK_ORDERS_LIST,
  TRACK_ORDERS_LIST_PAGE_LIMIT,
  type GetAllStoreOrdersVars,
  type GetTrackOrdersListData,
  type StoreOrderListRow,
} from "@/lib/apollo/queries/store-orders"

export function useTrackOrdersList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists } = useAllStylists()
  const { studios, studioNameById } = useAllStudios()

  const paramsKey = searchParams.toString()
  const defaultPersonalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const pageParam = searchParams.get(TRACK_ORDERS_LIST_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(TRACK_ORDERS_LIST_PARAMS.searchTerm) ?? ""
  const stylistId =
    searchParams.get(TRACK_ORDERS_LIST_PARAMS.stylistId) ?? ""
  const orderStatus =
    searchParams.get(TRACK_ORDERS_LIST_PARAMS.orderStatus) ||
    DEFAULT_ORDER_STATUS
  const sortByEnum: TrackOrdersSortBy =
    searchParams.get(TRACK_ORDERS_LIST_PARAMS.sortByEnum) === "ORDER_DATE"
      ? "ORDER_DATE"
      : DEFAULT_SORT_BY
  const measurementApprovalStatus =
    searchParams.get(TRACK_ORDERS_LIST_PARAMS.measurementApprovalStatus) ?? ""

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const gqlVars = useMemo(
    () =>
      buildTrackOrdersListQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        defaultPersonalStylistId
      ),
    [paramsKey, page, defaultPersonalStylistId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveTrackOrdersListFilters(new URLSearchParams(paramsKey), {
        stylistNameById,
        studioNameById,
      }),
    [paramsKey, stylistNameById, studioNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedTrackOrdersListFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchOrders, { data, loading, error }] = useLazyQuery<
    GetTrackOrdersListData,
    GetAllStoreOrdersVars
  >(GET_TRACK_ORDERS_LIST, { fetchPolicy: "network-only" })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<StoreOrderListRow>>
  >({})

  useEffect(() => {
    setRowPatches({})
  }, [paramsKey])

  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key)
        else params.set(key, value)
      }
      if (resetPage) params.set(TRACK_ORDERS_LIST_PARAMS.page, "0")
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [TRACK_ORDERS_LIST_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [TRACK_ORDERS_LIST_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchOrders({ variables: gqlVars })
  }, [fetchOrders, page, gqlVars, session?.user])

  const serverRows = data?.getAllStoreOrders ?? []

  const rows: StoreOrderListRow[] = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row._id]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

  const reload = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    setRowPatches({})
    void fetchOrders({ variables: gqlVars })
  }, [fetchOrders, page, gqlVars, session?.user])

  const patchOrderRow = useCallback(
    (orderId: string, patch: Partial<StoreOrderListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: TRACK_ORDERS_LIST_PAGE_LIMIT,
    searchInputValue: searchTerm,
    stylistId,
    orderStatus,
    sortByEnum,
    measurementApprovalStatus,
    stylists,
    studios,
    activeFilters,
    advancedFilterCount,
    searchParams,
    moreFilterKeys: MORE_TRACK_ORDERS_LIST_FILTER_KEYS,
    setPage,
    setSearchQuery: (value: string) =>
      setParams({
        [TRACK_ORDERS_LIST_PARAMS.searchTerm]: value.trim() || null,
      }),
    setStylistId: (value: string) =>
      setParams({
        [TRACK_ORDERS_LIST_PARAMS.stylistId]:
          !value || value === "all" ? null : value,
      }),
    setOrderStatus: (value: string) =>
      setParams({
        [TRACK_ORDERS_LIST_PARAMS.orderStatus]:
          value === DEFAULT_ORDER_STATUS ? null : value,
      }),
    setSortByEnum: (value: TrackOrdersSortBy) =>
      setParams({
        [TRACK_ORDERS_LIST_PARAMS.sortByEnum]:
          value === DEFAULT_SORT_BY ? null : value,
      }),
    setMeasurementApprovalStatus: (value: string) =>
      setParams({
        [TRACK_ORDERS_LIST_PARAMS.measurementApprovalStatus]: value || null,
      }),
    applyMoreFilters: (updates: Record<string, string | null>) =>
      setParams(updates),
    clearMoreFilters: () => setParams(getClearMoreTrackOrdersListFilterUpdates()),
    clearFilter: (updates: Record<string, string | null>) => setParams(updates),
    clearAllFilters: () => setParams(getClearAllTrackOrdersListFilterUpdates()),
    reload,
    patchOrderRow,
  }
}
