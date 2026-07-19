import { gql } from "@apollo/client/core"

export type CityOption = {
  id: string
  name?: string | null
  searchName?: string | null
  stateCode?: string | null
  stateTitle?: string | null
  countryCode?: string | null
  countryTitle?: string | null
}

export type GetCitiesBySearchData = {
  getCityBySearchTerm: CityOption[] | null
}

export type GetCitiesBySearchVars = {
  searchTerm: string
}

export const GET_CITIES_BY_SEARCH = gql`
  query GetCityBySearchTerm($searchTerm: String!) {
    getCityBySearchTerm(searchTerm: $searchTerm) {
      id
      name
      searchName
      stateCode
      stateTitle
      countryCode
      countryTitle
    }
  }
`
