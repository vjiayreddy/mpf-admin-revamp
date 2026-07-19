import { gql } from "@apollo/client"

import type { OrderQualityCheckDetail } from "@/lib/quality-check/types"

export type GetOrderQualityCheckByIdData = {
  getOrderQualityCheckById: OrderQualityCheckDetail | null
}

export type GetOrderQualityCheckByIdVars = {
  orderQualityCheckId: string
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
