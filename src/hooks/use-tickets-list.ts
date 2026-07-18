"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { TICKET_FILTER_PARAMS } from "@/config/ticket-filters"
import { authClient } from "@/lib/auth-client"
import {
  buildTicketsQueryVars,
  getClearAllTicketFilterUpdates,
  listActiveTicketFilters,
} from "@/lib/tickets/build-tickets-filter"
import {
  GET_ALL_TICKETS,
  TICKETS_PAGE_SIZE,
  type GetTicketsData,
  type GetTicketsVars,
  type TicketListRow,
} from "@/lib/apollo/queries/tickets"

export function useTicketsList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(TICKET_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(TICKET_FILTER_PARAMS.searchTerm) ?? ""
  const status = searchParams.get(TICKET_FILTER_PARAMS.status) ?? ""
  const priority = searchParams.get(TICKET_FILTER_PARAMS.priority) ?? ""
  const category = searchParams.get(TICKET_FILTER_PARAMS.category) ?? ""

  const gqlVars = useMemo(
    () =>
      buildTicketsQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0
      ),
    [paramsKey, page]
  )

  const activeFilters = useMemo(
    () => listActiveTicketFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchTickets, { data, loading, error }] = useLazyQuery<
    GetTicketsData,
    GetTicketsVars
  >(GET_ALL_TICKETS, {
    fetchPolicy: "network-only",
  })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<TicketListRow>>
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
        params.set(TICKET_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [TICKET_FILTER_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [TICKET_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const setStatus = useCallback(
    (value: string) => {
      setParams({
        [TICKET_FILTER_PARAMS.status]:
          !value || value === "all" ? null : value,
      })
    },
    [setParams]
  )

  const setPriority = useCallback(
    (value: string) => {
      setParams({
        [TICKET_FILTER_PARAMS.priority]:
          !value || value === "all" ? null : value,
      })
    },
    [setParams]
  )

  const setCategory = useCallback(
    (value: string) => {
      setParams({
        [TICKET_FILTER_PARAMS.category]:
          !value || value === "all" ? null : value,
      })
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
    setParams(getClearAllTicketFilterUpdates())
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [TICKET_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchTickets({ variables: gqlVars })
  }, [fetchTickets, page, gqlVars, session?.user])

  const serverRows = data?.getTickets?.tickets ?? []
  const totalCount = data?.getTickets?.totalCount ?? 0

  const rows: TicketListRow[] = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row._id]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

  const reloadTickets = useCallback(
    (opts?: { preservePatches?: boolean }) => {
      if (!Number.isInteger(page) || page < 0) return
      if (!session?.user) return
      if (!opts?.preservePatches) {
        setRowPatches({})
      }
      void fetchTickets({ variables: gqlVars })
    },
    [fetchTickets, page, gqlVars, session?.user]
  )

  const patchTicketRow = useCallback(
    (ticketId: string, patch: Partial<TicketListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [ticketId]: { ...prev[ticketId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    totalCount,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: TICKETS_PAGE_SIZE,
    searchInputValue: searchTerm,
    status,
    priority,
    category,
    activeFilters,
    searchParams,
    setPage,
    setSearchQuery,
    setStatus,
    setPriority,
    setCategory,
    clearFilter,
    clearAllFilters,
    reloadTickets,
    patchTicketRow,
  }
}
