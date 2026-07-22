import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"

import { extractDateFormat } from "@/lib/appointments/date-payload"
import type { LeadInput } from "@/lib/apollo/queries/leads"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"

const occasionRowSchema = z.object({
  id: z.string(),
  occasion: z.string().optional(),
  budget: z.string().optional(),
  outfitsNote: z.string().optional(),
  priceQuote: z.string().optional(),
  /** Single reference image URL (legacy dialog stores one URL). */
  refImage: z.string().optional(),
})

const crossSellRowSchema = z.object({
  id: z.string(),
  brandPartnerSubCatIds: z.array(z.string()).default([]),
  remarks: z.string().optional(),
})

export const leadFormSchema = z
  .object({
    leadId: z.string().optional(),
    userId: z.string().min(1, "Search or create a customer first."),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required")
      .refine((value) => isValidPhoneNumber(value), {
        message: "Enter a valid phone number.",
      }),
    email: z.string().email("Invalid email").or(z.literal("")).optional(),
    cityName: z.string().optional(),
    remarks: z.string().optional(),
    rating: z.string().optional(),
    creditToSalesTeamId: z.string().optional(),
    generatedBySalesTeamId: z.string().optional(),
    studioId: z.string().min(1, "Studio is required"),
    sourceCatId: z.string().optional(),
    sourceSubCatId: z.string().optional(),
    personaIds: z.array(z.string()).default([]),
    leadDate: z.string().min(1, "Lead date is required"),
    followUpDate: z.string().min(1, "Follow-up date is required"),
    eventDate: z.string().optional(),
    expClosureDate: z.string().min(1, "Expected closure date is required"),
    estimatedValue: z.string().min(1, "Estimated value is required"),
    occasions: z.array(occasionRowSchema).default([]),
    crossSells: z.array(crossSellRowSchema).default([]),
  })
  .superRefine((values, ctx) => {
    if (!values.followUpDate || !values.expClosureDate) return
    const follow = new Date(`${values.followUpDate}T00:00:00`)
    const closure = new Date(`${values.expClosureDate}T00:00:00`)
    if (
      Number.isNaN(follow.getTime()) ||
      Number.isNaN(closure.getTime())
    ) {
      return
    }
    if (!(follow.getTime() < closure.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["followUpDate"],
        message: "Follow-up date must be before the closure date.",
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expClosureDate"],
        message: "Closure date must be after the follow-up date.",
      })
    }
  })

export type LeadFormValues = z.infer<typeof leadFormSchema>
export type LeadOccasionRow = z.infer<typeof occasionRowSchema>
export type LeadCrossSellRow = z.infer<typeof crossSellRowSchema>

export function newOccasionRow(
  partial?: Partial<LeadOccasionRow>
): LeadOccasionRow {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    occasion: partial?.occasion ?? "",
    budget: partial?.budget ?? "",
    outfitsNote: partial?.outfitsNote ?? "",
    priceQuote: partial?.priceQuote ?? "",
    refImage: partial?.refImage ?? "",
  }
}

export function newCrossSellRow(
  partial?: Partial<LeadCrossSellRow>
): LeadCrossSellRow {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    brandPartnerSubCatIds: partial?.brandPartnerSubCatIds ?? [],
    remarks: partial?.remarks ?? "",
  }
}

function dateInputToFilter(value?: string) {
  if (!value?.trim()) return undefined
  return extractDateFormat(new Date(`${value}T00:00:00`).toISOString())
}

function normalizeRefImage(
  value: string | string[] | null | undefined
): string {
  if (Array.isArray(value)) return value.find((v) => v?.trim())?.trim() || ""
  return value?.trim() || ""
}

export function refImageFromLead(
  value: string | string[] | null | undefined
): string {
  return normalizeRefImage(value)
}

export function buildLeadBody(
  values: LeadFormValues,
  opts: { mongoId?: string; leadIdNumber?: number }
): LeadInput {
  const { countryCode, phone } = splitPhoneForApi(values.phone.trim())
  const body: LeadInput = {
    userId: values.userId.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone,
    countryCode,
    email: values.email?.trim() || undefined,
    cityName: values.cityName?.trim() || undefined,
    remarks: values.remarks?.trim() || undefined,
    creditToSalesTeamId: values.creditToSalesTeamId || undefined,
    generatedBySalesTeamId: values.generatedBySalesTeamId || undefined,
    studioId: values.studioId || undefined,
    sourceCatId: values.sourceCatId || undefined,
    sourceSubCatId: values.sourceSubCatId || undefined,
    estimatedValue: values.estimatedValue.trim(),
  }

  if (opts.mongoId) body._id = opts.mongoId

  const leadIdNum =
    opts.leadIdNumber ??
    (values.leadId?.trim() ? Number(values.leadId.trim()) : undefined)
  if (leadIdNum != null && !Number.isNaN(leadIdNum)) {
    body.leadId = leadIdNum
  }

  if (values.rating != null && values.rating !== "") {
    body.rating = Number(values.rating)
  }

  if (values.personaIds.length > 0) {
    body.personaIds = values.personaIds
  }

  const leadDate = dateInputToFilter(values.leadDate)
  if (leadDate) body.leadDate = leadDate

  const followUpDate = dateInputToFilter(values.followUpDate)
  if (followUpDate) {
    body.followUpDate = followUpDate
    body.currentStatusDate = followUpDate
  }

  const eventDate = dateInputToFilter(values.eventDate)
  if (eventDate) body.eventDate = eventDate

  const expClosureDate = dateInputToFilter(values.expClosureDate)
  if (expClosureDate) body.expClosureDate = expClosureDate

  const occasionDetails = values.occasions
    .map((row) => {
      const item: Record<string, unknown> = {}
      if (row.occasion?.trim()) item.occasion = row.occasion.trim()
      if (row.budget?.trim()) {
        // Legacy stores budget as enum string (FROM_10_TO_20K); also allow numeric.
        const raw = row.budget.trim()
        const asNum = Number(raw)
        item.budget =
          !Number.isNaN(asNum) && String(asNum) === raw ? asNum : raw
      }
      if (row.outfitsNote?.trim()) item.outfitsNote = row.outfitsNote.trim()
      if (row.priceQuote?.trim()) {
        const n = Number(row.priceQuote)
        if (!Number.isNaN(n)) item.priceQuote = n
      }
      if (row.refImage?.trim()) item.refImage = row.refImage.trim()
      return item
    })
    .filter((item) => Object.keys(item).length > 0)

  if (occasionDetails.length > 0) body.occasionDetails = occasionDetails

  const crossSellingDetails = values.crossSells
    .map((row) => ({
      brandPartnerSubCatIds: row.brandPartnerSubCatIds,
      remarks: row.remarks?.trim() || undefined,
    }))
    .filter(
      (row) =>
        (row.brandPartnerSubCatIds?.length ?? 0) > 0 || Boolean(row.remarks)
    )

  if (crossSellingDetails.length > 0) {
    body.crossSellingDetails = crossSellingDetails
  }

  return body
}

export function todayDateInput(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
