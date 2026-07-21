import { gql } from "@apollo/client/core"

import type { StoreOrderTimestamp } from "@/lib/apollo/queries/store-orders"

const DATE_TIME_FIELDS = `
  datestamp
  day
  hour
  minute
  month
  timestamp
  year
`

export const TRIAL_LIST_PAGE_LIMIT = 100

export type OrderTrialProduct = {
  itemNumber?: string | number | null
  catId?: string | null
  name?: string | null
  trialNote?: string | null
  trialImageLinks?: string[] | null
  trialVideoLink?: string | null
  fabricImageLink?: string | null
}

export type OrderTrialStoreOrder = {
  _id?: string | null
  customerFirstName?: string | null
  customerLastName?: string | null
  customerId?: string | null
  customerPhone?: string | null
  customerCountryCode?: string | null
  orderNo?: string | number | null
  userId?: string | null
  stylist?: Array<{ _id?: string | null; name?: string | null } | null> | null
  trialDate?: StoreOrderTimestamp | null
  orderDate?: StoreOrderTimestamp | null
}

export type OrderTrialRow = {
  _id: string
  orderId?: string | null
  stylistId?: string | null
  trialStatus?: string | null
  measurementStatus?: string | null
  trialDecision?: string | null
  trialRating?: string | null
  note?: string | null
  trialBy?: string | null
  userId?: string | null
  stylist?: { _id?: string | null; name?: string | null } | null
  trialDate?: StoreOrderTimestamp | null
  deliveryDate?: StoreOrderTimestamp | null
  products?: OrderTrialProduct[] | null
  storeProductOrder?: OrderTrialStoreOrder | null
  user?: {
    _id?: string | null
    firstName?: string | null
    lastName?: string | null
  } | null
}

/** Nested trial on a store order (All Orders / Track Orders). */
export type NestedOrderTrial = {
  _id: string
  trialStatus?: string | null
  trialRating?: string | null
  measurementStatus?: string | null
  note?: string | null
  trialDecision?: string | null
  trialBy?: string | null
  trialDate?: StoreOrderTimestamp | null
  deliveryDate?: StoreOrderTimestamp | null
  products?: OrderTrialProduct[] | null
}

export type OrderTrialFilterParams = {
  /** Not in GraphQL OrderTrialFilterInput — resolve via user search → userId. */
  stylistId?: string | null
  userId?: string | null
  trialStatus?: string | null
  trialDecision?: string | null
  trialRating?: string | null
  measurementStatus?: string | null
  secondaryStylistId?: string | null
  itemNumber?: string | null
  trialDateStart?: string | null
  trialDateEnd?: string | null
  deliveryDateStart?: string | null
  deliveryDateEnd?: string | null
}

export type GetOrderTrialsByFilterVars = {
  page?: number
  limit?: number
  params?: OrderTrialFilterParams | null
}

export type GetOrderTrialsByFilterData = {
  getOrderTrialByFilter: OrderTrialRow[]
}

export type GetOrderTrialByIdVars = { orderTrialId: string }
export type GetOrderTrialByIdData = {
  getOrderTrialById: OrderTrialRow | null
}

export type OrderTrialDateInput = {
  datestamp?: string | null
  day?: number | null
  hour?: number | null
  minute?: number | null
  month?: number | null
  timestamp?: string | null
  year?: number | null
}

export type OrderTrialProductInput = {
  catId?: string | null
  name?: string | null
  itemNumber?: string | number | null
  fabricImageLink?: string | null
  trialNote?: string | null
  trialVideoLink?: string | null
  trialImageLinks?: string[] | null
}

export type OrderTrialInput = {
  orderId?: string | null
  userId?: string | null
  stylistId?: string | null
  trialStatus?: string | null
  trialRating?: string | null
  trialDecision?: string | null
  trialDate?: OrderTrialDateInput | null
  deliveryDate?: OrderTrialDateInput | null
  products?: OrderTrialProductInput[] | null
  note?: string | null
  measurementStatus?: string | null
  trialBy?: string | null
  trialNote?: string | null
  trialByIds?: string[] | null
}

export type CreateOrderTrialVars = { orderTrial: OrderTrialInput }
export type CreateOrderTrialData = {
  createOrderTrial: { _id: string } | null
}

export type UpdateOrderTrialVars = {
  orderTrialId: string
  orderTrial: OrderTrialInput
}
export type UpdateOrderTrialData = {
  updateOrderTrial: { _id: string } | null
}

const ORDER_TRIAL_PRODUCT_FIELDS = `
  itemNumber
  catId
  name
  trialNote
  trialImageLinks
  trialVideoLink
  fabricImageLink
`

const ORDER_TRIAL_LIST_FIELDS = `
  _id
  orderId
  stylistId
  trialStatus
  measurementStatus
  trialDecision
  trialRating
  note
  trialBy
  stylist {
    name
    _id
  }
  trialDate {
    ${DATE_TIME_FIELDS}
  }
  deliveryDate {
    ${DATE_TIME_FIELDS}
  }
  products {
    ${ORDER_TRIAL_PRODUCT_FIELDS}
  }
  storeProductOrder {
    _id
    customerFirstName
    customerId
    customerPhone
    customerLastName
    customerCountryCode
    orderNo
    userId
    stylist {
      _id
      name
    }
    trialDate {
      ${DATE_TIME_FIELDS}
    }
    orderDate {
      ${DATE_TIME_FIELDS}
    }
  }
  user {
    lastName
    firstName
    _id
  }
`

export const GET_ORDER_TRIALS_BY_FILTER = gql`
  query GetOrderTrialByFilter(
    $page: Int
    $limit: Int
    $params: OrderTrialFilterInput
  ) {
    getOrderTrialByFilter(page: $page, limit: $limit, params: $params) {
      ${ORDER_TRIAL_LIST_FIELDS}
    }
  }
`

export const GET_ORDER_TRIAL_BY_ID = gql`
  query GetOrderTrialById($orderTrialId: ID!) {
    getOrderTrialById(orderTrialId: $orderTrialId) {
      _id
      orderId
      stylistId
      trialStatus
      measurementStatus
      trialDecision
      trialRating
      note
      trialBy
      userId
      trialDate {
        ${DATE_TIME_FIELDS}
      }
      deliveryDate {
        ${DATE_TIME_FIELDS}
      }
      products {
        ${ORDER_TRIAL_PRODUCT_FIELDS}
      }
      storeProductOrder {
        _id
        userId
        orderNo
        customerFirstName
        customerLastName
        stylist {
          _id
          name
        }
        trialDate {
          ${DATE_TIME_FIELDS}
        }
        orderDate {
          ${DATE_TIME_FIELDS}
        }
      }
      user {
        lastName
        firstName
        _id
      }
    }
  }
`

export const CREATE_ORDER_TRIAL = gql`
  mutation CreateOrderTrial($orderTrial: OrderTrialInput!) {
    createOrderTrial(orderTrial: $orderTrial) {
      _id
    }
  }
`

export const UPDATE_ORDER_TRIAL = gql`
  mutation UpdateOrderTrial($orderTrialId: ID!, $orderTrial: OrderTrialInput!) {
    updateOrderTrial(orderTrialId: $orderTrialId, orderTrial: $orderTrial) {
      _id
    }
  }
`

/** Nested selection reused by store-order queries. */
export const NESTED_ORDER_TRIAL_FIELDS = `
  orderTrial {
    _id
    trialStatus
    trialRating
    measurementStatus
    note
    trialDecision
    trialBy
    trialDate {
      ${DATE_TIME_FIELDS}
    }
    deliveryDate {
      ${DATE_TIME_FIELDS}
    }
    products {
      ${ORDER_TRIAL_PRODUCT_FIELDS}
    }
  }
`
