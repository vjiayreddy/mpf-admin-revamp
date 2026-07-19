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

  const gqlVars = useMemo(
    () =>
      buildTrialListQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        defaultPersonalStylistId
      ),
    [paramsKey, page, defaultPersonalStylistId]
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

  const fetchSeq = useRef(0)
  const [serverRows, setServerRows] = useState<OrderTrialRow[]>([])
  /** Survives reload so optimistic edits are not wiped by a stale list response. */
  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<OrderTrialRow>>
  >({})

  useEffect(() => {
    setRowPatches({})
  }, [paramsKey])

  const rows = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row._id]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

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

    const seq = ++fetchSeq.current
    void fetchTrials({ variables: gqlVars }).then((result) => {
      if (seq !== fetchSeq.current) return
      setServerRows(result.data?.getOrderTrialByFilter ?? [])
    })
  }, [fetchTrials, page, gqlVars, session?.user])

  const reload = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    const seq = ++fetchSeq.current
    void fetchTrials({ variables: gqlVars }).then((result) => {
      if (seq !== fetchSeq.current) return
      setServerRows(result.data?.getOrderTrialByFilter ?? [])
    })
  }, [fetchTrials, page, gqlVars, session?.user])

  const patchTrialRow = useCallback(
    (trialId: string, patch: Partial<OrderTrialRow>) => {
      // Bake into server rows so the grid updates even if AG Grid misses a
      // shallow rowData diff; keep patches so a stale reload cannot wipe it.
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
    loading,
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
