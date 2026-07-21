import { gql } from "@apollo/client/core"

export type SecondaryColor = {
  _id: string
  color?: string | null
  colorname?: string | null
  label?: string | null
  primary_color_id?: string | null
  primaryColor?: {
    _id?: string | null
    color?: string | null
    colorname?: string | null
    label?: string | null
  } | null
}

export type GetAllSecondaryColorsData = {
  getAllSecondaryColors: SecondaryColor[]
}

export const GET_ALL_SECONDARY_COLORS = gql`
  query GetAllSecondaryColors {
    getAllSecondaryColors {
      _id
      color
      colorname
      label
      primary_color_id
      primaryColor {
        _id
        color
        colorname
        label
      }
    }
  }
`
