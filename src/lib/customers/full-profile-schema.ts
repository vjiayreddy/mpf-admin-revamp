import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"

export const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
] as const

export const fullCustomerProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email address."
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    }),
  dateOfBirth: z.string(),
  customerSrNo: z.string(),
  gender: z.enum(["M", "F"]),
  stylistId: z.string().min(1, "Stylist is required."),
  secondaryStylistIds: z.array(z.string()),
  userStatus: z.string(),
  customerType: z.string(),
  customerSegment: z.string(),
  isStyleClubMember: z.enum(["YES", "NO"]),
  cityId: z.string(),
  cityName: z.string(),
  stateName: z.string(),
  countryName: z.string(),
  ccDueDate: z.string(),
  remarks: z.string(),
})

export type FullCustomerProfileFormValues = z.infer<
  typeof fullCustomerProfileSchema
>

export const addressFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    }),
  address1: z.string().trim().min(1, "Address is required."),
  address2: z.string(),
  landmark: z.string(),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().min(1, "State is required."),
  country: z.string().trim().min(1, "Country is required."),
  postalCode: z.string().trim().min(1, "Postal code is required."),
})

export type AddressFormValues = z.infer<typeof addressFormSchema>

export const addressFormDefaults: AddressFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  landmark: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
}
