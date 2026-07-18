import type { UpdateUserProfileInput } from "@/lib/apollo/queries/update-user-profile"
import type { MpfDateFilter } from "@/lib/customers/date-filter"

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

/** Legacy extractDateFormate — used for ccDueDate on quick update. */
export function extractDateFormat(isoOrDate: string): MpfDateFilter {
  const date = new Date(isoOrDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours() % 12 || 12
  const minute = date.getMinutes()
  const datestamp = `${year - 2000}${pad2(month)}${pad2(day)}${pad2(hour)}${pad2(minute)}`
  return {
    day,
    month,
    year,
    hour,
    minute,
    timestamp: date.toISOString(),
    datestamp,
  }
}

export type QuickUpdateFormValues = {
  stylistId: string
  ccDueDate: string
  userStatus: string
  customerSegment: string
  customerType: string
  isStyleClubMember: "YES" | "NO"
  remarks: string
}

/** Mirrors legacy getUserQuickUpdateFormFinalPayload. */
export function buildQuickUpdatePayload(
  formData: QuickUpdateFormValues
): UpdateUserProfileInput {
  const ccDueDate = formData.ccDueDate
    ? extractDateFormat(new Date(`${formData.ccDueDate}T00:00:00`).toISOString())
    : null

  return {
    stylistId: formData.stylistId || null,
    ccDueDate,
    userStatus: formData.userStatus || null,
    customerSegment: formData.customerSegment || null,
    customerType: formData.customerType || null,
    isStyleClubMember: formData.isStyleClubMember,
    remarks: formData.remarks || null,
    cityId: null,
  }
}
