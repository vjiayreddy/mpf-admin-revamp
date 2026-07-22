import { gql } from "@apollo/client/core"

/** Shared input for createUserForCIF / createUserForOrder. */
export type CreateUserInput = {
  firstName: string
  lastName: string
  phone: string
  countryCode: string
  email: string
  password: string
  height: number
  weight: number
  customerPersonaIds: string[]
  stylistId: string
}

export const CREATE_USER_FOR_CIF = gql`
  mutation CreateUserForCIF($userData: createUserInput) {
    createUserForCIF(userData: $userData) {
      userId
    }
  }
`

export const CREATE_USER_FOR_ORDER = gql`
  mutation CreateUserForOrder($userData: createUserInput) {
    createUserForOrder(userData: $userData) {
      userId
    }
  }
`

export type CreateUserForCifData = {
  createUserForCIF: {
    userId: string
  }
}

export type CreateUserForOrderData = {
  createUserForOrder: {
    userId: string
  }
}

export type CreateUserForCifVars = {
  userData: CreateUserInput
}

export type CreateUserForOrderVars = {
  userData: CreateUserInput
}

export const CREATE_USER_FOR_LEAD = gql`
  mutation CreateUserForLead($userData: createUserInput) {
    createUserForLead(userData: $userData) {
      userId
    }
  }
`

export type CreateUserForLeadData = {
  createUserForLead: {
    userId: string
  }
}

export type CreateUserForLeadVars = {
  userData: CreateUserInput
}

/** @deprecated Prefer CreateUserInput */
export type CreateUserForCifInput = CreateUserInput

/** Legacy ActionButtons / OrderForm defaults */
export const CREATE_CUSTOMER_DEFAULTS = {
  password: "Mpf@1234",
  emailDomain: "myperfectfit.com",
  personaId: "60546796e0646e2994cfb7b0",
  fallbackStylistId: "5de75fa5a72f8129f42bba2a",
} as const

export type RegisterUserEndpoint = "cif" | "order" | "lead"
