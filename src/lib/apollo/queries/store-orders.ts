import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"
import type { NestedOrderTrial } from "@/lib/apollo/queries/trial"
import { NESTED_ORDER_TRIAL_FIELDS } from "@/lib/apollo/queries/trial"

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

/** Slim order row for the track-orders list grid (no nested item payloads). */
export type StoreOrderListRow = StoreOrderCalendarRow & {
  userId?: string | null
  customerId?: string | null
  productionStatus?: string | null
  balanceAmount?: number | null
  isGroupCreated?: boolean | null
  readyDate?: StoreOrderTimestamp | null
  studio?: Array<{ _id?: string | null; name?: string | null } | null> | null
  /** Present when list query selects slim orderTrial. */
  orderTrial?: Pick<NestedOrderTrial, "_id"> | null
}

/** Trial All Orders tab — store orders with nested orderTrial. */
export type TrialStoreOrderRow = StoreOrderCalendarRow & {
  userId?: string | null
  customerId?: string | null
  customerPhone?: string | null
  customerCountryCode?: string | null
  orderTrial?: NestedOrderTrial | null
}

export type GetTrialStoreOrdersData = {
  getAllStoreOrders: TrialStoreOrderRow[]
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
  fitImage?: string | null
  qrCodeImage?: string | null
  itemCatId?: string | null
  productionStatus?: string | null
  measurementApprovalStatus?: string | null
  trackingNote?: string | null
  dyingWorkshopId?: string | null
  dyingWorkshopName?: string | null
  embroideryWorkshopId?: string | null
  embroideryWorkshopName?: string | null
  fabricWorkshopId?: string | null
  fabricWorkshopName?: string | null
  itemWorkshopId?: string | null
  itemWorkshopName?: string | null
  stitchingWorkshopId?: string | null
  stitchingWorkshopName?: string | null
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
  customerId?: string | null
  customerPhone?: string | null
  customerCountryCode?: string | null
  balanceAmount?: number | null
  orderTotal?: number | null
  eventDate?: StoreOrderTimestamp | null
  deliveryDate?: StoreOrderTimestamp | null
  readyDate?: StoreOrderTimestamp | null
  orderItems?: StoreOrderItem[] | null
  orderTrial?: NestedOrderTrial | null
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
  startEventDate?: MpfDateFilter
  endEventDate?: MpfDateFilter
  startReadyDate?: MpfDateFilter
  endReadyDate?: MpfDateFilter
  startDeliveryDate?: MpfDateFilter
  endDeliveryDate?: MpfDateFilter
  personalStylistId?: string
  roleFilter?: { _id?: string | null; roleIdentifier?: string | null } | null
  studioIds?: string[]
  measurementApprovalStatus?: string | null
  outfitStatus?: string[]
  catIds?: string[]
  hasEmbroidary?: boolean
}

export type GetAllStoreOrdersVars = {
  params: StoreOrderFilterParams
  page?: number
  limit?: number
}

export type GetAllStoreOrdersData = {
  getAllStoreOrders: StoreOrderCalendarRow[]
}

export type GetTrackOrdersListData = {
  getAllStoreOrders: StoreOrderListRow[]
}

export type GetStoreOrderByIdVars = { orderId: string }
export type GetStoreOrderByIdData = {
  getStoreOrderById: StoreOrderDetail | null
}

export type StoreOrderQualityCheckRef = {
  _id: string
  qualityCheckStatus?: string | null
  itemNumber?: string | number | null
}

/** Detail expand payload — items + slim styleDesign (no payments / lookbooks). */
export type StoreOrderItemsDetail = {
  _id: string
  orderNo?: string | number | null
  orderItems?: StoreOrderItem[] | null
  orderQualityChecks?: StoreOrderQualityCheckRef[] | null
}

export type GetStoreOrderItemsDetailData = {
  getStoreOrderById: StoreOrderItemsDetail | null
}

export type SaveStoreOrderVars = {
  params: Record<string, unknown>
}

export type SaveStoreOrderData = {
  saveStoreOrder: { _id: string } | null
}

export type StoreOrderUpdateAttributes = {
  trialDate?: Record<string, unknown> | null
  readyDate?: Record<string, unknown> | null
  orderStatus?: string | null
  remark?: string | null
  isGroupCreated?: boolean | null
}

export type UpdateStoreOrderAttributesVars = {
  orderId: string
  attributes: StoreOrderUpdateAttributes
}

export type UpdateStoreOrderAttributesData = {
  updateStoreOrderAttributes: { _id: string } | null
}

export type StoreOrderItemUpdateAttributes = {
  outfitStatus?: string | null
  trackingNote?: string | null
  trialDate?: Record<string, unknown> | null
  readyDate?: Record<string, unknown> | null
  dyingWorkshopId?: string | null
  dyingWorkshopName?: string | null
  itemWorkshopId?: string | null
  itemWorkshopName?: string | null
  fabricWorkshopId?: string | null
  fabricWorkshopName?: string | null
  embroideryWorkshopId?: string | null
  embroideryWorkshopName?: string | null
  stitchingWorkshopId?: string | null
  stitchingWorkshopName?: string | null
  readyItemImage?: string | null
}

export type UpdateStoreOrderItemAttributesVars = {
  orderId: string
  orderItemId: string
  attributes: StoreOrderItemUpdateAttributes
}

export type UpdateStoreOrderItemAttributesData = {
  updateStoreOrderItemAttributes: boolean | null
}

export type ProductionStatusEnum =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "ISSUE"
  | "URGENT"

export type UpdateStoreOrderProductionStatusVars = {
  orderId: string
  productionStatus: ProductionStatusEnum
}

export type UpdateStoreOrderProductionStatusData = {
  updateStoreOrderProductionStatus: boolean | null
}

export type UpdateStoreOrderItemProductionStatusVars = {
  orderId: string
  orderItemId: string
  productionStatus: ProductionStatusEnum
}

export type UpdateStoreOrderItemProductionStatusData = {
  updateStoreOrderItemProductionStatus: boolean | null
}

export const STORE_ORDERS_PAGE_LIMIT = 500
/** Server page size for track-orders AG Grid list (legacy used 100). */
export const TRACK_ORDERS_LIST_PAGE_LIMIT = 100

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

/** Order-level list selection — no orderItems / images / styleDesign trees. */
export const GET_TRACK_ORDERS_LIST = gql`
  query GetTrackOrdersList(
    $params: StoreProductOrderFilterInputParams!
    $page: Int
    $limit: Int
  ) {
    getAllStoreOrders(params: $params, page: $page, limit: $limit) {
      _id
      userId
      customerId
      orderNo
      customerFirstName
      customerLastName
      orderStatus
      productionStatus
      remark
      balanceAmount
      isGroupCreated
      orderDate {
        ${DATE_TIME_FIELDS}
      }
      trialDate {
        ${DATE_TIME_FIELDS}
      }
      readyDate {
        ${DATE_TIME_FIELDS}
      }
      stylist {
        _id
        name
      }
      studio {
        _id
        name
      }
      orderTrial {
        _id
      }
    }
  }
`

/** Trial module All Orders tab — includes nested orderTrial for view/enter. */
export const GET_TRIAL_STORE_ORDERS = gql`
  query GetTrialStoreOrders(
    $params: StoreProductOrderFilterInputParams!
    $page: Int
    $limit: Int
  ) {
    getAllStoreOrders(params: $params, page: $page, limit: $limit) {
      _id
      userId
      customerId
      customerPhone
      customerCountryCode
      orderNo
      customerFirstName
      customerLastName
      orderStatus
      orderDate {
        ${DATE_TIME_FIELDS}
      }
      trialDate {
        ${DATE_TIME_FIELDS}
      }
      deliveryDate {
        ${DATE_TIME_FIELDS}
      }
      stylist {
        _id
        name
      }
      ${NESTED_ORDER_TRIAL_FIELDS}
    }
  }
`

/** On-expand items for list master/detail — slim vs full getById. */
export const GET_STORE_ORDER_ITEMS_FOR_DETAIL = gql`
  query GetStoreOrderItemsForDetail($orderId: ID!) {
    getStoreOrderById(orderId: $orderId) {
      _id
      orderNo
      orderQualityChecks {
        _id
        qualityCheckStatus
        itemNumber
      }
      orderItems {
        _id
        itemName
        itemNumber
        itemColor
        fabricCode
        hasEmbroidary
        outfitStatus
        productionStatus
        measurementApprovalStatus
        trackingNote
        itemCatId
        readyItemImage
        fabricImage
        referenceImage
        fitImage
        qrCodeImage
        itemWorkshopId
        itemWorkshopName
        embroideryWorkshopId
        embroideryWorkshopName
        dyingWorkshopId
        dyingWorkshopName
        fabricWorkshopId
        fabricWorkshopName
        stitchingWorkshopId
        stitchingWorkshopName
        styleDesign {
          note
          handDesign
          monogramLetter
          styleAttributes {
            catId
            image
            master_name
            name
            value
          }
        }
        trialDate {
          ${DATE_TIME_FIELDS}
        }
        readyDate {
          ${DATE_TIME_FIELDS}
        }
      }
    }
  }
`

export const GET_STORE_ORDER_BY_ID = gql`
  query GetStoreOrderById($orderId: ID!) {
    getStoreOrderById(orderId: $orderId) {
      _id
      userId
      customerId
      customerPhone
      customerCountryCode
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
      ${NESTED_ORDER_TRIAL_FIELDS}
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

export const UPDATE_STORE_ORDER_ATTRIBUTES = gql`
  mutation UpdateStoreOrderAttributes(
    $orderId: String!
    $attributes: StoreProductOrderUpdateAttributesInput!
  ) {
    updateStoreOrderAttributes(orderId: $orderId, attributes: $attributes) {
      _id
    }
  }
`

export const UPDATE_STORE_ORDER_ITEM_ATTRIBUTES = gql`
  mutation UpdateStoreOrderItemAttributes(
    $orderId: String!
    $orderItemId: String!
    $attributes: StoreProductOrderItemUpdateAttributesInput!
  ) {
    updateStoreOrderItemAttributes(
      orderId: $orderId
      orderItemId: $orderItemId
      attributes: $attributes
    )
  }
`

export const UPDATE_STORE_ORDER_PRODUCTION_STATUS = gql`
  mutation UpdateStoreOrderProductionStatus(
    $orderId: String!
    $productionStatus: ProductionStatusEnum!
  ) {
    updateStoreOrderProductionStatus(
      orderId: $orderId
      productionStatus: $productionStatus
    )
  }
`

export const UPDATE_STORE_ORDER_ITEM_PRODUCTION_STATUS = gql`
  mutation UpdateStoreOrderItemProductionStatus(
    $orderId: String!
    $orderItemId: String!
    $productionStatus: ProductionStatusEnum!
  ) {
    updateStoreOrderItemProductionStatus(
      orderId: $orderId
      orderItemId: $orderItemId
      productionStatus: $productionStatus
    )
  }
`

export type GenerateOrderItemQrCodeVars = {
  orderId: string
  orderItemId: string
}

export type GenerateOrderItemQrCodeData = {
  generateOrderItemQrCode: {
    qrCodeUrl?: string | null
  } | null
}

export const GENERATE_ORDER_ITEM_QR_CODE = gql`
  mutation GenerateOrderItemQrCode($orderId: String!, $orderItemId: String!) {
    generateOrderItemQrCode(orderId: $orderId, orderItemId: $orderItemId) {
      qrCodeUrl
    }
  }
`
