import { gql } from "@apollo/client"

import type {
  OrderQualityCheckDetail,
  QcActualMeasurement,
  QcChecklistSection,
} from "@/lib/quality-check/types"

export type GetOrderQualityCheckByIdData = {
  getOrderQualityCheckById: OrderQualityCheckDetail | null
}

export type GetOrderQualityCheckByIdVars = {
  orderQualityCheckId: string
}

/** GraphQL `OrderQualityCheckInput` payload for create/update. */
export type OrderQualityCheckInput = {
  orderId?: string | null
  userId?: string | null
  stylistId?: string | null
  itemNumber?: string | number | null
  name?: string | null
  catId?: string | null
  qualityCheckNote?: string | null
  qualityCheckStatus?: string | null
  productImage?: string | null
  fabricAndColor?: QcChecklistSection | null
  design?: QcChecklistSection | null
  measurements?: QcChecklistSection | null
  finishing?: QcChecklistSection | null
  cleanliness?: QcChecklistSection | null
  ironAndPackaging?: QcChecklistSection | null
  actualMeasurement?: QcActualMeasurement[] | null
}

export type CreateOrderQualityCheckData = {
  createOrderQualityCheck: { _id: string } | null
}

export type CreateOrderQualityCheckVars = {
  orderQualityCheck: OrderQualityCheckInput
}

export type UpdateOrderQualityCheckData = {
  updateOrderQualityCheck: { _id: string } | null
}

export type UpdateOrderQualityCheckVars = {
  orderQualityCheckId: string
  orderQualityCheck: OrderQualityCheckInput
}

export const GET_ORDER_QUALITY_CHECK_BY_ID = gql`
  query GetOrderQualityCheckById($orderQualityCheckId: ID!) {
    getOrderQualityCheckById(orderQualityCheckId: $orderQualityCheckId) {
      _id
      orderId
      userId
      stylistId
      itemNumber
      name
      catId
      qualityCheckNote
      qualityCheckStatus
      productImage
      fabricAndColor {
        check
        note
        rating
      }
      design {
        check
        note
        rating
      }
      measurements {
        check
        note
        rating
      }
      finishing {
        check
        note
        rating
      }
      cleanliness {
        check
        note
        rating
      }
      ironAndPackaging {
        check
        note
        rating
      }
      actualMeasurement {
        name
        value
      }
      storeProductOrder {
        orderNo
        customerFirstName
        customerLastName
        orderItems {
          _id
          fabricImage
          styleDesignImage
          itemColor
          itemName
          itemNumber
          itemCatId
        }
        orderDate {
          timestamp
        }
        trialDate {
          timestamp
        }
      }
      stylist {
        name
      }
    }
  }
`

export const CREATE_ORDER_QUALITY_CHECK = gql`
  mutation CreateOrderQualityCheck(
    $orderQualityCheck: OrderQualityCheckInput!
  ) {
    createOrderQualityCheck(orderQualityCheck: $orderQualityCheck) {
      _id
    }
  }
`

export const UPDATE_ORDER_QUALITY_CHECK = gql`
  mutation UpdateOrderQualityCheck(
    $orderQualityCheckId: ID!
    $orderQualityCheck: OrderQualityCheckInput!
  ) {
    updateOrderQualityCheck(
      orderQualityCheckId: $orderQualityCheckId
      orderQualityCheck: $orderQualityCheck
    ) {
      _id
    }
  }
`
