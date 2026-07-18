import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const LEADS_PAGE_LIMIT = 100
export const LEADS_EXPORT_LIMIT = 2000

export type LeadTimestamp = {
  timestamp?: string | null
  datestamp?: string | null
  day?: number | null
  month?: number | null
  year?: number | null
  hour?: number | null
  minute?: number | null
}

export type LeadStatusEntry = {
  _id?: string | null
  name?: string | null
  label?: string | null
  note?: string | null
  dateRecorded?: LeadTimestamp | null
}

export type LeadNamedRef = {
  _id?: string | null
  name?: string | null
  title?: string | null
}

export type LeadLinkedOrder = {
  orderId?: string | null
  orderSerialNo?: string | null
}

export type LeadOrderRef = {
  _id?: string | null
  orderNo?: string | number | null
}

export type LeadCifRef = {
  _id?: string | null
  cifSerialNumber?: string | number | null
}

export type LeadCrossSelling = {
  remarks?: string | null
  brandPartnerSubCatIds?: string[] | null
  brandPartnerSubCategories?: LeadNamedRef[] | null
}

export type LeadOccasion = {
  occasion?: string | null
  budget?: number | null
  refImage?: string[] | null
  outfitsNote?: string | null
  priceQuote?: number | null
}

export type LeadListRow = {
  _id: string
  leadId?: string | number | null
  studioId?: string | null
  userId?: string | null
  firstName?: string | null
  lastName?: string | null
  countryCode?: string | null
  cityName?: string | null
  phone?: string | null
  email?: string | null
  sourceCatId?: string | null
  sourceSubCatId?: string | null
  generatedBySalesTeamId?: string | null
  creditToSalesTeamId?: string | null
  estimatedValue?: number | null
  remarks?: string | null
  rating?: number | null
  leadDate?: LeadTimestamp | null
  followUpDate?: LeadTimestamp | null
  eventDate?: LeadTimestamp | null
  expClosureDate?: LeadTimestamp | null
  currentStatusDate?: LeadTimestamp | null
  leadLinkOrderCloseDate?: LeadTimestamp | null
  creditedSalesTeam?: LeadNamedRef[] | null
  generatedSalesTeam?: LeadNamedRef[] | null
  source?: LeadNamedRef[] | null
  studio?: LeadNamedRef[] | null
  status?: LeadStatusEntry[] | null
  orders?: LeadOrderRef[] | null
  linkedOrders?: LeadLinkedOrder[] | null
  customerInformationForms?: LeadCifRef[] | null
  crossSellingDetails?: LeadCrossSelling | null
  occasionDetails?: LeadOccasion | null
}

export type LeadRoleFilterItem = {
  _id: string
  roleIdentifier: string
}

export type LeadFilterInput = {
  roleFilter?: LeadRoleFilterItem[]
  userId?: string
  searchTerm?: string
  status?: string[]
  studioIds?: string[]
  sourceCatIds?: string[]
  creditToSalesTeamIds?: string[]
  brandPartnerSubCatIds?: string[]
  rating?: number
  isDownloadActive?: boolean
  startLeadDate?: MpfDateFilter
  endLeadDate?: MpfDateFilter
  startFollowUpDate?: MpfDateFilter
  endFollowUpDate?: MpfDateFilter
  startExpectedClosureDate?: MpfDateFilter
  endExpectedClosureDate?: MpfDateFilter
  startEventDate?: MpfDateFilter
  endEventDate?: MpfDateFilter
  startLeadLinkOrderCloseDate?: MpfDateFilter
  endLeadLinkOrderCloseDate?: MpfDateFilter
}

export type GetAllLeadsVars = {
  params: LeadFilterInput
  page?: number
  limit?: number
}

export type GetAllLeadsData = {
  getAllLeads: {
    leads: LeadListRow[]
  }
}

export type GetSingleLeadVars = {
  leadId: string
}

export type GetSingleLeadData = {
  getSingleLead: LeadListRow
}

export type GetLatestLeadIdData = {
  getLatestLeadId: string | number
}

export type LeadInput = Record<string, unknown>

export type SaveLeadVars = {
  body: LeadInput
}

export type SaveLeadData = {
  saveLead: { _id: string }
}

export type UpdateLeadStatusVars = {
  leadId: string
  status: string
  reason?: string | null
  date?: MpfDateFilter | null
}

export type UpdateLeadStatusData = {
  updateLeadStatus: boolean | string | null
}

export type CreateUserForLeadVars = {
  userData: Record<string, unknown>
}

export type CreateUserForLeadData = {
  createUserForLead: { userId: string }
}

export type LinkLeadToOrderVars = {
  input: {
    leadId: string
    orderIds: string[]
    userId: string
    note?: string
  }
}

export type LinkLeadToOrderData = {
  linkLeadToOrder: { success?: boolean | null; message?: string | null }
}

export type IssueUnlinkLeadOtpVars = {
  input: {
    leadId: string
    orderId: string
    userId: string
    note?: string
  }
}

export type IssueUnlinkLeadOtpData = {
  issueUnlinkLeadOtp: { success?: boolean | null; message?: string | null }
}

export type UnlinkLeadFromOrderVars = {
  input: {
    leadId: string
    orderId: string
    userId: string
    otp: string
  }
}

export type UnlinkLeadFromOrderData = {
  unlinkLeadFromOrder: { success?: boolean | null; message?: string | null }
}

const LEAD_FIELDS = `
  _id
  leadId
  studioId
  userId
  firstName
  lastName
  leadDate {
    timestamp
    datestamp
    day
    month
    year
    hour
    minute
  }
  countryCode
  cityName
  phone
  email
  sourceCatId
  sourceSubCatId
  generatedBySalesTeamId
  creditToSalesTeamId
  creditedSalesTeam {
    _id
    name
  }
  generatedSalesTeam {
    _id
    name
  }
  customerInformationForms {
    _id
    cifSerialNumber
  }
  orders {
    orderNo
    _id
  }
  estimatedValue
  remarks
  source {
    _id
    name
  }
  studio {
    _id
    name
  }
  status {
    _id
    name
    label
    note
    dateRecorded {
      timestamp
    }
  }
  followUpDate {
    timestamp
  }
  eventDate {
    timestamp
  }
  expClosureDate {
    timestamp
  }
  currentStatusDate {
    timestamp
  }
  rating
  crossSellingDetails {
    remarks
    brandPartnerSubCatIds
    brandPartnerSubCategories {
      _id
      name
      title
    }
  }
  occasionDetails {
    occasion
    budget
    refImage
    outfitsNote
    priceQuote
  }
`

export const GET_ALL_LEADS = gql`
  query GetAllLeads($params: LeadFilterInput!, $page: Int, $limit: Int) {
    getAllLeads(params: $params, page: $page, limit: $limit) {
      leads {
        ${LEAD_FIELDS}
        linkedOrders {
          orderId
          orderSerialNo
        }
        leadLinkOrderCloseDate {
          timestamp
        }
      }
    }
  }
`

export const GET_SINGLE_LEAD = gql`
  query GetSingleLead($leadId: String!) {
    getSingleLead(leadId: $leadId) {
      ${LEAD_FIELDS}
      linkedOrders {
        orderId
        orderSerialNo
      }
      leadLinkOrderCloseDate {
        timestamp
      }
    }
  }
`

export const GET_LATEST_LEAD_ID = gql`
  query GetLatestLeadId {
    getLatestLeadId
  }
`

export const SAVE_LEAD = gql`
  mutation SaveLead($body: LeadInput!) {
    saveLead(body: $body) {
      _id
    }
  }
`

export const UPDATE_LEAD_STATUS = gql`
  mutation UpdateLeadStatus(
    $leadId: String!
    $status: String!
    $reason: String
    $date: DateTimeSchemaInput
  ) {
    updateLeadStatus(
      leadId: $leadId
      status: $status
      reason: $reason
      date: $date
    )
  }
`

export const CREATE_USER_FOR_LEAD = gql`
  mutation CreateUserForLead($userData: createUserInput) {
    createUserForLead(userData: $userData) {
      userId
    }
  }
`

export const LINK_LEAD_TO_ORDER = gql`
  mutation LinkLeadToOrder($input: LinkLeadToOrderInput!) {
    linkLeadToOrder(input: $input) {
      success
      message
    }
  }
`

export const ISSUE_UNLINK_LEAD_OTP = gql`
  mutation IssueUnlinkLeadOtp($input: IssueUnlinkLeadOtpInput!) {
    issueUnlinkLeadOtp(input: $input) {
      success
      message
    }
  }
`

export const UNLINK_LEAD_FROM_ORDER = gql`
  mutation UnlinkLeadFromOrder($input: UnlinkLeadFromOrderInput!) {
    unlinkLeadFromOrder(input: $input) {
      success
      message
    }
  }
`
