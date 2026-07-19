import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $userId: String!
    $updateData: UpdateUserProfileInput!
  ) {
    updateUserProfile(userId: $userId, updateData: $updateData)
  }
`

export type UpdateUserProfileInput = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  countryCode?: string | null
  dateOfBirth?: MpfDateFilter | null
  customerSrNo?: number | null
  gender?: string | null
  stylistId?: string | null
  secondaryStylistIds?: string[] | null
  userStatus?: string | null
  customerSegment?: string | null
  customerType?: string | null
  isStyleClubMember?: "YES" | "NO" | boolean | null
  remarks?: string | null
  cityId?: string | null
  cityName?: string | null
  stateName?: string | null
  countryName?: string | null
  ccDueDate?: MpfDateFilter | null
  images?: { profile?: string | null; cover?: string | null } | null
}

export type UpdateUserProfileData = {
  updateUserProfile: boolean | string | null
}

export type UpdateUserProfileVars = {
  userId: string
  updateData: UpdateUserProfileInput
}
