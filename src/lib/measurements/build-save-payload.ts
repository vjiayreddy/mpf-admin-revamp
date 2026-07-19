import type {
  MeasurementOptionInput,
  UserMeasurementsInput,
} from "@/lib/apollo/queries/measurements"
import type { MpfDateFilter } from "@/lib/customers/date-filter"

import type { MeasurementGarmentSchema } from "./field-types"

export type BuildSavePayloadFormValues = Record<string, unknown> & {
  mtr_1?: unknown
  mtr_2?: unknown
  pannaSize?: unknown
  note?: unknown
  approvedBy?: unknown
  approvedDate?: MpfDateFilter | null
  approvedStatus?: unknown
}

export type BuildSavePayloadArgs = {
  schema: MeasurementGarmentSchema
  formValues: BuildSavePayloadFormValues
  userId: string
  measuredBy?: string
  isDyable?: boolean
  remarks?: string | null
  isDraft?: boolean
  type?: string
  /** Existing measurement id when updating. */
  _id?: string
  /** Override schema.subCat when needed. */
  subCat?: string
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function asApprovedById(approvedBy: unknown): string | null {
  if (approvedBy == null || approvedBy === "") return null
  if (typeof approvedBy === "string") return approvedBy
  if (
    typeof approvedBy === "object" &&
    approvedBy !== null &&
    "_id" in approvedBy
  ) {
    const id = (approvedBy as { _id?: unknown })._id
    return id == null || id === "" ? null : String(id)
  }
  return null
}

/**
 * Build UserMeasurementsInput from flat form values + schema.
 * value = inch + cm fraction (legacy: Number(inch) + Number(cm) where cm is fractional like 0.5).
 */
export function buildSavePayload({
  schema,
  formValues,
  userId,
  measuredBy = "self",
  isDyable = false,
  remarks = null,
  isDraft = false,
  type = "",
  _id,
  subCat,
}: BuildSavePayloadArgs): UserMeasurementsInput {
  const {
    approvedDate,
    approvedBy,
    approvedStatus,
    mtr_1,
    mtr_2,
    note,
    pannaSize,
    ...rest
  } = formValues

  const updatedOptions: MeasurementOptionInput[] = []

  for (const group of schema.options) {
    for (const item of group) {
      const inch = num(rest[item.name])
      const cm = num(rest[`${item.name}_size`])
      const value = inch + cm
      const manualFlag = rest[`${item.name}_isUpdateManually`]

      updatedOptions.push({
        label: item.label,
        name: item.name,
        isUpdateManually:
          typeof manualFlag === "boolean" ? manualFlag : undefined,
        value: Number.isNaN(value) ? 0 : value,
      })
    }
  }

  const payload: UserMeasurementsInput = {
    userId,
    catId: schema.catId,
    subCat: subCat ?? schema.subCat,
    isDraft,
    type,
    measuredBy: measuredBy?.trim() ? measuredBy : "self",
    noOfMeters: parseFloat(`${num(mtr_1)}.${num(mtr_2)}`),
    pannaSize: pannaSize != null && pannaSize !== "" ? num(pannaSize) : 0,
    note: typeof note === "string" && note.trim() ? note : "",
    isDyable,
    updatedOptions,
    remarks: remarks ?? null,
    approvedBy: asApprovedById(approvedBy),
  }

  if (approvedDate) {
    payload.approvedDate = approvedDate
  }
  if (approvedStatus != null && approvedStatus !== "") {
    payload.approvedStatus = String(approvedStatus)
  }
  if (_id) {
    payload._id = _id
  }

  return payload
}
