import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const INVOICE_PAGE_LIMIT = 100

export type InvoiceTimestamp = {
  timestamp?: string | null
  datestamp?: string | null
  day?: number | null
  month?: number | null
  year?: number | null
  hour?: number | null
  minute?: number | null
}

export type InvoiceCustomerDetails = {
  userId?: string | null
  phone?: string | null
  lastName?: string | null
  firstName?: string | null
  email?: string | null
  customerId?: string | null
}

export type InvoiceTaxDetailsList = {
  cgstInput?: number | null
  cgstPercent?: number | null
  igstInput?: number | null
  igstPercent?: number | null
  sgstInput?: number | null
  sgstPercent?: number | null
}

export type InvoiceListRow = {
  _id: string
  advanceAmount?: number | null
  beforeTaxTotal?: number | null
  grandTotal?: number | null
  orderId?: string | null
  invoiceDate?: InvoiceTimestamp | null
  customerDetails?: InvoiceCustomerDetails | null
  buyerOrderNo?: string | number | null
  invoiceId?: string | null
  invoiceNo?: string | null
  taxDetails?: InvoiceTaxDetailsList | null
}

export type OrderInvoiceFilterInput = {
  searchTerm?: string
}

export type GetOrderInvoicesByFilterVars = {
  page?: number
  limit?: number
  filter?: OrderInvoiceFilterInput
}

export type GetOrderInvoicesByFilterData = {
  getOrderInvoicesByFilter: InvoiceListRow[]
}

export type InvoicePaymentDetail = {
  note?: string | null
  modeOfPayment?: string | null
  isAdvance?: boolean | null
  date?: InvoiceTimestamp | null
  amount?: number | null
}

export type InvoiceAddressDetails = {
  shipToStateCode?: string | null
  billToGSTNo?: string | null
  shipToGSTNo?: string | null
  shipToState?: string | null
  shipToName?: string | null
  shipToAddress?: string | null
  billToStateCode?: string | null
  billToState?: string | null
  billToName?: string | null
  billToAddress?: string | null
  placeOfSupply?: string | null
}

export type InvoiceHsnSummaryRow = {
  cgstAmount?: number | null
  cgstRate?: number | null
  hsnCode?: string | null
  igstAmount?: number | null
  igstRate?: number | null
  sgstAmount?: number | null
  sgstRate?: number | null
  taxableValue?: number | null
  totalAmount?: number | null
  taxAmount?: number | null
}

export type InvoiceTaxDetails = InvoiceTaxDetailsList & {
  isIgst?: boolean | null
  totalTaxableValue?: number | null
  totalTaxAmount?: number | null
  totalSgstAmount?: number | null
  totalIgstAmount?: number | null
  totalCgstAmount?: number | null
  hsnSummary?: InvoiceHsnSummaryRow[] | null
}

export type InvoiceCompanyBankDetails = {
  ifscCode?: string | null
  holderName?: string | null
  branch?: string | null
  bankName?: string | null
  AccNo?: string | null
}

export type InvoiceCompanyDetails = {
  address?: string | null
  bankDetails?: InvoiceCompanyBankDetails | null
  city?: string | null
  email?: string | null
  gstin?: string | null
  name?: string | null
  pinCode?: string | null
  state?: string | null
  stateCode?: string | null
}

export type InvoiceItem = {
  _id?: string | null
  totalAmount?: number | null
  taxPercent?: number | null
  taxAmount?: number | null
  qty?: number | null
  priceExcTax?: number | null
  priceIncTax?: number | null
  name?: string | null
  isPercent?: boolean | null
  hsnCode?: string | null
  discount?: number | null
  discountAmt?: number | null
  amount?: number | null
}

export type InvoiceDetail = {
  _id: string
  orderId?: string | null
  invoiceNo?: string | null
  invoiceId?: string | null
  invoiceDate?: InvoiceTimestamp | null
  advanceAmount?: number | null
  destination?: string | null
  dispatchDocNo?: string | null
  dispatchedThrough?: string | null
  otherReferences?: string | null
  beforeTaxTotal?: number | null
  termsAndConditions?: string | null
  paymentDetails?: InvoicePaymentDetail[] | null
  customerDetails?: InvoiceCustomerDetails | null
  addressDetails?: InvoiceAddressDetails | null
  taxDetails?: InvoiceTaxDetails | null
  taxAmountInWords?: string | null
  grandTotal?: number | null
  deliveryNote?: string | null
  companyDetails?: InvoiceCompanyDetails | null
  note?: string | null
  inWords?: string | null
  buyerOrderNo?: string | number | null
  buyerOrderDate?: InvoiceTimestamp | null
  items?: InvoiceItem[] | null
}

export type GetSingleInvoiceByIdVars = {
  invoiceId: string
}

export type GetSingleInvoiceByIdData = {
  getSingleInvoiceById: InvoiceDetail
}

export type HsnCodeOption = {
  _id: string
  taxPercent?: number | null
  hsnCode?: string | null
  description?: string | null
}

export type GetAllHsnCodesData = {
  getAllHsnCodes: HsnCodeOption[]
}

export type OrderInvoiceItemInput = {
  name?: string
  hsnCode?: string
  qty?: number
  priceIncTax?: number
  discount?: number
  taxPercent?: number
  isPercent?: boolean
}

export type AddOrderInvoiceItemVars = {
  invoiceId: string
  itemInput: OrderInvoiceItemInput
}

export type UpdateOrderInvoiceItemVars = {
  invoiceId: string
  itemId: string
  itemInput: OrderInvoiceItemInput
}

export type DeleteOrderInvoiceItemVars = {
  invoiceId: string
  itemId: string
}

export type OrderInvoiceInput = {
  invoiceDate?: MpfDateFilter
  destination?: string
  dispatchDocNo?: string | number
  dispatchedThrough?: string
  otherReferences?: string
  termsAndConditions?: string
  deliveryNote?: string
  buyerOrderNo?: number
  buyerOrderDate?: MpfDateFilter
  note?: string
  customerDetails?: Omit<InvoiceCustomerDetails, "customerId">
  addressDetails?: InvoiceAddressDetails
}

export type UpdateInvoiceVars = {
  invoiceId: string
  orderInvoiceInput: OrderInvoiceInput
}

export type UpdateInvoiceData = {
  updateInvoice: { _id: string }
}

export type GenerateInvoiceFromStoreOrderVars = {
  orderId: string
}

export type GenerateInvoiceFromStoreOrderData = {
  generateInvoiceFromStoreOrder: {
    _id: string
    invoiceId?: string | null
    invoiceNo?: string | null
  }
}

export const GENERATE_INVOICE_FROM_STORE_ORDER = gql`
  mutation GenerateInvoiceFromStoreOrder($orderId: String!) {
    generateInvoiceFromStoreOrder(orderId: $orderId) {
      _id
      invoiceId
      invoiceNo
    }
  }
`

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoice(
    $invoiceId: ID!
    $orderInvoiceInput: OrderInvoiceInput
  ) {
    updateInvoice(
      invoiceId: $invoiceId
      orderInvoiceInput: $orderInvoiceInput
    ) {
      _id
    }
  }
`

export const GET_SINGLE_INVOICE_BY_ID = gql`
  query GetSingleInvoiceById($invoiceId: ID!) {
    getSingleInvoiceById(invoiceId: $invoiceId) {
      _id
      orderId
      invoiceNo
      invoiceId
      invoiceDate {
        timestamp
        datestamp
        day
        month
        year
        hour
        minute
      }
      advanceAmount
      destination
      dispatchDocNo
      dispatchedThrough
      otherReferences
      beforeTaxTotal
      termsAndConditions
      paymentDetails {
        note
        modeOfPayment
        isAdvance
        date {
          timestamp
        }
        amount
      }
      customerDetails {
        userId
        phone
        lastName
        firstName
        email
        customerId
      }
      addressDetails {
        shipToStateCode
        billToGSTNo
        shipToGSTNo
        shipToState
        shipToName
        shipToAddress
        billToStateCode
        billToState
        billToName
        billToAddress
        placeOfSupply
      }
      taxDetails {
        sgstPercent
        sgstInput
        igstPercent
        igstInput
        isIgst
        totalTaxableValue
        totalTaxAmount
        totalSgstAmount
        totalIgstAmount
        totalCgstAmount
        hsnSummary {
          cgstAmount
          cgstRate
          hsnCode
          igstAmount
          igstRate
          sgstAmount
          sgstRate
          taxableValue
          totalAmount
          taxAmount
        }
        cgstPercent
        cgstInput
      }
      taxAmountInWords
      grandTotal
      deliveryNote
      companyDetails {
        address
        bankDetails {
          ifscCode
          holderName
          branch
          bankName
          AccNo
        }
        city
        email
        gstin
        name
        pinCode
        state
        stateCode
      }
      note
      inWords
      buyerOrderNo
      buyerOrderDate {
        timestamp
      }
      items {
        totalAmount
        taxPercent
        taxAmount
        qty
        priceExcTax
        priceIncTax
        name
        isPercent
        hsnCode
        discount
        discountAmt
        amount
        _id
      }
    }
  }
`

export const GET_ORDER_INVOICES_BY_FILTER = gql`
  query GetOrderInvoicesByFilter(
    $page: Int
    $limit: Int
    $filter: OrderInvoiceFilterInput
  ) {
    getOrderInvoicesByFilter(page: $page, limit: $limit, filter: $filter) {
      _id
      advanceAmount
      beforeTaxTotal
      grandTotal
      orderId
      invoiceDate {
        timestamp
      }
      customerDetails {
        userId
        phone
        lastName
        firstName
        email
        customerId
      }
      buyerOrderNo
      invoiceId
      invoiceNo
      taxDetails {
        cgstInput
        cgstPercent
        igstInput
        igstPercent
        sgstInput
        sgstPercent
      }
    }
  }
`

export const GET_ALL_HSN_CODES = gql`
  query GetAllHsnCodes {
    getAllHsnCodes {
      taxPercent
      hsnCode
      description
      _id
    }
  }
`

export const ADD_ORDER_INVOICE_ITEM = gql`
  mutation AddOrderInvoiceItem(
    $invoiceId: ID!
    $itemInput: OrderInvoiceItemInput
  ) {
    addOrderInvoiceItem(invoiceId: $invoiceId, itemInput: $itemInput) {
      _id
    }
  }
`

export const UPDATE_ORDER_INVOICE_ITEM = gql`
  mutation UpdateOrderInvoiceItem(
    $invoiceId: ID!
    $itemId: String!
    $itemInput: OrderInvoiceItemInput
  ) {
    updateOrderInvoiceItem(
      invoiceId: $invoiceId
      itemId: $itemId
      itemInput: $itemInput
    ) {
      _id
    }
  }
`

export const DELETE_ORDER_INVOICE_ITEM = gql`
  mutation DeleteOrderInvoiceItem($invoiceId: ID!, $itemId: String!) {
    deleteOrderInvoiceItem(invoiceId: $invoiceId, itemId: $itemId) {
      _id
    }
  }
`
