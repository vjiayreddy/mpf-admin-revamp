"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useApolloClient } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT,
  EMBROIDERY_FILTER_PARAMS,
  type EmbroiderySortBy,
} from "@/config/embroidery-filters"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  GET_EMBROIDERY_BY_FILTER,
  type EmbroideryListRow,
  type GetEmbroideryByFilterData,
  type GetEmbroideryByFilterVars,
} from "@/lib/apollo/queries/embroidery"
import {
  getClearAllEmbroideryFilterUpdates,
  listActiveEmbroideryFilters,
  buildEmbroideryQueryVars,
} from "@/lib/embroidery/build-embroidery-filter"
import { mapEmbroideryToCalendarEvents } from "@/lib/embroidery/map-calendar-events"
import { useAllStylists } from "@/hooks/use-all-stylists"

const CALENDAR_PAGE_SIZE = 100

export function useEmbroideryCalendar() {
  const client = useApolloClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists, loading: stylistsLoading } = useAllStylists()

  const paramsKey = searchParams.toString()
  const params = useMemo(() => new URLSearchParams(paramsKey), [paramsKey])

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const activeFilters = useMemo(
    () => listActiveEmbroideryFilters(params, stylistNameById),
    [params, stylistNameById]
  )

  const defaultPersonalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const sortByEnum: EmbroiderySortBy =
    params.get(EMBROIDERY_FILTER_PARAMS.sortByEnum) === "ORDER_DATE"
      ? "ORDER_DATE"
      : DEFAULT_SORT
  const stylistId = params.get(EMBROIDERY_FILTER_PARAMS.stylistId) ?? ""
  const searchTerm = params.get(EMBROIDERY_FILTER_PARAMS.searchTerm) ?? ""
  const embStatus = params.get(EMBROIDERY_FILTER_PARAMS.embStatus) ?? ""
  const calDate = params.get(EMBROIDERY_FILTER_PARAMS.calDate)

  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<EmbroideryListRow[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchSeq = useRef(0)

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
      setLoading(true)
      setError(null)

      const filterParams = new URLSearchParams(paramsKey)
      if (!filterParams.get(EMBROIDERY_FILTER_PARAMS.orderStatus)) {
        filterParams.set(
          EMBROIDERY_FILTER_PARAMS.orderStatus,
          DEFAULT_ORDER_STATUS
        )
      }

      const vars: GetEmbroideryByFilterVars = buildEmbroideryQueryVars(
        filterParams,
        pageNum - 1,
        filterParams.get(EMBROIDERY_FILTER_PARAMS.stylistId) ||
          filterParams.get(EMBROIDERY_FILTER_PARAMS.userId)
          ? null
          : defaultPersonalStylistId,
        CALENDAR_PAGE_SIZE
      )

      try {
        const result = await client.query<
          GetEmbroideryByFilterData,
          GetEmbroideryByFilterVars
        >({
          query: GET_EMBROIDERY_BY_FILTER,
          variables: vars,
          fetchPolicy: "network-only",
        })
        if (seq !== fetchSeq.current) return

        const batch = result.data?.getEmbroideryByFilter?.embroideries ?? []
        const total = result.data?.getEmbroideryByFilter?.totalCount ?? 0
        setRows((prev) => (replace ? batch : [...prev, ...batch]))
        setHasMore(pageNum * CALENDAR_PAGE_SIZE < total)
        setPage(pageNum)
      } catch (err) {
        if (seq !== fetchSeq.current) return
        setError(err instanceof Error ? err.message : "Failed to load calendar")
      } finally {
        if (seq === fetchSeq.current) setLoading(false)
      }
    },
    [client, paramsKey, session?.user, defaultPersonalStylistId]
  )

  useEffect(() => {
    const updates: Record<string, string | null> = {}
    if (
      defaultPersonalStylistId &&
      !params.get(EMBROIDERY_FILTER_PARAMS.stylistId)
    ) {
      updates[EMBROIDERY_FILTER_PARAMS.stylistId] = defaultPersonalStylistId
    }
    if (Object.keys(updates).length) replaceParams(updates)
  }, [params, defaultPersonalStylistId, replaceParams])

  useEffect(() => {
    setRows([])
    setPage(1)
    setHasMore(true)
    void loadPage(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filter key changes
  }, [paramsKey, session?.user])

  const events = useMemo(
    () => mapEmbroideryToCalendarEvents(rows, sortByEnum),
    [rows, sortByEnum]
  )

  const initialDate = useMemo(() => {
    if (!calDate) return new Date()
    const d = new Date(calDate)
    return Number.isNaN(d.getTime()) ? new Date() : d
  }, [calDate])

  return {
    events,
    rows,
    loading,
    error,
    hasMore,
    orderCount: rows.length,
    sortByEnum,
    stylistId,
    searchTerm,
    embStatus,
    initialDate,
    activeFilters,
    stylists,
    stylistsLoading,
    setSortByEnum: (value: string) =>
      replaceParams({ [EMBROIDERY_FILTER_PARAMS.sortByEnum]: value || null }),
    setStylistId: (value: string) =>
      replaceParams({ [EMBROIDERY_FILTER_PARAMS.stylistId]: value || null }),
    setSearchTerm: (value: string) =>
      replaceParams({
        [EMBROIDERY_FILTER_PARAMS.searchTerm]: value.trim() || null,
      }),
    setEmbStatus: (values: string[]) =>
      replaceParams({
        [EMBROIDERY_FILTER_PARAMS.embStatus]:
          values.length > 0 ? values.join(",") : null,
      }),
    setCalDate: (iso: string) =>
      replaceParams({ [EMBROIDERY_FILTER_PARAMS.calDate]: iso }),
    clearFilter: (updates: Record<string, string | null>) =>
      replaceParams(updates),
    clearAllFilters: () => replaceParams(getClearAllEmbroideryFilterUpdates()),
    loadMore: () => void loadPage(page + 1, false),
    reload: () => {
      setRows([])
      setPage(1)
      setHasMore(true)
      void loadPage(1, true)
    },
  }
}
