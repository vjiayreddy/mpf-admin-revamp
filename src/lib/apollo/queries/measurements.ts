import { gql } from "@apollo/client"

import type { UserMeasurementRecord } from "@/lib/measurements/types"

export type GetUserMeasurementsData = {
  getUserMeasurements: UserMeasurementRecord[] | null
}

export type GetUserMeasurementsVars = {
  userId: string
  catId?: string | null
  optionName?: string | null
  subCat?: string | null
  page?: number | null
  limit?: number | null
}

export const GET_USER_MEASUREMENTS = gql`
  query GetSavedUserMeasurements(
    $userId: String!
    $catId: String
    $optionName: String
    $subCat: String
    $page: Int
    $limit: Int
  ) {
    getUserMeasurements(
      userId: $userId
      catId: $catId
      optionName: $optionName
      subCat: $subCat
      page: $page
      limit: $limit
    ) {
      _id
      catId
      type
      measuredBy
      approvedByStylist {
        _id
        name
      }
      pdf
      updatedAt
      approvedBy
      approvedDate {
        timestamp
      }
      approvedStatus
      note
      pannaSize
      isDyable
      noOfMeters
      remarks
      category {
        name
      }
      dateRecorded {
        day
        month
        year
        hour
        minute
        timestamp
      }
      options {
        label
        name
        attributeImageUrl
        value
        isUpdateManually
      }
    }
  }
`
