"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useApolloClient } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT_BY,
  TRACK_ORDERS_CALENDAR_PARAMS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-calendar-filters"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  GET_ALL_STORE_ORDERS,
  STORE_ORDERS_PAGE_LIMIT,
  type GetAllStoreOrdersData,
  type GetAllStoreOrdersVars,
  type StoreOrderCalendarRow,
} from "@/lib/apollo/queries/store-orders"
import { buildCalendarQueryVars } from "@/lib/track-orders/build-calendar-filter"
import { mapStoreOrdersToCalendarEvents } from "@/lib/track-orders/map-calendar-events"

export type CalendarOrderPatch = {
  _id: string
  orderStatus?: string | null
  remark?: string | null
  trialDate?: StoreOrderCalendarRow["trialDate"]
}

export function useTrackOrdersCalendar() {
  const client = useApolloClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()
  const params = useMemo(() => new URLSearchParams(paramsKey), [paramsKey])

  const defaultPersonalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const sortByEnum: TrackOrdersSortBy =
    params.get(TRACK_ORDERS_CALENDAR_PARAMS.sortByEnum) === "ORDER_DATE"
      ? "ORDER_DATE"
      : DEFAULT_SORT_BY

  const orderStatus =
    params.get(TRACK_ORDERS_CALENDAR_PARAMS.orderStatus) || DEFAULT_ORDER_STATUS
  const stylistId = params.get(TRACK_ORDERS_CALENDAR_PARAMS.stylistId) ?? ""
  const searchTerm = params.get(TRACK_ORDERS_CALENDAR_PARAMS.searchTerm) ?? ""
  const calDate = params.get(TRACK_ORDERS_CALENDAR_PARAMS.calDate)

  const [page, setPage] = useState(1)
  const [orders, setOrders] = useState<StoreOrderCalendarRow[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchSeq = useRef(0)
  const lastVarsRef = useRef<GetAllStoreOrdersVars | null>(null)

  const replaceParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(paramsKey)
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") next.delete(key)
        else next.set(key, value)
      }
      const qs = next.toString()
      if (qs === paramsKey) return
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [paramsKey, pathname, router]
  )

  const loadPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (!session?.user) return
      const seq = ++fetchSeq.current
      const vars = buildCalendarQueryVars(
        new URLSearchParams(paramsKey),
        pageNum,
        defaultPersonalStylistId
      )
      lastVarsRef.current = vars
      setLoading(true)
      setError(null)
      try {
        const result = await client.query<
          GetAllStoreOrdersData,
          GetAllStoreOrdersVars
        >({
          query: GET_ALL_STORE_ORDERS,
          variables: vars,
          fetchPolicy: "network-only",
        })
        if (seq !== fetchSeq.current) return
        const batch = result.data?.getAllStoreOrders ?? []
        setPage(pageNum)
        setOrders((prev) => (replace ? batch : [...prev, ...batch]))
        setHasMore(batch.length >= STORE_ORDERS_PAGE_LIMIT)
      } catch (err) {
        if (seq !== fetchSeq.current) return
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        if (seq === fetchSeq.current) setLoading(false)
      }
    },
    [session?.user, paramsKey, defaultPersonalStylistId, client]
  )

  useEffect(() => {
    setOrders([])
    setHasMore(true)
    void loadPage(1, true)
  }, [paramsKey, session?.user, defaultPersonalStylistId]) // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(async () => {
    await loadPage(1, true)
  }, [loadPage])

  const applyLocalOrderUpdate = useCallback(
    (patch: CalendarOrderPatch) => {
      setOrders((prev) => {
        const next = prev.map((order) =>
          order._id === patch._id
            ? {
                ...order,
                orderStatus: patch.orderStatus ?? order.orderStatus,
                remark: patch.remark ?? order.remark,
                trialDate:
                  patch.trialDate !== undefined
                    ? patch.trialDate
                    : order.trialDate,
              }
            : order
        )
        if (orderStatus && orderStatus !== "ALL") {
          return next.filter((order) => order.orderStatus === orderStatus)
        }
        return next
      })
    },
    [orderStatus]
  )

  const loadMore = useCallback(() => {
    void loadPage(page + 1, false)
  }, [loadPage, page])

  const events = useMemo(
    () => mapStoreOrdersToCalendarEvents(orders, sortByEnum),
    [orders, sortByEnum]
  )

  const initialDate = useMemo(() => {
    if (calDate) {
      const d = new Date(calDate)
      if (!Number.isNaN(d.getTime())) return d
    }
    return new Date()
  }, [calDate])

  return {
    events,
    orders,
    loading,
    error,
    hasMore,
    orderCount: orders.length,
    sortByEnum,
    orderStatus,
    stylistId,
    searchTerm,
    initialDate,
    lastQueryVars: lastVarsRef.current,
    setSortByEnum: (value: TrackOrdersSortBy) =>
      replaceParams({ [TRACK_ORDERS_CALENDAR_PARAMS.sortByEnum]: value }),
    setOrderStatus: (value: string) =>
      replaceParams({
        [TRACK_ORDERS_CALENDAR_PARAMS.orderStatus]:
          value === DEFAULT_ORDER_STATUS ? null : value,
      }),
    setStylistId: (value: string) =>
      replaceParams({
        [TRACK_ORDERS_CALENDAR_PARAMS.stylistId]: value || null,
      }),
    setSearchTerm: (value: string) =>
      replaceParams({
        [TRACK_ORDERS_CALENDAR_PARAMS.searchTerm]: value || null,
      }),
    setCalDate: (iso: string) => {
      const next = new Date(iso)
      const cur = calDate ? new Date(calDate) : null
      if (
        cur &&
        next.getFullYear() === cur.getFullYear() &&
        next.getMonth() === cur.getMonth()
      ) {
        return
      }
      replaceParams({ [TRACK_ORDERS_CALENDAR_PARAMS.calDate]: iso })
    },
    loadMore,
    reload,
    applyLocalOrderUpdate,
  }
}
