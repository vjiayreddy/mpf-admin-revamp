import { gql } from "@apollo/client"

export type BodyProfilePictures = {
  frontPicture?: string | null
  sidePicture?: string | null
  backPicture?: string | null
}

/** Extended body profile fields used by Measurement View. */
export type BodyProfileDetails = BodyProfilePictures & {
  _id?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  countryCode?: string | null
  height?: number | null
  weight?: number | null
  age?: number | null
  shoulderTypeId?: string | null
  bodyPostureId?: string | null
  bodyShapeId?: string | null
  fitPreferenceId?: string | null
}

export type GetBodyProfileData = {
  getBodyProfile: BodyProfileDetails[] | null
}

export type GetBodyProfileVars = {
  userId: string
}

export type UserBodyProfileInput = {
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  countryCode?: string
  height?: number
  /** API requires Int! — always send a whole number (use 0 when unknown). */
  weight: number
  /** API requires Int! — always send a whole number (use 0 when unknown). */
  age: number
  shoulderTypeId?: string
  bodyPostureId?: string
  bodyShapeId?: string
  fitPreferenceId?: string
  frontPicture?: string | null
  sidePicture?: string | null
  backPicture?: string | null
}

export type SaveBodyProfileData = {
  saveBodyProfile: { _id?: string | null; frontPicture?: string | null } | null
}

export type SaveBodyProfileVars = {
  basicInfo: UserBodyProfileInput
}

/** Body-profile fetch — photos + basic attributes for measurement view. */
export const GET_BODY_PROFILE = gql`
  query GetBodyProfile($userId: String!) {
    getBodyProfile(userId: $userId) {
      firstName
      lastName
      email
      phone
      countryCode
      height
      weight
      age
      shoulderTypeId
      bodyPostureId
      bodyShapeId
      fitPreferenceId
      frontPicture
      sidePicture
      backPicture
    }
  }
`

export const SAVE_BODY_PROFILE = gql`
  mutation SaveBodyProfile($basicInfo: UserBodyProfileInput) {
    saveBodyProfile(basicInfo: $basicInfo) {
      _id
      frontPicture
    }
  }
`

export const SAVE_BODY_PROFILE_FRONT_PICTURE = gql`
  mutation SaveBodyProfileFrontPicture(
    $picture: FileUpload!
    $userId: String!
  ) {
    saveBodyProfileFrontPicture(picture: $picture, userId: $userId) {
      imageUrl
    }
  }
`

export const SAVE_BODY_PROFILE_SIDE_PICTURE = gql`
  mutation SaveBodyProfileSidePicture($picture: Upload!, $userId: String!) {
    saveBodyProfileSidePicture(picture: $picture, userId: $userId) {
      imageUrl
    }
  }
`

export const SAVE_BODY_PROFILE_BACK_PICTURE = gql`
  mutation SaveBodyProfileBackPicture($picture: Upload!, $userId: String!) {
    saveBodyProfileBackPicture(picture: $picture, userId: $userId) {
      imageUrl
    }
  }
`

export function bodyProfileImageUrls(
  profile?: BodyProfilePictures | null
): string[] {
  const urls: string[] = []
  const push = (url?: string | null) => {
    const trimmed = url?.trim()
    if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
  }
  if (!profile) return urls
  push(profile.frontPicture)
  push(profile.sidePicture)
  push(profile.backPicture)
  return urls
}

export function firstBodyProfile(
  data?: GetBodyProfileData | null
): BodyProfileDetails | null {
  const list = data?.getBodyProfile
  if (!list?.length) return null
  return list[0] ?? null
}
