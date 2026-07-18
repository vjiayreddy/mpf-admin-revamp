"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { authClient } from "@/lib/auth-client"
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

  const pageParam = searchParams.get("page")
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm = searchParams.get("searchTerm") ?? ""

  const roleFilter = useMemo(
    () => parseTeamsRoleFilter(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const [fetchUsers, { data, loading, error }] = useLazyQuery<
    GetUsersByFilterData,
    GetUsersByFilterVars
  >(GET_USERS_BY_FILTER, {
    fetchPolicy: "network-only",
  })

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams({ page: String(Math.max(0, nextPage)) })
    },
    [setParams]
  )

  const setSearchTerm = useCallback(
    (term: string) => {
      setParams({
        searchTerm: term.trim() || null,
        page: "0",
      })
    },
    [setParams]
  )

  // Ensure URL always has a page (legacy: default to 0)
  useEffect(() => {
    if (pageParam === null) {
      setParams({ page: "0" })
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchUsers({
      variables: {
        page: page + 1,
        limit: CUSTOMERS_PAGE_LIMIT,
        filter: {
          isClient: true,
          roleFilter: roleFilter.length > 0 ? roleFilter : undefined,
          ...(searchTerm ? { searchTerm } : {}),
        },
      },
    })
  }, [fetchUsers, page, roleFilter, searchTerm, session?.user])

  const rows: CustomerListRow[] = data?.getUsersByFilter ?? []

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: CUSTOMERS_PAGE_LIMIT,
    searchTerm,
    setPage,
    setSearchTerm,
  }
}
