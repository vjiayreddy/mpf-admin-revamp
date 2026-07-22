import { gql } from "@apollo/client/core"

export type PersonaOption = {
  _id: string
  name?: string | null
  note?: string | null
  image?: string | null
}

export type GetUserAttributeMasterData = {
  getUserAttributeMaster: PersonaOption[]
}

export type GetUserAttributeMasterVars = {
  filter: {
    masterName: string
  }
}

export const GET_PERSONAS = gql`
  query GetLeadPersonas($filter: UserAttributeMasterFilter) {
    getUserAttributeMaster(filter: $filter) {
      _id
      name
      note
      image
    }
  }
`

export const PERSONA_MASTER_NAME = "master_persona"
