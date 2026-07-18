import { gql } from "@apollo/client/core"

/** Trimmed fields for customers list — avoid full UserSchema payload. */
export const GET_USERS_BY_FILTER = gql`
  query GetUsersByFilter($filter: UserFilter, $page: Int, $limit: Int) {
    getUsersByFilter(filter: $filter, page: $page, limit: $limit) {
      _id
      firstName
      lastName
      fullName
      email
      phone
      countryCode
      customerSrNo
      customerId
      customerType
      userStatus
      studioId
      createdAt
      ccDueDate {
        timestamp
      }
      lastUpdatedAt {
        timestamp
      }
      stylist {
        _id
        name
      }
      studios {
        _id
        name
      }
      secondaryStudios {
        _id
        name
      }
    }
  }
`

export type CustomerListRow = {
  _id: string
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  email?: string | null
  phone?: string | null
  countryCode?: string | null
  customerSrNo?: number | null
  customerId?: number | null
  customerType?: string | null
  userStatus?: string | null
  studioId?: string | null
  createdAt?: string | null
  ccDueDate?: { timestamp?: string | null } | null
  lastUpdatedAt?: { timestamp?: string | null } | null
  stylist?: Array<{ _id?: string; name?: string | null } | null> | null
  studios?: Array<{ _id?: string; name?: string | null } | null> | null
  secondaryStudios?: Array<{ _id?: string; name?: string | null } | null> | null
}

export type GetUsersByFilterData = {
  getUsersByFilter: CustomerListRow[]
}

export type MpfDateFilterInput = {
  day: number
  month: number
  year: number
  hour: number
  minute: number
  timestamp: string
  datestamp: string
}

export type UserFilterInput = {
  searchTerm?: string
  isClient?: boolean
  roleFilter?: unknown[]
  sortByEnum?: string
  customerSrNo?: number
  userStatus?: string
  customerType?: string
  countryCode?: string
  studioIds?: string[]
  secondaryStudioIds?: string[]
  startCreatedDate?: MpfDateFilterInput
  endCreatedDate?: MpfDateFilterInput
  startCCDueDate?: MpfDateFilterInput
  endCCDueDate?: MpfDateFilterInput
  startLastUpdatedDate?: MpfDateFilterInput
  endLastUpdatedDate?: MpfDateFilterInput
}

export type GetUsersByFilterVars = {
  page: number
  limit: number
  filter?: UserFilterInput
}

export const CUSTOMERS_PAGE_LIMIT = 100
