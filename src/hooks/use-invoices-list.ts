"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { INVOICE_FILTER_PARAMS } from "@/config/invoice-filters"
import { authClient } from "@/lib/auth-client"
import { buildInvoicesQueryVars } from "@/lib/invoice/build-invoice-filter"
import {
  GET_ORDER_INVOICES_BY_FILTER,
  INVOICE_PAGE_LIMIT,
  type GetOrderInvoicesByFilterData,
  type GetOrderInvoicesByFilterVars,
  type InvoiceListRow,
} from "@/lib/apollo/queries/invoice"

export function useInvoicesList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(INVOICE_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(INVOICE_FILTER_PARAMS.searchTerm) ?? ""

  const gqlVars = useMemo(
    () =>
      buildInvoicesQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0
      ),
    [paramsKey, page]
  )

  const [fetchInvoices, { data, loading, error }] = useLazyQuery<
    GetOrderInvoicesByFilterData,
    GetOrderInvoicesByFilterVars
  >(GET_ORDER_INVOICES_BY_FILTER, {
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
        params.set(INVOICE_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [INVOICE_FILTER_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [INVOICE_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams({
      [INVOICE_FILTER_PARAMS.searchTerm]: null,
      [INVOICE_FILTER_PARAMS.page]: "0",
    })
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [INVOICE_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchInvoices({ variables: gqlVars })
  }, [fetchInvoices, page, gqlVars, session?.user])

  const rows: InvoiceListRow[] = data?.getOrderInvoicesByFilter ?? []

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: INVOICE_PAGE_LIMIT,
    searchInputValue: searchTerm,
    setPage,
    setSearchQuery,
    clearAllFilters,
  }
}
