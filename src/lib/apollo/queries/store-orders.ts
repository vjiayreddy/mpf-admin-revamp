import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

const DATE_TIME_FIELDS = `
  datestamp
  day
  hour
  minute
  month
  timestamp
  year
`

export type StoreOrderTimestamp = {
  datestamp?: string | null
  day?: number | null
  hour?: number | null
  minute?: number | null
  month?: number | null
  timestamp?: string | null
  year?: number | null
}

export type StoreOrderStylist = {
  _id?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  image?: string | null
  note?: string | null
}

export type StoreOrderCalendarRow = {
  _id: string
  orderNo?: string | number | null
  customerFirstName?: string | null
  customerLastName?: string | null
  orderStatus?: string | null
  remark?: string | null
  orderDate?: StoreOrderTimestamp | null
  trialDate?: StoreOrderTimestamp | null
  stylist?: StoreOrderStylist[] | null
}

export type StoreOrderItem = {
  _id?: string | null
  itemName?: string | null
  itemPrice?: number | null
  itemNumber?: string | number | null
  itemColor?: string | null
  occasion?: string | null
  fabricCode?: string | null
  hasEmbroidary?: boolean | null
  outfitStatus?: string | null
  readyItemImage?: string | null
  fabricImage?: string | null
  referenceImage?: string | null
  itemCatId?: string | null
  productionStatus?: string | null
  measurementApprovalStatus?: string | null
  dyingWorkshopId?: string | null
  dyingWorkshopName?: string | null
  embroideryWorkshopId?: string | null
  embroideryWorkshopName?: string | null
  fabricWorkshopId?: string | null
  fabricWorkshopName?: string | null
  itemWorkshopId?: string | null
  itemWorkshopName?: string | null
  trialDate?: StoreOrderTimestamp | null
  readyDate?: StoreOrderTimestamp | null
  styleDesign?: {
    handDesign?: string | null
    monogramLetter?: string | null
    note?: string | null
    styleAttributes?: Array<{
      catId?: string | null
      image?: string | null
      master_name?: string | null
      name?: string | null
      value?: string | null
    }> | null
  } | null
  referenceLookBooks?: Array<{
    lookBookId?: string | null
    lookBookName?: string | null
    lookBookTitle?: string | null
    lookBookNotes?: string | null
    lookBookImages?: string[] | null
    imageType?: string | null
    lookBookNo?: string | number | null
  }> | null
}

export type StoreOrderDetail = StoreOrderCalendarRow & {
  userId?: string | null
  balanceAmount?: number | null
  orderTotal?: number | null
  eventDate?: StoreOrderTimestamp | null
  deliveryDate?: StoreOrderTimestamp | null
  readyDate?: StoreOrderTimestamp | null
  orderItems?: StoreOrderItem[] | null
  paymentBreakdown?: Array<{
    note?: string | null
    amount?: number | null
    date?: StoreOrderTimestamp | null
    isAdvance?: boolean | string | null
    modeOfPayment?: string | null
  }> | null
  otherChargesBreakdown?: Array<{
    name?: string | null
    amount?: number | null
    note?: string | null
  }> | null
  deductionsBreakdown?: Array<{
    name?: string | null
    amount?: number | null
    note?: string | null
  }> | null
}

export type StoreOrderFilterParams = {
  sortByEnum?: string
  orderStatus?: string | null
  searchTerm?: string
  startTrialDate?: MpfDateFilter
  endTrialDate?: MpfDateFilter
  startOrderDate?: MpfDateFilter
  endOrderDate?: MpfDateFilter
  personalStylistId?: string
  roleFilter?: { _id?: string | null; roleIdentifier?: string | null } | null
}

export type GetAllStoreOrdersVars = {
  params: StoreOrderFilterParams
  page?: number
  limit?: number
}

export type GetAllStoreOrdersData = {
  getAllStoreOrders: StoreOrderCalendarRow[]
}

export type GetStoreOrderByIdVars = { orderId: string }
export type GetStoreOrderByIdData = {
  getStoreOrderById: StoreOrderDetail | null
}

export type SaveStoreOrderVars = {
  params: Record<string, unknown>
}

export type SaveStoreOrderData = {
  saveStoreOrder: { _id: string } | null
}

export const STORE_ORDERS_PAGE_LIMIT = 500

export const GET_ALL_STORE_ORDERS = gql`
  query GetAllStoreOrders(
    $params: StoreProductOrderFilterInputParams!
    $page: Int
    $limit: Int
  ) {
    getAllStoreOrders(params: $params, page: $page, limit: $limit) {
      _id
      orderNo
      customerFirstName
      customerLastName
      orderStatus
      remark
      orderDate {
        ${DATE_TIME_FIELDS}
      }
      trialDate {
        ${DATE_TIME_FIELDS}
      }
      stylist {
        _id
        name
      }
    }
  }
`

export const GET_STORE_ORDER_BY_ID = gql`
  query GetStoreOrderById($orderId: ID!) {
    getStoreOrderById(orderId: $orderId) {
      _id
      userId
      orderNo
      customerFirstName
      customerLastName
      orderStatus
      remark
      balanceAmount
      orderTotal
      orderDate {
        ${DATE_TIME_FIELDS}
      }
      trialDate {
        ${DATE_TIME_FIELDS}
      }
      deliveryDate {
        ${DATE_TIME_FIELDS}
      }
      eventDate {
        ${DATE_TIME_FIELDS}
      }
      readyDate {
        ${DATE_TIME_FIELDS}
      }
      stylist {
        _id
        name
        email
        phone
        image
        note
      }
      paymentBreakdown {
        note
        amount
        isAdvance
        modeOfPayment
        date {
          ${DATE_TIME_FIELDS}
        }
      }
      otherChargesBreakdown {
        name
        amount
        note
      }
      deductionsBreakdown {
        name
        amount
        note
      }
      orderItems {
        _id
        itemName
        itemPrice
        itemNumber
        itemColor
        occasion
        fabricCode
        hasEmbroidary
        outfitStatus
        readyItemImage
        fabricImage
        referenceImage
        itemCatId
        productionStatus
        measurementApprovalStatus
        dyingWorkshopId
        dyingWorkshopName
        embroideryWorkshopId
        embroideryWorkshopName
        fabricWorkshopId
        fabricWorkshopName
        itemWorkshopId
        itemWorkshopName
        trialDate {
          ${DATE_TIME_FIELDS}
        }
        readyDate {
          ${DATE_TIME_FIELDS}
        }
        styleDesign {
          handDesign
          monogramLetter
          note
          styleAttributes {
            catId
            image
            master_name
            name
            value
          }
        }
        referenceLookBooks {
          lookBookId
          lookBookName
          lookBookTitle
          lookBookNotes
          lookBookImages
          imageType
          lookBookNo
        }
      }
    }
  }
`

export const SAVE_STORE_ORDER = gql`
  mutation SaveStoreOrder($params: StoreProductOrderInput) {
    saveStoreOrder(params: $params) {
      _id
    }
  }
`
