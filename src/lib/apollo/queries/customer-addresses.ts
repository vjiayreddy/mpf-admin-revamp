import { gql } from "@apollo/client/core"

export type CustomerAddress = {
  _id?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  country?: string | null
  countryCode?: string | null
  email?: string | null
  firstName?: string | null
  landmark?: string | null
  lastName?: string | null
  phone?: string | null
  postalCode?: string | null
  state?: string | null
  userId?: string | null
}

export type GetUserAddressesData = {
  getUserAddresses: CustomerAddress[] | null
}

export type GetUserAddressesVars = {
  userId: string
}

export const GET_USER_ADDRESSES = gql`
  query GetUserAddresses($userId: String!) {
    getUserAddresses(userId: $userId) {
      _id
      address1
      address2
      city
      country
      countryCode
      email
      firstName
      landmark
      lastName
      phone
      postalCode
      state
    }
  }
`

export type UserAddressInput = {
  _id?: string | null
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  address1: string
  address2?: string | null
  landmark?: string | null
  city: string
  state: string
  country: string
  postalCode: string
}

export type SaveAddressData = {
  saveAddress: { _id: string } | null
}

export type SaveAddressVars = {
  address: UserAddressInput
}

export const SAVE_USER_ADDRESS = gql`
  mutation SaveAddress($address: UserAddressInput!) {
    saveAddress(address: $address) {
      _id
    }
  }
`

export type DeleteAddressData = {
  deleteAddress: { _id?: string } | null
}

export type DeleteAddressVars = {
  addressId: string
  userId: string
}

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($addressId: String!, $userId: String!) {
    deleteAddress(addressId: $addressId, userId: $userId) {
      _id
    }
  }
`
