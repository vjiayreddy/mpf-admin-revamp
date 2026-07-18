"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ONLINE_ORDER_FILTER_PARAMS } from "@/config/online-order-filters"
import { authClient } from "@/lib/auth-client"
import { buildOnlineOrdersQueryVars } from "@/lib/online-orders/build-online-orders-filter"
import {
  GET_ALL_PRODUCT_ORDERS,
  ONLINE_ORDERS_PAGE_LIMIT,
  type GetAllProductOrdersData,
  type GetAllProductOrdersVars,
  type OnlineOrderListRow,
} from "@/lib/apollo/queries/online-orders"

export function useOnlineOrdersList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(ONLINE_ORDER_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN

  const gqlVars = useMemo(
    () =>
      buildOnlineOrdersQueryVars(
        Number.isInteger(page) && page >= 0 ? page : 0
      ),
    [page]
  )

  const [fetchOrders, { data, loading, error }] = useLazyQuery<
    GetAllProductOrdersData,
    GetAllProductOrdersVars
  >(GET_ALL_PRODUCT_ORDERS, {
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
        params.set(ONLINE_ORDER_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [ONLINE_ORDER_FILTER_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [ONLINE_ORDER_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchOrders({ variables: gqlVars })
  }, [fetchOrders, page, gqlVars, session?.user, paramsKey])

  const rows: OnlineOrderListRow[] = data?.getAllProductOrders ?? []

  const reloadOrders = useCallback(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return
    void fetchOrders({ variables: gqlVars })
  }, [fetchOrders, page, gqlVars, session?.user])

  return {
    rows,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: ONLINE_ORDERS_PAGE_LIMIT,
    setPage,
    reloadOrders,
  }
}
