import { gql } from "@apollo/client/core"

export const ONLINE_ORDERS_PAGE_LIMIT = 100

export type OnlineOrderTimestamp = {
  timestamp?: string | null
}

export type OnlineOrderStatusEntry = {
  _id?: string | null
  name?: string | null
  label?: string | null
  note?: string | null
  userId?: string | null
  dateRecorded?: {
    datestamp?: string | null
  } | null
}

export type OnlineOrderAddress = {
  _id?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email?: string | null
  address1?: string | null
  address2?: string | null
  landmark?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  countryCode?: string | null
  postalCode?: string | null
}

export type OnlineOrderItem = {
  itemId?: string | null
  name?: string | null
  price?: number | null
  qty?: number | null
  producttypeId?: string | null
  images?: string[] | null
}

export type OnlineOrderListRow = {
  _id: string
  userId?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email?: string | null
  razorPayId?: string | null
  isPaid?: boolean | null
  orderId?: string | null
  orderTotal?: number | null
  orderDateTime?: OnlineOrderTimestamp | null
  paidDateTime?: OnlineOrderTimestamp | null
  items?: OnlineOrderItem[] | null
  address?: OnlineOrderAddress | null
  status?: OnlineOrderStatusEntry[] | null
}

export type GetAllProductOrdersVars = {
  page: number
  limit?: number
}

export type GetAllProductOrdersData = {
  getAllProductOrders: OnlineOrderListRow[]
}

export const GET_ALL_PRODUCT_ORDERS = gql`
  query GetAllProductOrders($page: Int!, $limit: Int) {
    getAllProductOrders(page: $page, limit: $limit) {
      _id
      userId
      firstName
      lastName
      phone
      razorPayId
      isPaid
      email
      orderId
      orderDateTime {
        timestamp
      }
      paidDateTime {
        timestamp
      }
      items {
        images
        itemId
        name
        price
        producttypeId
        qty
      }
      address {
        state
        postalCode
        phone
        lastName
        landmark
        firstName
        email
        countryCode
        country
        city
        address2
        address1
        _id
      }
      orderTotal
      status {
        name
        label
        note
        userId
        dateRecorded {
          datestamp
        }
        _id
      }
    }
  }
`
