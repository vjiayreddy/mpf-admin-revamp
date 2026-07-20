import { gql } from "@apollo/client/core"

export type WorkshopOption = {
  _id: string
  workshopId?: string | null
  name?: string | null
  label?: string | null
  workshopType?: string | null
  note?: string | null
  sortOrder?: number | null
  isEnabled?: boolean | null
  isDeleted?: boolean | null
  image?: string | null
}

export type GetWorkshopsByFilterData = {
  getWorkshopsByFilter: {
    workshops: WorkshopOption[]
  } | null
}

export type GetWorkshopsByFilterVars = {
  filter: {
    workshopType?: string | null
    searchTerm?: string | null
    isEnabled?: boolean | null
  }
  page?: number | null
  limit?: number | null
}

export const GET_WORKSHOPS_BY_FILTER = gql`
  query GetWorkshopsByFilter(
    $filter: WorkshopFilterInput!
    $page: Int
    $limit: Int
  ) {
    getWorkshopsByFilter(filter: $filter, page: $page, limit: $limit) {
      workshops {
        _id
        workshopId
        name
        label
        workshopType
        note
        sortOrder
        isEnabled
        isDeleted
        image
      }
    }
  }
`
