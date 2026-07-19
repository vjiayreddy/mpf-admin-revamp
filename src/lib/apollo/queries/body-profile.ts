import { gql } from "@apollo/client"

export type BodyProfilePictures = {
  frontPicture?: string | null
  sidePicture?: string | null
  backPicture?: string | null
}

export type GetBodyProfileData = {
  getBodyProfile: BodyProfilePictures[] | null
}

export type GetBodyProfileVars = {
  userId: string
}

/** Slim body-profile fetch for client measurement photos. */
export const GET_BODY_PROFILE = gql`
  query GetBodyProfile($userId: String!) {
    getBodyProfile(userId: $userId) {
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
