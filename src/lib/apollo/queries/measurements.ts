import { gql } from "@apollo/client"

import type { UserMeasurementRecord } from "@/lib/measurements/types"
import type { MpfDateFilter } from "@/lib/customers/date-filter"

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

export type MeasurementOptionInput = {
  label: string
  name: string
  isUpdateManually?: boolean
  value: number
}

export type UserMeasurementsInput = {
  userId: string
  catId: string
  subCat?: string
  isDraft?: boolean
  type?: string
  measuredBy?: string
  noOfMeters?: number
  pannaSize?: number
  note?: string
  isDyable?: boolean
  updatedOptions: MeasurementOptionInput[]
  remarks?: string | null
  approvedBy?: string | null
  approvedDate?: MpfDateFilter | null
  approvedStatus?: string | null
  _id?: string
}

export type SaveUserMeasurementData = {
  saveUserMeasurement: { subCat?: string | null } | null
}

export type SaveUserMeasurementVars = {
  userMeasurements: UserMeasurementsInput
}

export type DeleteUserMeasurementData = {
  deleteUserMeasurement: boolean
}

export type DeleteUserMeasurementVars = {
  measurementId: string
}

export type UpdateMeasurementApprovalVars = {
  measurementId: string
  approvedStatus: string
  approvedBy?: string | null
  itemName: string
  approvedDate?: MpfDateFilter | null
  loggedInTeamId: string
}

export type UpdateMeasurementApprovalData = {
  updateMeasurementApprovalStatus: boolean
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

export const SAVE_USER_MEASUREMENT = gql`
  mutation SaveUserMeasurement($userMeasurements: UserMeasurementsInput) {
    saveUserMeasurement(userMeasurements: $userMeasurements) {
      subCat
    }
  }
`

export const DELETE_USER_MEASUREMENT = gql`
  mutation DeleteUserMeasurement($measurementId: String!) {
    deleteUserMeasurement(measurementId: $measurementId)
  }
`

export const UPDATE_MEASUREMENT_APPROVAL_STATUS = gql`
  mutation UpdateMeasurementApprovalStatus(
    $measurementId: String!
    $approvedStatus: MeasurementApprovedStatusEnum!
    $approvedBy: String
    $itemName: String!
    $approvedDate: DateTimeSchemaInput
    $loggedInTeamId: String!
  ) {
    updateMeasurementApprovalStatus(
      measurementId: $measurementId
      approvedStatus: $approvedStatus
      approvedBy: $approvedBy
      itemName: $itemName
      approvedDate: $approvedDate
      loggedInTeamId: $loggedInTeamId
    )
  }
`
