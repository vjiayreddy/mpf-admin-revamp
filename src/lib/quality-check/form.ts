import { z } from "zod"

import type { OrderQualityCheckInput } from "@/lib/apollo/queries/quality-check"
import { QC_CHECKLIST_FIELDS } from "@/lib/quality-check/checklist-fields"
import type { OrderQualityCheckDetail } from "@/lib/quality-check/types"

const checklistRowSchema = z.object({
  check: z.boolean(),
  rating: z.number().nullable(),
  note: z.string(),
})

export const qualityCheckFormSchema = z.object({
  qualityCheckStatus: z.string(),
  qualityCheckNote: z.string(),
  fabricAndColor: checklistRowSchema,
  design: checklistRowSchema,
  measurements: checklistRowSchema,
  ironAndPackaging: checklistRowSchema,
  finishing: checklistRowSchema,
  cleanliness: checklistRowSchema,
  productImage: z.string(),
  /** actualKey → string value (empty allowed). */
  actualByKey: z.record(z.string(), z.string()),
})

export type QualityCheckFormValues = z.infer<typeof qualityCheckFormSchema>

function emptyChecklistRow() {
  return { check: false, rating: null as number | null, note: "" }
}

export function emptyQualityCheckFormValues(): QualityCheckFormValues {
  return {
    qualityCheckStatus: "",
    qualityCheckNote: "",
    fabricAndColor: emptyChecklistRow(),
    design: emptyChecklistRow(),
    measurements: emptyChecklistRow(),
    ironAndPackaging: emptyChecklistRow(),
    finishing: emptyChecklistRow(),
    cleanliness: emptyChecklistRow(),
    productImage: "",
    actualByKey: {},
  }
}

function sectionFromDetail(section?: {
  check?: boolean | null
  rating?: number | null
  note?: string | null
} | null) {
  return {
    check: Boolean(section?.check),
    rating:
      section?.rating != null && Number.isFinite(Number(section.rating))
        ? Number(section.rating)
        : null,
    note: section?.note?.trim() || "",
  }
}

export function resetQualityCheckFormValues(
  detail: OrderQualityCheckDetail
): QualityCheckFormValues {
  const actualByKey: Record<string, string> = {}
  for (const row of detail.actualMeasurement ?? []) {
    const key = row.name?.trim()
    if (!key) continue
    actualByKey[key] =
      row.value != null && row.value !== "" ? String(row.value) : ""
  }

  return {
    qualityCheckStatus: detail.qualityCheckStatus?.trim() || "",
    qualityCheckNote: detail.qualityCheckNote?.trim() || "",
    fabricAndColor: sectionFromDetail(detail.fabricAndColor),
    design: sectionFromDetail(detail.design),
    measurements: sectionFromDetail(detail.measurements),
    ironAndPackaging: sectionFromDetail(detail.ironAndPackaging),
    finishing: sectionFromDetail(detail.finishing),
    cleanliness: sectionFromDetail(detail.cleanliness),
    productImage: detail.productImage?.trim() || "",
    actualByKey,
  }
}

function toChecklistSection(row: {
  check: boolean
  rating: number | null
  note: string
}) {
  return {
    check: row.check,
    note: row.note.trim() || null,
    rating:
      row.rating != null && Number.isFinite(row.rating) ? row.rating : null,
  }
}

export type BuildQualityCheckPayloadContext = {
  orderId: string
  userId: string
  stylistId: string
  itemNumber: string | number | null
  name: string
  catId: string
}

export function buildQualityCheckPayload(
  values: QualityCheckFormValues,
  ctx: BuildQualityCheckPayloadContext
): OrderQualityCheckInput {
  const actualMeasurement = Object.entries(values.actualByKey)
    .map(([name, raw]) => {
      const trimmed = raw.trim()
      if (!trimmed) return null
      const value = Number(trimmed)
      if (!Number.isFinite(value)) return null
      return { name, value }
    })
    .filter((row): row is { name: string; value: number } => Boolean(row))

  return {
    orderId: ctx.orderId,
    userId: ctx.userId,
    stylistId: ctx.stylistId || null,
    itemNumber: ctx.itemNumber,
    name: ctx.name,
    catId: ctx.catId || null,
    qualityCheckStatus: values.qualityCheckStatus.trim() || null,
    qualityCheckNote: values.qualityCheckNote.trim() || null,
    productImage: values.productImage.trim() || null,
    fabricAndColor: toChecklistSection(values.fabricAndColor),
    design: toChecklistSection(values.design),
    measurements: toChecklistSection(values.measurements),
    ironAndPackaging: toChecklistSection(values.ironAndPackaging),
    finishing: toChecklistSection(values.finishing),
    cleanliness: toChecklistSection(values.cleanliness),
    actualMeasurement,
  }
}

export { QC_CHECKLIST_FIELDS }
