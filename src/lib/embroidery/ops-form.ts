import { z } from "zod"

import { extractDateFormat, isoToDateInput } from "@/lib/appointments/date-payload"
import type {
  EmbroideryAreaMapEntry,
  EmbroideryOpsDetail,
  GetEmbroideryAreaMappingData,
} from "@/lib/apollo/queries/embroidery"

export type WorkAreaOption = {
  id: string
  name: string
  group: string
}

export type EmbroideryOpsFormValues = {
  workType: string[]
  workAreaIds: string[]
  workshopIds: string[]
  machineWorkshopIds: string[]
  computerizedWorkshopId: string
  embStatus: string
  markingStatus: string
  sampleStatus: string
  paperStatus: string
  approvalStatus: string
  qcStatus: string
  embRemark: string
  note: string
  paperNo: string
  anyDelays: string
  markingRemarks: string
  approvalRemarks: string
  estHrs: string
  workHrs: string
  paperHrs: string
  sampleHrs: string
  totalActualHrs: string
  price: string
  estimatedCost: string
  estimatedCostOrPrice: string
  embReadyDate: string
  markingExpectedDate: string
}

export const embroideryOpsFormSchema = z.object({
  workType: z
    .array(z.string())
    .min(1, "At least one Work Type is required"),
  workAreaIds: z.array(z.string()),
  workshopIds: z.array(z.string()),
  machineWorkshopIds: z.array(z.string()),
  computerizedWorkshopId: z.string(),
  embStatus: z.string(),
  markingStatus: z.string(),
  sampleStatus: z.string(),
  paperStatus: z.string(),
  approvalStatus: z.string(),
  qcStatus: z.string(),
  embRemark: z.string(),
  note: z.string(),
  paperNo: z.string(),
  anyDelays: z.string(),
  markingRemarks: z.string(),
  approvalRemarks: z.string(),
  estHrs: z.string(),
  workHrs: z.string(),
  paperHrs: z.string(),
  sampleHrs: z.string(),
  totalActualHrs: z.string(),
  price: z.string(),
  estimatedCost: z.string(),
  estimatedCostOrPrice: z.string(),
  embReadyDate: z.string(),
  markingExpectedDate: z.string(),
})

/** Products where work area is optional (legacy OrderEmbroideryForm). */
const WORK_AREA_OPTIONAL_CAT_IDS = new Set([
  "5da7220571762c2a58b27a67", // trouser
  "5da7220571762c2a58b27a6b", // chinos
  "69c63bfd8aee6d261a428f25", // gurka pant
  "621a34485417ab1e143a5245", // patiyala
])

export function isWorkAreaMandatory(catId?: string | null): boolean {
  if (!catId?.trim()) return true
  return !WORK_AREA_OPTIONAL_CAT_IDS.has(catId.trim())
}

/** Schema matching legacy design-form rules for shared ops fields. */
export function createEmbroideryOpsFormSchema(workAreasRequired: boolean) {
  return embroideryOpsFormSchema.superRefine((values, ctx) => {
    if (workAreasRequired && values.workAreaIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workAreaIds"],
        message: "At least one Work Area is required",
      })
    }
  })
}

export const emptyOpsFormValues = (): EmbroideryOpsFormValues => ({
  workType: [],
  workAreaIds: [],
  workshopIds: [],
  machineWorkshopIds: [],
  computerizedWorkshopId: "",
  embStatus: "",
  markingStatus: "",
  sampleStatus: "",
  paperStatus: "",
  approvalStatus: "",
  qcStatus: "",
  embRemark: "",
  note: "",
  paperNo: "",
  anyDelays: "",
  markingRemarks: "",
  approvalRemarks: "",
  estHrs: "",
  workHrs: "",
  paperHrs: "",
  sampleHrs: "",
  totalActualHrs: "",
  price: "",
  estimatedCost: "",
  estimatedCostOrPrice: "",
  embReadyDate: "",
  markingExpectedDate: "",
})

function asIdArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object" && "_id" in item) {
          return String((item as { _id?: string })._id ?? "")
        }
        return ""
      })
      .filter(Boolean)
  }
  if (typeof value === "string") return [value]
  return []
}

function asSingleId(value: unknown): string {
  const ids = asIdArray(value)
  return ids[0] ?? ""
}

function asWorkTypeArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === "string") return [value]
  return []
}

function parseStoredWorkAreas(workAreas?: string[] | string | null): WorkAreaOption[] {
  const raw = Array.isArray(workAreas)
    ? workAreas
    : typeof workAreas === "string" && workAreas.trim()
      ? [workAreas]
      : []
  const out: WorkAreaOption[] = []
  for (const entry of raw) {
    try {
      const parsed =
        typeof entry === "string" ? (JSON.parse(entry) as WorkAreaOption) : entry
      if (parsed?.id && parsed?.name) {
        out.push({
          id: String(parsed.id),
          name: String(parsed.name),
          group: String(parsed.group || parsed.name),
        })
      }
    } catch {
      // skip malformed
    }
  }
  return out
}

function numOrEmpty(value?: number | null): string {
  return value != null && !Number.isNaN(value) ? String(value) : ""
}

/** Normalize API anyDelays (boolean | string) to select value "true" | "false" | "". */
function anyDelaysToSelectValue(value?: string | boolean | null): string {
  if (value === true || value === "true" || value === "Yes" || value === "YES") {
    return "true"
  }
  if (
    value === false ||
    value === "false" ||
    value === "No" ||
    value === "NO"
  ) {
    return "false"
  }
  return ""
}

function anyDelaysToPayload(value: string): boolean | null {
  if (value === "true") return true
  if (value === "false") return false
  return null
}

function toNumber(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function emptyToNull(value: string) {
  return value.trim() ? value : null
}

function toTimestamp(dateInput: string) {
  if (!dateInput.trim()) return null
  return extractDateFormat(new Date(`${dateInput}T00:00:00`).toISOString())
}

/** Flatten area mapping into selectable options (memoize at call site). */
export function formatEmbroideryAreasToProduceOptions(
  data: GetEmbroideryAreaMappingData | null | undefined
): WorkAreaOption[] {
  const mapping = data?.getEmbroideryAreaMapping?.[0]?.map
  if (!Array.isArray(mapping)) return []
  const result: WorkAreaOption[] = []
  for (const area of mapping as EmbroideryAreaMapEntry[]) {
    const group = area.label || area.name || "Area"
    if (Array.isArray(area.options) && area.options.length > 0) {
      for (const opt of area.options) {
        const name = opt.label || opt.name || ""
        if (!name) continue
        result.push({
          id: `${group}_${name}`,
          name,
          group,
        })
      }
    } else if (group) {
      result.push({
        id: `${group}_${group}`,
        name: group,
        group,
      })
    }
  }
  return result
}

export function resetOpsFormValues(
  detail: EmbroideryOpsDetail
): EmbroideryOpsFormValues {
  const storedAreas = parseStoredWorkAreas(detail.workAreas)
  return {
    workType: asWorkTypeArray(detail.workType),
    workAreaIds: storedAreas.map((a) => a.id),
    workshopIds: asIdArray(detail.workshopId),
    machineWorkshopIds: asIdArray(detail.machineWorkshopId),
    computerizedWorkshopId: asSingleId(detail.computerizedWorkshopId),
    embStatus: detail.embStatus ?? "",
    markingStatus: detail.markingStatus ?? "",
    sampleStatus: detail.sampleStatus ?? "",
    paperStatus: detail.paperStatus ?? "",
    approvalStatus: detail.approvalStatus ?? "",
    qcStatus: detail.qcStatus ?? "",
    embRemark: detail.embRemark ?? "",
    note: detail.note ?? "",
    paperNo: detail.paperNo ?? "",
    anyDelays: anyDelaysToSelectValue(detail.anyDelays),
    markingRemarks: detail.markingRemarks ?? "",
    approvalRemarks: detail.approvalRemarks ?? "",
    estHrs: numOrEmpty(detail.estHrs),
    workHrs: numOrEmpty(detail.workHrs),
    paperHrs: numOrEmpty(detail.paperHrs),
    sampleHrs: numOrEmpty(detail.sampleHrs),
    totalActualHrs: numOrEmpty(detail.totalActualHrs),
    price: numOrEmpty(detail.price),
    estimatedCost: numOrEmpty(detail.estimatedCost),
    estimatedCostOrPrice: numOrEmpty(detail.estimatedCostOrPrice),
    embReadyDate: isoToDateInput(detail.embReadyDate?.timestamp ?? null),
    markingExpectedDate: isoToDateInput(
      detail.markingExpectedDate?.timestamp ?? null
    ),
  }
}

export function buildOpsPayload(
  values: EmbroideryOpsFormValues,
  areaOptions: WorkAreaOption[]
): Record<string, unknown> {
  const areaById = new Map(areaOptions.map((o) => [o.id, o]))
  const workAreas = values.workAreaIds
    .map((id) => areaById.get(id))
    .filter(Boolean)
    .map((opt) => JSON.stringify(opt))

  return {
    workType: values.workType,
    workAreas,
    workshopId: values.workshopIds,
    machineWorkshopId: values.machineWorkshopIds,
    computerizedWorkshopId: values.computerizedWorkshopId || null,
    embStatus: emptyToNull(values.embStatus),
    markingStatus: emptyToNull(values.markingStatus),
    sampleStatus: emptyToNull(values.sampleStatus),
    paperStatus: emptyToNull(values.paperStatus),
    approvalStatus: emptyToNull(values.approvalStatus),
    qcStatus: emptyToNull(values.qcStatus),
    embRemark: emptyToNull(values.embRemark),
    note: emptyToNull(values.note),
    paperNo: emptyToNull(values.paperNo),
    anyDelays: anyDelaysToPayload(values.anyDelays),
    markingRemarks: emptyToNull(values.markingRemarks),
    approvalRemarks: emptyToNull(values.approvalRemarks),
    estHrs: toNumber(values.estHrs),
    workHrs: toNumber(values.workHrs),
    paperHrs: toNumber(values.paperHrs),
    sampleHrs: toNumber(values.sampleHrs),
    totalActualHrs: toNumber(values.totalActualHrs),
    price: toNumber(values.price),
    estimatedCost: toNumber(values.estimatedCost),
    estimatedCostOrPrice: toNumber(values.estimatedCostOrPrice),
    embReadyDate: toTimestamp(values.embReadyDate),
    markingExpectedDate: toTimestamp(values.markingExpectedDate),
  }
}
