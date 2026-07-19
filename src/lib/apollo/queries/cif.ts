import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const CIF_PAGE_LIMIT = 100

export type CifTimestamp = {
  timestamp?: string | null
  datestamp?: string | null
  day?: number | null
  month?: number | null
  year?: number | null
  hour?: number | null
  minute?: number | null
}

export type CifNamedRef = {
  _id?: string | null
  name?: string | null
  title?: string | null
}

export type CifLeadRef = {
  _id?: string | null
  leadId?: number | string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  countryCode?: string | null
}

export type CifLookbookDetail = {
  lookbookDocument?: string | null
  lookbookId?: string | null
  shareLink?: string | null
  sharedDate?: CifTimestamp | null
  stylistComment?: string | null
  uploadedDate?: CifTimestamp | null
}

export type CifReferenceLookBook = {
  lookBookId?: string | null
  lookBookNo?: string | number | null
  lookBookName?: string | null
  lookBookTitle?: string | null
  lookBookImages?: string[] | null
  lookBookNotes?: string | null
  imageType?: string | null
}

export type CifOccasionDetail = {
  occasion?: string | null
  budget?: number | null
  refImage?: string[] | null
  outfitsNote?: string | null
  priceQuote?: number | null
  categoryName?: string[] | null
  referenceLookBooks?: CifReferenceLookBook[] | null
}

export type CifCrossSellingDetail = {
  remarks?: string | null
  brandPartnerSubCatIds?: string[] | null
  brandPartnerSubCategories?: CifNamedRef[] | null
  referenceLookBooks?: CifReferenceLookBook[] | null
}

export type CifListRow = {
  _id: string
  firstName?: string | null
  lastName?: string | null
  eventType?: string | null
  phone?: string | null
  userId?: string | null
  isLookBookShared?: boolean | null
  leads?: CifLeadRef[] | null
  createdDate?: CifTimestamp | null
  eventDate?: CifTimestamp | null
  followUpDate?: CifTimestamp | null
  studioId?: string | null
  studio?: CifNamedRef | CifNamedRef[] | null
  sourceCatId?: string | null
  sourceSubCatId?: string | null
  customerSerialNo?: string | number | null
  countryCode?: string | null
  customerInfoStatus?: string | null
  lookingFor?: string | null
  gender?: string | null
  lastVisitedDate?: CifTimestamp | null
  cifSerialNumber?: string | number | null
  email?: string | null
  note?: string | null
  rating?: number | null
  followUpByIds?: string[] | null
  followUpByTeam?: CifNamedRef[] | null
  crossSellingNote?: string | null
  salesTeamRemarksNote?: string | null
  stylistId?: string | null
  stylist?: CifNamedRef | CifNamedRef[] | null
  lookbookDetails?: CifLookbookDetail[] | null
  occasionDetails?: CifOccasionDetail[] | null
  crossSellingDetails?: CifCrossSellingDetail[] | null
  source?: CifNamedRef | CifNamedRef[] | null
}

export type CifFilterInput = {
  userId?: string
  customerInfoStatus?: string
  stylistId?: string
  searchTerm?: string
  startEventDate?: MpfDateFilter
  endEventDate?: MpfDateFilter
  startFollowUpDate?: MpfDateFilter
  endFollowUpDate?: MpfDateFilter
  startCreatedDate?: MpfDateFilter
  endCreatedDate?: MpfDateFilter
  brandPartnerSubCatIds?: string[]
  rating?: number
  studioIds?: string[]
  followUpByIds?: string[]
}

export type GetAllCifListData = {
  getAllCustomerInformationList: {
    customers: CifListRow[]
    totalCount: number
  }
}

export type GetAllCifListVars = {
  filter?: CifFilterInput
  page?: number
  limit?: number
}

export type GetSingleCifData = {
  getSingleCustomerInformation: CifListRow | null
}

export type GetSingleCifVars = {
  getSingleCustomerInformationId?: string
  phone?: string
}

export type SaveCifData = {
  saveCustomerInformationForm: { _id: string }
}

export type SaveCifVars = {
  customerInfo: Record<string, unknown>
  customerInfoId?: string | null
}

const DATE_TIME_FIELDS = `
  timestamp
  datestamp
  day
  month
  year
  hour
  minute
`

const CIF_LIST_FIELDS = `
  _id
  firstName
  lastName
  eventType
  phone
  userId
  isLookBookShared
  leads {
    _id
    leadId
    firstName
    lastName
    phone
    countryCode
  }
  createdDate {
    ${DATE_TIME_FIELDS}
  }
  eventDate {
    ${DATE_TIME_FIELDS}
  }
  followUpDate {
    ${DATE_TIME_FIELDS}
  }
  studioId
  studio {
    _id
    name
  }
  sourceCatId
  sourceSubCatId
  customerSerialNo
  countryCode
  customerInfoStatus
  lookingFor
  gender
  lastVisitedDate {
    ${DATE_TIME_FIELDS}
  }
  cifSerialNumber
  email
  note
  rating
  followUpByIds
  followUpByTeam {
    _id
    name
  }
  crossSellingNote
  salesTeamRemarksNote
  stylistId
  stylist {
    _id
    name
  }
  lookbookDetails {
    lookbookDocument
    lookbookId
    shareLink
    sharedDate {
      ${DATE_TIME_FIELDS}
    }
    stylistComment
    uploadedDate {
      ${DATE_TIME_FIELDS}
    }
  }
  occasionDetails {
    occasion
    budget
    refImage
    outfitsNote
    priceQuote
    categoryName
  }
  crossSellingDetails {
    remarks
    brandPartnerSubCatIds
    brandPartnerSubCategories {
      _id
      name
      title
    }
  }
  source {
    _id
    name
  }
`

export const GET_ALL_CIF_LIST = gql`
  query GetAllCustomerInformationList(
    $filter: CIFFilterInput
    $page: Int
    $limit: Int
  ) {
    getAllCustomerInformationList(filter: $filter, page: $page, limit: $limit) {
      customers {
        ${CIF_LIST_FIELDS}
      }
      totalCount
    }
  }
`

export const GET_SINGLE_CIF = gql`
  query GetSingleCustomerInformation(
    $getSingleCustomerInformationId: ID
    $phone: String
  ) {
    getSingleCustomerInformation(
      id: $getSingleCustomerInformationId
      phone: $phone
    ) {
      ${CIF_LIST_FIELDS}
      occasionDetails {
        occasion
        budget
        refImage
        outfitsNote
        priceQuote
        categoryName
        referenceLookBooks {
          lookBookId
          lookBookNo
          lookBookName
          lookBookTitle
          lookBookImages
          lookBookNotes
          imageType
        }
      }
      crossSellingDetails {
        remarks
        brandPartnerSubCatIds
        brandPartnerSubCategories {
          _id
          name
          title
        }
        referenceLookBooks {
          lookBookId
          lookBookNo
          lookBookName
          lookBookTitle
          lookBookImages
          lookBookNotes
          imageType
        }
      }
    }
  }
`

export const SAVE_CIF = gql`
  mutation SaveCustomerInformationForm(
    $customerInfo: CustomerInformationFormInput!
    $customerInfoId: String
  ) {
    saveCustomerInformationForm(
      customerInfo: $customerInfo
      customerInfoId: $customerInfoId
    ) {
      _id
    }
  }
`

export function studioName(row: CifListRow): string {
  const studio = row.studio
  if (Array.isArray(studio)) return studio[0]?.name ?? "—"
  return studio?.name ?? "—"
}

export function stylistName(row: CifListRow): string {
  const stylist = row.stylist
  if (Array.isArray(stylist)) return stylist[0]?.name ?? "—"
  return stylist?.name ?? "—"
}

export function crossSellLabels(row: CifListRow): string {
  const details = row.crossSellingDetails ?? []
  const names = details.flatMap(
    (d) =>
      d.brandPartnerSubCategories?.map((c) => c.name || c.title || "").filter(
        Boolean
      ) ?? []
  )
  return names.length > 0 ? names.join(", ") : "—"
}
