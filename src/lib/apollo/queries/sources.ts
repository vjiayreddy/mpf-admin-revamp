import { gql } from "@apollo/client/core"

export type SourceSubCategory = {
  _id: string
  name?: string | null
  isVisible?: boolean | null
  sortOrder?: number | null
}

export type SourceCategory = {
  _id: string
  name?: string | null
  isVisible?: boolean | null
  sortOrder?: number | null
  subCategory?: SourceSubCategory[] | null
}

export type GetAllSourceCategoriesData = {
  getAllSourceCategories: SourceCategory[]
}

export const GET_ALL_SOURCE_CATEGORIES = gql`
  query GetAllSourceCategories {
    getAllSourceCategories {
      _id
      isVisible
      name
      sortOrder
      subCategory {
        _id
        isVisible
        name
        sortOrder
      }
    }
  }
`
