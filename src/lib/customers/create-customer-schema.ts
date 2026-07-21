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

/**
 * Map a customer-search query into register-form defaults.
 * Phone-like input → mobile field; email-like → email field; names → ignored.
 */
export function guessCreateCustomerPrefill(
  raw: string
): Partial<CreateCustomerFormValues> {
  const trimmed = raw.trim()
  if (!trimmed) return {}

  if (trimmed.includes("@")) {
    return { email: trimmed }
  }

  const digits = trimmed.replace(/\D/g, "")
  // Too short / mostly letters → treat as a name search, not a phone.
  if (digits.length < 8) return {}

  // Exact 10-digit Indian mobile — never re-interpret as another country.
  if (/^[6-9]\d{9}$/.test(digits)) {
    return { phone: `+91${digits}` }
  }

  // 91XXXXXXXXXX (with country code, no plus)
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return { phone: `+${digits}` }
  }

  // 0XXXXXXXXXX local trunk prefix
  if (/^0[6-9]\d{9}$/.test(digits)) {
    return { phone: `+91${digits.slice(1)}` }
  }

  const parsed =
    (trimmed.startsWith("+") ? parsePhoneNumber(trimmed) : undefined) ||
    parsePhoneNumber(digits, "IN") ||
    parsePhoneNumber(`+${digits}`)

  if (parsed?.number) {
    return { phone: parsed.number }
  }

  return {}
}
