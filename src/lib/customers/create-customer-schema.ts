import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input"
import { z } from "zod"

import { CREATE_CUSTOMER_DEFAULTS } from "@/lib/apollo/queries/create-user"

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    }),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email address."
    ),
})

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>

export const createCustomerDefaultValues: CreateCustomerFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
}

export function splitPhoneForApi(e164: string): {
  countryCode: string
  phone: string
} {
  const parsed = parsePhoneNumber(e164)
  if (!parsed) {
    const digits = e164.replace(/\D/g, "")
    return { countryCode: "91", phone: digits }
  }
  return {
    countryCode: parsed.countryCallingCode,
    phone: parsed.nationalNumber,
  }
}

export function resolveCreateCustomerEmail(email: string, e164: string) {
  const trimmed = email.trim()
  if (trimmed) return trimmed
  const digits = e164.replace(/\D/g, "")
  return `+${digits}@${CREATE_CUSTOMER_DEFAULTS.emailDomain}`
}
