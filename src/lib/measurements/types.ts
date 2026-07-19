export type MeasurementField = {
  label: string
  name: string
}

/** One table row = ordered cells of measurement fields. */
export type MeasurementLayoutRow = MeasurementField[]

export type MeasurementCategoryMeta = {
  name: string
  catId: string
  /** Public path or absolute URL; optional. */
  image?: string | null
}

export type MeasurementCategoryConfig = MeasurementCategoryMeta & {
  rows: MeasurementLayoutRow[]
}

export type MeasurementOption = {
  label?: string | null
  name?: string | null
  value?: string | number | null
  attributeImageUrl?: string | null
  isUpdateManually?: boolean | null
}

export type UserMeasurementRecord = {
  _id?: string | null
  catId?: string | null
  type?: string | null
  measuredBy?: string | null
  approvedBy?: string | null
  approvedStatus?: string | null
  note?: string | null
  pannaSize?: string | null
  isDyable?: boolean | null
  noOfMeters?: number | string | null
  remarks?: string | null
  pdf?: string | null
  updatedAt?: string | null
  approvedByStylist?: { _id?: string | null; name?: string | null } | null
  category?: { name?: string | null } | null
  dateRecorded?: {
    day?: number | null
    month?: number | null
    year?: number | null
    hour?: number | null
    minute?: number | null
    timestamp?: string | null
  } | null
  approvedDate?: { timestamp?: string | null } | null
  options?: MeasurementOption[] | null
}
