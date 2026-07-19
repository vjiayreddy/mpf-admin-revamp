import { gql } from "@apollo/client"

export type StylingConfigOption = {
  _id?: string | null
  name?: string | null
  catId?: string | null
  image?: string | null
  personalizeImage?: string | null
  note?: string | null
  sortOrder?: number | null
}

export type StylingConfigAttribute = {
  masterName?: string | null
  label?: string | null
  sortOrder?: number | null
  options?: StylingConfigOption[] | null
}

export type StylingConfig = {
  catId?: string | null
  image?: string | null
  attributes?: StylingConfigAttribute[] | null
}

export type GetStylingConfigData = {
  getStylingConfig: StylingConfig | null
}

export type GetStylingConfigVars = {
  catId: string
}

export const GET_STYLING_CONFIG = gql`
  query GetStylingConfig($catId: String!) {
    getStylingConfig(catId: $catId) {
      catId
      image
      attributes {
        masterName
        label
        sortOrder
        options {
          _id
          name
          catId
          image
          personalizeImage
          note
          sortOrder
        }
      }
    }
  }
`
