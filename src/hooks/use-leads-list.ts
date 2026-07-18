"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  LEAD_FILTER_PARAMS,
  MORE_LEAD_FILTER_KEYS,
} from "@/config/lead-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  buildLeadsQueryVars,
  countAdvancedLeadFilters,
  getClearAllLeadFilterUpdates,
  getClearMoreLeadFilterUpdates,
  listActiveLeadFilters,
} from "@/lib/leads/build-leads-filter"
import {
  GET_ALL_LEADS,
  LEADS_PAGE_LIMIT,
  type GetAllLeadsData,
  type GetAllLeadsVars,
  type LeadListRow,
} from "@/lib/apollo/queries/leads"

export function useLeadsList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(LEAD_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(LEAD_FILTER_PARAMS.searchTerm) ?? ""
  const status = searchParams.get(LEAD_FILTER_PARAMS.status) ?? ""
  const creditToSalesTeamIds =
    searchParams.get(LEAD_FILTER_PARAMS.creditToSalesTeamIds) ?? ""

  const defaultPersonalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const { studios, studioNameById } = useAllStudios()
  const { stylists } = useAllStylists()

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const gqlVars = useMemo(
    () =>
      buildLeadsQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0,
        defaultPersonalStylistId
      ),
    [paramsKey, page, defaultPersonalStylistId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveLeadFilters(new URLSearchParams(paramsKey), {
        studioNameById,
        stylistNameById,
      }),
    [paramsKey, studioNameById, stylistNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedLeadFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchLeads, { data, loading, error }] = useLazyQuery<
    GetAllLeadsData,
    GetAllLeadsVars
  >(GET_ALL_LEADS, {
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
        params.set(LEAD_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [LEAD_FILTER_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [LEAD_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const setStatus = useCallback(
    (value: string) => {
      setParams({
        [LEAD_FILTER_PARAMS.status]:
          !value || value === "all" ? null : value,
      })
    },
    [setParams]
  )

  const setCreditToSalesTeamIds = useCallback(
    (value: string) => {
      setParams({
        [LEAD_FILTER_PARAMS.creditToSalesTeamIds]:
          !value || value === "all" ? null : value,
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
    setParams(getClearMoreLeadFilterUpdates())
  }, [setParams])

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(getClearAllLeadFilterUpdates())
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [LEAD_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchLeads({ variables: gqlVars })
  }, [fetchLeads, page, gqlVars, session?.user])

  const rows: LeadListRow[] = data?.getAllLeads?.leads ?? []

  const reloadLeads = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchLeads({ variables: gqlVars })
  }, [fetchLeads, page, gqlVars, session?.user])

  const buildExportVars = useCallback(() => {
    return buildLeadsQueryVars(
      new URLSearchParams(paramsKey),
      0,
      defaultPersonalStylistId,
      { isDownloadActive: true, limit: 2000 }
    )
  }, [paramsKey, defaultPersonalStylistId])

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: LEADS_PAGE_LIMIT,
    searchInputValue: searchTerm,
    status,
    creditToSalesTeamIds,
    stylists,
    studios,
    activeFilters,
    advancedFilterCount,
    searchParams,
    moreFilterKeys: MORE_LEAD_FILTER_KEYS,
    setPage,
    setSearchQuery,
    setStatus,
    setCreditToSalesTeamIds,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadLeads,
    buildExportVars,
    fetchLeads,
  }
}
