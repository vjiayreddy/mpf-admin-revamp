import { gql } from "@apollo/client/core"

export const GET_ALL_STYLISTS = gql`
  query GetAllStylists {
    getAllStylists {
      _id
      name
      email
      phone
      image
    }
  }
`

export type StylistOption = {
  _id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  image?: string | null
}

export type GetAllStylistsData = {
  getAllStylists: StylistOption[]
}
