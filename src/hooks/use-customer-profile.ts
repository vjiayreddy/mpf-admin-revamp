"use client"

import { useQuery } from "@apollo/client/react"

import {
  GET_CUSTOMER_ORDER_STATS,
  type GetCustomerOrderStatsData,
  type GetCustomerOrderStatsVars,
} from "@/lib/apollo/queries/customer-order-stats"
import {
  GET_USER,
  type GetUserData,
  type GetUserVars,
} from "@/lib/apollo/queries/get-user"

export function useCustomerProfile(userId: string | null | undefined) {
  const userQuery = useQuery<GetUserData, GetUserVars>(GET_USER, {
    variables: { userId: userId ?? "" },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  })

  const statsQuery = useQuery<
    GetCustomerOrderStatsData,
    GetCustomerOrderStatsVars
  >(GET_CUSTOMER_ORDER_STATS, {
    variables: { userId: userId ?? "" },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  })

  return {
    user: userQuery.data?.user ?? null,
    loadingUser: userQuery.loading && !userQuery.data,
    userError: userQuery.error,
    refetchUser: userQuery.refetch,
    orderStats: statsQuery.data?.getStoreOrderCountAndTotalByUserId ?? null,
    loadingStats: statsQuery.loading && !statsQuery.data,
  }
}
