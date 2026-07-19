import { gql } from "@apollo/client"

export type BodyProfilePictures = {
  frontPicture?: string | null
  sidePicture?: string | null
  backPicture?: string | null
}

/** Extended body profile fields used by Measurement View. */
export type BodyProfileDetails = BodyProfilePictures & {
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
