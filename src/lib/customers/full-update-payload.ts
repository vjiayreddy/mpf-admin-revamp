import type { UpdateUserProfileInput } from "@/lib/apollo/queries/update-user-profile"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"
import type { FullCustomerProfileFormValues } from "@/lib/customers/full-profile-schema"
import { extractDateFormat } from "@/lib/customers/quick-update-payload"

/** Mirrors legacy getUserUpdateFormFinalPayload for the full profile form. */
export function buildFullUpdatePayload(
  formData: FullCustomerProfileFormValues
): UpdateUserProfileInput {
  const { countryCode, phone } = splitPhoneForApi(formData.phone)
  const ccDueDate = formData.ccDueDate
    ? extractDateFormat(new Date(`${formData.ccDueDate}T00:00:00`).toISOString())
    : null
  const dateOfBirth = formData.dateOfBirth
    ? extractDateFormat(
        new Date(`${formData.dateOfBirth}T00:00:00`).toISOString()
      )
    : null

  const srNo = Number(formData.customerSrNo)
  const customerSrNo = Number.isInteger(srNo) ? srNo : null

  return {
    firstName: formData.firstName || null,
    lastName: formData.lastName || null,
    email: formData.email || null,
    phone,
    countryCode,
    dateOfBirth,
    ...(customerSrNo != null ? { customerSrNo } : {}),
    gender: formData.gender === "F" ? "F" : "M",
    stylistId: formData.stylistId || null,
    secondaryStylistIds: formData.secondaryStylistIds ?? [],
    userStatus: formData.userStatus || null,
    customerType: formData.customerType || null,
    customerSegment: formData.customerSegment || null,
    isStyleClubMember: formData.isStyleClubMember,
    remarks: formData.remarks || null,
    cityId: formData.cityId || null,
    cityName: formData.cityName || null,
    stateName: formData.stateName || null,
    countryName: formData.countryName || null,
    ccDueDate,
  }
}
