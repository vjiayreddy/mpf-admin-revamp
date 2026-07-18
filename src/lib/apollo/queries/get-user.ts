import { gql } from "@apollo/client/core"

/** Trimmed user fields for quick customer view sheet. */
export const GET_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      _id
      customerSrNo
      firstName
      lastName
      fullName
      email
      phone
      countryCode
      cityName
      stateName
      countryName
      userStatus
      customerType
      customerSegment
      studioId
      dateOfBirth {
        timestamp
      }
      ccDueDate {
        timestamp
      }
      lastUpdatedAt {
        timestamp
      }
      images {
        profile
      }
      stylist {
        _id
        name
      }
      secondaryStylists {
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

export type QuickCustomerUser = {
  _id: string
  customerSrNo?: number | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  email?: string | null
  phone?: string | null
  countryCode?: string | null
  cityName?: string | null
  stateName?: string | null
  countryName?: string | null
  userStatus?: string | null
  customerType?: string | null
  customerSegment?: string | null
  studioId?: string | null
  dateOfBirth?: { timestamp?: string | null } | null
  ccDueDate?: { timestamp?: string | null } | null
  lastUpdatedAt?: { timestamp?: string | null } | null
  images?: { profile?: string | null } | null
  stylist?: Array<{ _id?: string; name?: string | null } | null> | null
  secondaryStylists?: Array<{ _id?: string; name?: string | null } | null> | null
  studios?: Array<{ _id?: string; name?: string | null } | null> | null
  secondaryStudios?: Array<{ _id?: string; name?: string | null } | null> | null
}

export type GetUserData = {
  user: QuickCustomerUser | null
}

export type GetUserVars = {
  userId: string
}
