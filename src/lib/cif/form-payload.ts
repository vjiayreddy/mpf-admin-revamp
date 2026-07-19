import { extractDateFormat } from "@/lib/appointments/date-payload"
import type { CifListRow } from "@/lib/apollo/queries/cif"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"
import { isoToDateInput } from "@/lib/appointments/date-payload"

export type CifFormValues = {
  userId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  gender: string
  customerSerialNo: string
  studioId: string
  stylistId: string
  lookingFor: string
  customerInfoStatus: string
  createdDate: string
  eventDate: string
  followUpDate: string
  lastVisitedDate: string
  note: string
  crossSellingNote: string
  salesTeamRemarksNote: string
  rating: string
  isLookBookShared: string
  occasion: string
  budget: string
  outfitsNote: string
  priceQuote: string
}

export function emptyCifFormValues(
  overrides?: Partial<CifFormValues>
): CifFormValues {
  return {
    userId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "M",
    customerSerialNo: "",
    studioId: "",
    stylistId: "",
    lookingFor: "",
    customerInfoStatus: "UNCONFIRMED",
    createdDate: new Date().toISOString().slice(0, 10),
    eventDate: "",
    followUpDate: "",
    lastVisitedDate: "",
    note: "",
    crossSellingNote: "",
    salesTeamRemarksNote: "",
    rating: "",
    isLookBookShared: "false",
    occasion: "",
    budget: "",
    outfitsNote: "",
    priceQuote: "",
    ...overrides,
  }
}

function namedId(
  value: CifListRow["studio"] | CifListRow["stylist"] | string | null | undefined
): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0]?._id ?? ""
  return value._id ?? ""
}

export function cifRowToFormValues(row: CifListRow): CifFormValues {
  const phone =
    row.phone && row.countryCode
      ? `+${String(row.countryCode).replace(/^\+/, "")}${row.phone}`
      : row.phone
        ? `+91${row.phone}`
        : ""

  const occasion = row.occasionDetails?.[0]

  return emptyCifFormValues({
    userId: row.userId ?? "",
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    phone,
    email: row.email ?? "",
    gender: row.gender === "F" ? "F" : "M",
    customerSerialNo:
      row.customerSerialNo != null ? String(row.customerSerialNo) : "",
    studioId: namedId(row.studio) || row.studioId || "",
    stylistId: namedId(row.stylist) || row.stylistId || "",
    lookingFor: row.lookingFor ?? "",
    customerInfoStatus: row.customerInfoStatus ?? "UNCONFIRMED",
    createdDate: isoToDateInput(row.createdDate?.timestamp),
    eventDate: isoToDateInput(row.eventDate?.timestamp),
    followUpDate: isoToDateInput(row.followUpDate?.timestamp),
    lastVisitedDate: isoToDateInput(row.lastVisitedDate?.timestamp),
    note: row.note ?? "",
    crossSellingNote: row.crossSellingNote ?? "",
    salesTeamRemarksNote: row.salesTeamRemarksNote ?? "",
    rating: row.rating != null ? String(row.rating) : "",
    isLookBookShared: row.isLookBookShared ? "true" : "false",
    occasion: occasion?.occasion ?? "",
    budget: occasion?.budget != null ? String(occasion.budget) : "",
    outfitsNote: occasion?.outfitsNote ?? "",
    priceQuote:
      occasion?.priceQuote != null ? String(occasion.priceQuote) : "",
  })
}

function optionalDatePayload(value: string) {
  if (!value) return null
  const iso = new Date(`${value}T00:00:00`).toISOString()
  return extractDateFormat(iso)
}

/**
 * Build GraphQL CustomerInformationFormInput from form values.
 * Keeps existing nested arrays when editing by merging caller-provided extras.
 */
export function buildCifSavePayload(
  values: CifFormValues,
  options?: {
    existing?: CifListRow | null
  }
): Record<string, unknown> {
  const { countryCode, phone } = splitPhoneForApi(values.phone)
  const existing = options?.existing

  const occasionDetails =
    values.occasion || values.budget || values.outfitsNote || values.priceQuote
      ? [
          {
            occasion: values.occasion || undefined,
            budget: values.budget ? Number(values.budget) : undefined,
            outfitsNote: values.outfitsNote || undefined,
            priceQuote: values.priceQuote
              ? Number(values.priceQuote)
              : undefined,
            refImage: existing?.occasionDetails?.[0]?.refImage ?? [],
            categoryName: existing?.occasionDetails?.[0]?.categoryName ?? [],
            referenceLookBooks:
              existing?.occasionDetails?.[0]?.referenceLookBooks ?? [],
          },
        ]
      : (existing?.occasionDetails ?? [])

  return {
    userId: values.userId || undefined,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email || undefined,
    gender: values.gender === "F" ? "F" : "M",
    countryCode,
    phone,
    customerSerialNo: values.customerSerialNo
      ? Number(values.customerSerialNo)
      : 0,
    studioId: values.studioId || undefined,
    stylistId: values.stylistId || undefined,
    lookingFor: values.lookingFor || undefined,
    customerInfoStatus: values.customerInfoStatus || undefined,
    createdDate: optionalDatePayload(values.createdDate),
    eventDate: optionalDatePayload(values.eventDate),
    followUpDate: optionalDatePayload(values.followUpDate),
    lastVisitedDate: optionalDatePayload(values.lastVisitedDate),
    note: values.note || undefined,
    crossSellingNote: values.crossSellingNote || undefined,
    salesTeamRemarksNote: values.salesTeamRemarksNote || undefined,
    ...(values.rating
      ? { rating: Number(values.rating) }
      : {}),
    isLookBookShared: values.isLookBookShared === "true",
    leadIds: existing?.leads?.map((l) => l._id).filter(Boolean) ?? [],
    followUpByIds: existing?.followUpByIds ?? [],
    lookbookDetails: existing?.lookbookDetails ?? [],
    occasionDetails,
    crossSellingDetails:
      existing?.crossSellingDetails?.map((item) => ({
        remarks: item.remarks,
        brandPartnerSubCatIds: item.brandPartnerSubCatIds ?? [],
        referenceLookBooks: item.referenceLookBooks ?? [],
      })) ?? [],
    sourceCatId: existing?.sourceCatId,
    sourceSubCatId: existing?.sourceSubCatId,
  }
}
