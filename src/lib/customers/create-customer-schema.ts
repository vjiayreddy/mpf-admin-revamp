import { z } from "zod"

import { CREATE_CUSTOMER_DEFAULTS } from "@/lib/apollo/queries/create-user"

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  countryCode: z
    .string()
    .trim()
    .min(1, "Country code is required.")
    .regex(/^\d{1,4}$/, "Enter a valid country code."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .refine((value) => value.replace(/\D/g, "").length >= 8, {
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
  countryCode: "91",
  phone: "",
  email: "",
}

export function resolveCreateCustomerEmail(
  email: string,
  countryCode: string,
  phone: string
) {
  const trimmed = email.trim()
  if (trimmed) return trimmed
  const digits = phone.replace(/\D/g, "")
  return `+${countryCode}${digits}@${CREATE_CUSTOMER_DEFAULTS.emailDomain}`
}
