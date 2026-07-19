import { gql } from "@apollo/client/core"

export type StandardSizingOption = {
  name?: string | null
  value?: string | number | null
}

export type UserStandardSizingRow = {
  _id?: string | null
  size?: string | null
  label?: string | null
  catId?: string | null
  note?: string | null
  bodyProfileId?: string | null
  modifiedOptions?: StandardSizingOption[] | null
}

export type StandardSizeChartRow = {
  catId?: string | null
  label?: string | null
  size?: string | null
  sortOrder?: number | null
  options?: StandardSizingOption[] | null
}

export type GetUserStandardSizingData = {
  getUserStandardSizing: UserStandardSizingRow[] | null
}

export type GetUserStandardSizingVars = {
  userId: string
  catIds?: string[] | null
  page?: number | null
  limit?: number | null
}

export type GetStandardSizeChartData = {
  getStandardSizeChart: StandardSizeChartRow[] | null
}

export type GetStandardSizeChartVars = {
  catIds?: string[] | null
  size?: string | null
}

export type StandardSizingInput = {
  userId: string
  catId: string
  size?: string
  label?: string
  note?: string
  bodyProfileId?: string
  modifiedOptions?: StandardSizingOption[]
  _id?: string
}

export type SaveUserStandardSizingData = {
  saveUserStandardSizing: boolean
}

export type SaveUserStandardSizingVars = {
  body: StandardSizingInput[]
}

export const GET_USER_STANDARD_SIZING = gql`
  query GetUserStandardSizing(
    $userId: String!
    $catIds: [String]
    $page: Int
    $limit: Int
  ) {
    getUserStandardSizing(
      userId: $userId
      catIds: $catIds
      page: $page
      limit: $limit
    ) {
      _id
      size
      label
      catId
      note
      bodyProfileId
      modifiedOptions {
        name
        value
      }
    }
  }
`

export const GET_STANDARD_SIZE_CHART = gql`
  query GetStandardSizeChart($catIds: [String], $size: String) {
    getStandardSizeChart(catIds: $catIds, size: $size) {
      catId
      label
      options {
        name
        value
      }
      size
      sortOrder
    }
  }
`

export const SAVE_USER_STANDARD_SIZING = gql`
  mutation SaveUserStandardSizing($body: [StandardSizingInput]!) {
    saveUserStandardSizing(body: $body)
  }
`
