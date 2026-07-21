"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { TRIAL_PARAMS } from "@/config/trial-filters"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { authClient } from "@/lib/auth-client"
import {
  buildTrialListQueryVars,
  countAdvancedTrialFilters,
  getClearAllTrialFilterUpdates,
  getClearMoreTrialFilterUpdates,
  listActiveTrialFilters,
} from "@/lib/trial/build-trial-filter"
import {
  GET_ORDER_TRIALS_BY_FILTER,
  TRIAL_LIST_PAGE_LIMIT,
  type GetOrderTrialsByFilterData,
  type GetOrderTrialsByFilterVars,
  type OrderTrialRow,
} from "@/lib/apollo/queries/trial"
import {
  GET_USERS_BY_FILTER,
  type GetUsersByFilterData,
  type GetUsersByFilterVars,
} from "@/lib/apollo/queries/users"
import { customerFullName } from "@/lib/track-orders/format"

function rowMatchesSearch(row: OrderTrialRow, term: string) {
  const q = term.trim().toLowerCase()
  if (!q) return true
  const order = row.storeProductOrder
  const haystack = [
    order?.orderNo != null ? String(order.orderNo) : "",
    order?.customerId != null ? String(order.customerId) : "",
    order?.customerPhone ?? "",
    customerFullName(order?.customerFirstName, order?.customerLastName),
    customerFullName(row.user?.firstName, row.user?.lastName),
    row.trialStatus ?? "",
    row.trialBy ?? "",
    ...(row.products ?? []).flatMap((p) => [
      p?.name ?? "",
      p?.itemNumber != null ? String(p.itemNumber) : "",
    ]),
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

export function useTrialList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists } = useAllStylists()

  const paramsKey = searchParams.toString()
  const defaultPersonalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const pageParam = searchParams.get(TRIAL_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm = searchParams.get(TRIAL_PARAMS.searchTerm) ?? ""
  const stylistId = searchParams.get(TRIAL_PARAMS.stylistId) ?? ""

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null)
  const [resolvingSearch, setResolvingSearch] = useState(false)

  const gqlVars = useMemo(
    () =>
      buildTrialListQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        defaultPersonalStylistId,
        resolvedUserId
      ),
    [paramsKey, page, defaultPersonalStylistId, resolvedUserId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveTrialFilters(new URLSearchParams(paramsKey), {
        stylistNameById,
      }),
    [paramsKey, stylistNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedTrialFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchTrials, { loading, error }] = useLazyQuery<
    GetOrderTrialsByFilterData,
    GetOrderTrialsByFilterVars
  >(GET_ORDER_TRIALS_BY_FILTER, {
    fetchPolicy: "no-cache",
  })

  const [searchUsers] = useLazyQuery<
    GetUsersByFilterData,
    GetUsersByFilterVars
  >(GET_USERS_BY_FILTER, {
    fetchPolicy: "network-only",
  })

  const fetchSeq = useRef(0)
  const searchResolveSeq = useRef(0)
  const [serverRows, setServerRows] = useState<OrderTrialRow[]>([])
  /** Survives reload so optimistic edits are not wiped by a stale list response. */
  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<OrderTrialRow>>
  >({})

  useEffect(() => {
    setRowPatches({})
  }, [paramsKey])

  // OrderTrialFilterInput has no searchTerm — resolve name/phone to userId.
  useEffect(() => {
    const term = searchTerm.trim()
    if (!term) {
      setResolvedUserId(null)
      setResolvingSearch(false)
      return
    }

    // Already a user id (24-char hex) — use directly.
    if (/^[a-f\d]{24}$/i.test(term)) {
      setResolvedUserId(term)
      setResolvingSearch(false)
      return
    }

    const seq = ++searchResolveSeq.current
    setResolvingSearch(true)
    setResolvedUserId(null)
    void searchUsers({
      variables: {
        filter: { searchTerm: term, isClient: true },
        page: 1,
        limit: 5,
      },
    })
      .then((result) => {
        if (seq !== searchResolveSeq.current) return
        const users = result.data?.getUsersByFilter ?? []
        setResolvedUserId(users[0]?._id ?? null)
      })
      .catch(() => {
        if (seq !== searchResolveSeq.current) return
        setResolvedUserId(null)
      })
      .finally(() => {
        if (seq === searchResolveSeq.current) setResolvingSearch(false)
      })
  }, [searchTerm, searchUsers])

  const rows = useMemo(() => {
    const patched = serverRows.map((row) => {
      const patch = rowPatches[row._id]
      return patch ? { ...row, ...patch } : row
    })
    const term = searchTerm.trim()
    if (!term || resolvedUserId) return patched
    // No user match — still narrow current page by order no / name / phone.
    return patched.filter((row) => rowMatchesSearch(row, term))
  }, [serverRows, rowPatches, searchTerm, resolvedUserId])

  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(TRIAL_PARAMS.tab)
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key)
        else params.set(key, value)
      }
      if (resetPage) params.set(TRIAL_PARAMS.page, "0")
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [TRIAL_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [TRIAL_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    // Wait until name search has resolved (or been cleared) before listing.
    if (searchTerm.trim() && resolvingSearch) return

    const seq = ++fetchSeq.current
    void fetchTrials({ variables: gqlVars }).then((result) => {
      if (seq !== fetchSeq.current) return
      setServerRows(result.data?.getOrderTrialByFilter ?? [])
    })
  }, [
    fetchTrials,
    page,
    gqlVars,
    session?.user,
    searchTerm,
    resolvingSearch,
  ])

  const reload = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    if (searchTerm.trim() && resolvingSearch) return
    const seq = ++fetchSeq.current
    void fetchTrials({ variables: gqlVars }).then((result) => {
      if (seq !== fetchSeq.current) return
      setServerRows(result.data?.getOrderTrialByFilter ?? [])
    })
  }, [fetchTrials, page, gqlVars, session?.user, searchTerm, resolvingSearch])

  const patchTrialRow = useCallback(
    (trialId: string, patch: Partial<OrderTrialRow>) => {
      setServerRows((prev) =>
        prev.map((row) => (row._id === trialId ? { ...row, ...patch } : row))
      )
      setRowPatches((prev) => ({
        ...prev,
        [trialId]: { ...prev[trialId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    loading: loading || resolvingSearch,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: TRIAL_LIST_PAGE_LIMIT,
    searchInputValue: searchTerm,
    stylistId,
    stylists,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery: (value: string) =>
      setParams({
        [TRIAL_PARAMS.searchTerm]: value.trim() || null,
      }),
    setStylistId: (value: string) =>
      setParams({
        [TRIAL_PARAMS.stylistId]:
          !value || value === "all" ? null : value,
      }),
    applyMoreFilters: (updates: Record<string, string | null>) =>
      setParams(updates),
    clearMoreFilters: () => setParams(getClearMoreTrialFilterUpdates()),
    clearFilter: (updates: Record<string, string | null>) => setParams(updates),
    clearAllFilters: () => setParams(getClearAllTrialFilterUpdates()),
    reload,
    patchTrialRow,
  }
}
