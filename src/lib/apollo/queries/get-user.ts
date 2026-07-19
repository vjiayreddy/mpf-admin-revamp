import { gql } from "@apollo/client/core"

/** Full customer profile fields for hub + quick view sheet. */
export const GET_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      _id
      customerSrNo
      firstName
      lastName
      fullName
      aboutMe
      email
      phone
      phone2
      countryCode
      cityId
      cityName
      stateName
      countryName
      userStatus
      customerType
      customerSegment
      gender
      remarks
      isStyleClubMember
      isEmailVerified
      isMobileVerified
      studioId
      createdAt
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
        cover
      }
      stylistId
      stylist {
        _id
        name
      }
      secondaryStylistIds
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

export type CustomerProfileUser = {
  _id: string
  customerSrNo?: number | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  aboutMe?: string | null
  email?: string | null
  phone?: string | null
  phone2?: string | null
  countryCode?: string | null
  cityId?: string | null
  cityName?: string | null
  stateName?: string | null
  countryName?: string | null
  userStatus?: string | null
  customerType?: string | null
  customerSegment?: string | null
  gender?: string | null
  remarks?: string | null
  isStyleClubMember?: boolean | null
  isEmailVerified?: boolean | null
  isMobileVerified?: boolean | null
  studioId?: string | null
  createdAt?: string | null
  dateOfBirth?: { timestamp?: string | null } | null
  ccDueDate?: { timestamp?: string | null } | null
  lastUpdatedAt?: { timestamp?: string | null } | null
  images?: { profile?: string | null; cover?: string | null } | null
  stylistId?: string | null
  stylist?: Array<{ _id?: string; name?: string | null } | null> | null
  secondaryStylistIds?: string[] | null
  secondaryStylists?: Array<{ _id?: string; name?: string | null } | null> | null
  studios?: Array<{ _id?: string; name?: string | null } | null> | null
  secondaryStudios?: Array<{ _id?: string; name?: string | null } | null> | null
}

/** @deprecated Prefer CustomerProfileUser — alias kept for QuickCustomerView. */
export type QuickCustomerUser = CustomerProfileUser

export type GetUserData = {
  user: CustomerProfileUser | null
}

export type GetUserVars = {
  userId: string
}
