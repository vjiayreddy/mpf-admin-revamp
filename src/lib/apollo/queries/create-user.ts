import { gql } from "@apollo/client/core"

export const CREATE_USER_FOR_CIF = gql`
  mutation CreateUserForCIF($userData: createUserInput) {
    createUserForCIF(userData: $userData) {
      userId
    }
  }
`

export type CreateUserForCifInput = {
  firstName: string
  lastName: string
  fullName?: string
  phone: string
  countryCode: string
  email: string
  password: string
  height: number
  weight: number
  customerPersonaIds: string[]
  stylistId: string
}

export type CreateUserForCifData = {
  createUserForCIF: {
    userId: string
  }
}

export type CreateUserForCifVars = {
  userData: CreateUserForCifInput
}

/** Legacy ActionButtons defaults */
export const CREATE_CUSTOMER_DEFAULTS = {
  password: "Mpf@1234",
  emailDomain: "myperfectfit.com",
  personaId: "60546796e0646e2994cfb7b0",
  fallbackStylistId: "5de75fa5a72f8129f42bba2a",
} as const
