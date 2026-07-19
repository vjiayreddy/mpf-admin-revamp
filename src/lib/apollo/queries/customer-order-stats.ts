import { gql } from "@apollo/client/core"

export type CustomerOrderStats = {
  totalCount?: number | null
  totalAmount?: number | null
}

export type GetCustomerOrderStatsData = {
  getStoreOrderCountAndTotalByUserId: CustomerOrderStats | null
}

export type GetCustomerOrderStatsVars = {
  userId: string
}

export const GET_CUSTOMER_ORDER_STATS = gql`
  query GetStoreOrderCountAndTotalByUserId($userId: String!) {
    getStoreOrderCountAndTotalByUserId(userId: $userId) {
      totalCount
      totalAmount
    }
  }
`
