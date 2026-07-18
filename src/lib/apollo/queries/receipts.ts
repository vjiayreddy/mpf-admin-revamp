import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const RECEIPTS_PAGE_LIMIT = 50
export const RECEIPTS_EXPORT_LIMIT = 2000

export type ReceiptTimestamp = {
  timestamp?: string | null
}

export type ReceiptListRow = {
  paymentId: string
  orderId?: string | null
  orderNo?: string | null
  customerId?: string | null
  customerFirstName?: string | null
  customerLastName?: string | null
  stylistName?: string | null
  personalStylistId?: string | null
  paymentAmount?: number | null
  netAmount?: number | null
  orderBalance?: number | null
  paymentMode?: string | null
  isPaymentAdvance?: boolean | null
  isVerified?: boolean | null
  verifiedBy?: string | null
  screenShotUrl?: string | null
  transactionRef?: string | null
  transactionRefImageUrl?: string | null
  paymentNote?: string | null
  paymentAccountRemark?: string | null
  paymentDate?: ReceiptTimestamp | null
  orderDate?: ReceiptTimestamp | null
}

export type StoreOrderPaymentsFilterInput = {
  searchTerm?: string
  stylistId?: string
  paymentStartDate?: MpfDateFilter
  paymentEndDate?: MpfDateFilter
  hasBalance?: boolean
}

export type GetStoreOrderPaymentsVars = {
  params: StoreOrderPaymentsFilterInput
  page?: number
  limit?: number
}

export type GetStoreOrderPaymentsData = {
  getStoreOrderPayments: {
    totalCount: number
    totalAmount: number
    payments: ReceiptListRow[]
  }
}

export type StoreProductOrderPaymentInput = {
  orderId: string
  paymentId: string
  modeOfPayment?: string
  accountRemark?: string
  date?: MpfDateFilter
  amount?: number
}

export type VerifyStoreOrderPaymentVars = {
  body: StoreProductOrderPaymentInput
}

export type VerifyStoreOrderPaymentData = {
  verifyStoreOrderPayment: boolean | string | null
}

export const GET_STORE_ORDER_PAYMENTS = gql`
  query GetStoreOrderPayments(
    $params: StoreOrderPaymentsFilterInput!
    $page: Int
    $limit: Int
  ) {
    getStoreOrderPayments(params: $params, page: $page, limit: $limit) {
      totalCount
      totalAmount
      payments {
        netAmount
        customerFirstName
        customerId
        customerLastName
        isPaymentAdvance
        isVerified
        orderId
        orderNo
        paymentAmount
        paymentDate {
          timestamp
        }
        orderDate {
          timestamp
        }
        orderBalance
        paymentMode
        personalStylistId
        screenShotUrl
        stylistName
        transactionRef
        transactionRefImageUrl
        verifiedBy
        paymentId
        paymentNote
        paymentAccountRemark
      }
    }
  }
`

export const VERIFY_STORE_ORDER_PAYMENT = gql`
  mutation VerifyStoreOrderPayment($body: StoreProductOrderPaymentInput!) {
    verifyStoreOrderPayment(body: $body)
  }
`

export const INITIATE_USER_EXPORT_OTP = gql`
  mutation InitiateUserDownloadData(
    $userId: String!
    $module: DataDownloadModuleEnum!
    $reason: String!
  ) {
    initiateUserDownloadData(userId: $userId, module: $module, reason: $reason)
  }
`

export const VERIFY_USER_EXPORT_OTP = gql`
  mutation VerifyUserDownloadData($downloadHistoryId: String!, $otp: String!) {
    verifyUserDownloadData(downloadHistoryId: $downloadHistoryId, otp: $otp)
  }
`

export type InitiateUserExportOtpVars = {
  userId: string
  module: string
  reason: string
}

export type InitiateUserExportOtpData = {
  initiateUserDownloadData: string
}

export type VerifyUserExportOtpVars = {
  downloadHistoryId: string
  otp: string
}

export type VerifyUserExportOtpData = {
  verifyUserDownloadData: boolean | string | null
}
