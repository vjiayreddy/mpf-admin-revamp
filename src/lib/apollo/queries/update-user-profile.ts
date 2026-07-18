import { gql } from "@apollo/client/core"

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $userId: String!
    $updateData: UpdateUserProfileInput!
  ) {
    updateUserProfile(userId: $userId, updateData: $updateData)
  }
`

export type UpdateUserProfileInput = {
  stylistId?: string | null
  ccDueDate?: {
    day: number
    month: number
    year: number
    hour: number
    minute: number
    timestamp: string
    datestamp: string
  } | null
  userStatus?: string | null
  customerSegment?: string | null
  customerType?: string | null
  isStyleClubMember?: "YES" | "NO" | null
  remarks?: string | null
  cityId?: string | null
}

export type UpdateUserProfileData = {
  updateUserProfile: boolean | string | null
}

export type UpdateUserProfileVars = {
  userId: string
  updateData: UpdateUserProfileInput
}
