import { gql } from "@apollo/client/core"

export const GET_ALL_STUDIOS = gql`
  query GetAllStudios {
    getAllStudios {
      _id
      name
      city
      code
    }
  }
`

export type StudioOption = {
  _id: string
  name?: string | null
  city?: string | null
  code?: string | null
}

export type GetAllStudiosData = {
  getAllStudios: StudioOption[]
}
