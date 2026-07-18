"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  MORE_RECEIPT_FILTER_KEYS,
  RECEIPT_FILTER_PARAMS,
} from "@/config/receipt-filters"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { authClient } from "@/lib/auth-client"
import {
  buildReceiptsQueryVars,
  countAdvancedReceiptFilters,
  getClearAllReceiptFilterUpdates,
  getClearMoreReceiptFilterUpdates,
  listActiveReceiptFilters,
} from "@/lib/receipts/build-receipts-filter"
import {
  GET_STORE_ORDER_PAYMENTS,
  RECEIPTS_PAGE_LIMIT,
  type GetStoreOrderPaymentsData,
  type GetStoreOrderPaymentsVars,
  type ReceiptListRow,
} from "@/lib/apollo/queries/receipts"

export function useReceiptsList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const { stylists } = useAllStylists()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(RECEIPT_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(RECEIPT_FILTER_PARAMS.searchTerm) ?? ""
  const stylistId =
    searchParams.get(RECEIPT_FILTER_PARAMS.stylistId) ?? ""

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const gqlVars = useMemo(
    () =>
      buildReceiptsQueryVars(
        new URLSearchParams(paramsKey),
        Number.isInteger(page) && page >= 0 ? page : 0
      ),
    [paramsKey, page]
  )

  const activeFilters = useMemo(
    () =>
      listActiveReceiptFilters(new URLSearchParams(paramsKey), {
        stylistNameById,
      }),
    [paramsKey, stylistNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedReceiptFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchReceipts, { data, loading, error }] = useLazyQuery<
    GetStoreOrderPaymentsData,
    GetStoreOrderPaymentsVars
  >(GET_STORE_ORDER_PAYMENTS, {
    fetchPolicy: "network-only",
  })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<ReceiptListRow>>
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
        params.set(RECEIPT_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [RECEIPT_FILTER_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [RECEIPT_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const setStylistId = useCallback(
    (value: string) => {
      setParams({
        [RECEIPT_FILTER_PARAMS.stylistId]:
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
    setParams(getClearMoreReceiptFilterUpdates())
  }, [setParams])

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(getClearAllReceiptFilterUpdates())
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [RECEIPT_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchReceipts({ variables: gqlVars })
  }, [fetchReceipts, page, gqlVars, session?.user])

  const serverRows = data?.getStoreOrderPayments?.payments ?? []
  const totalCount = data?.getStoreOrderPayments?.totalCount ?? 0
  const totalAmount = data?.getStoreOrderPayments?.totalAmount ?? 0

  const rows: ReceiptListRow[] = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row.paymentId]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

  const reloadReceipts = useCallback(
    (opts?: { preservePatches?: boolean }) => {
      if (!Number.isInteger(page) || page < 0) return
      if (!session?.user) return
      if (!opts?.preservePatches) {
        setRowPatches({})
      }
      void fetchReceipts({ variables: gqlVars })
    },
    [fetchReceipts, page, gqlVars, session?.user]
  )

  const patchReceiptRow = useCallback(
    (paymentId: string, patch: Partial<ReceiptListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [paymentId]: { ...prev[paymentId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    totalCount,
    totalAmount,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: RECEIPTS_PAGE_LIMIT,
    searchInputValue: searchTerm,
    stylistId,
    stylists,
    activeFilters,
    advancedFilterCount,
    searchParams,
    moreFilterKeys: MORE_RECEIPT_FILTER_KEYS,
    setPage,
    setSearchQuery,
    setStylistId,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadReceipts,
    patchReceiptRow,
  }
}
