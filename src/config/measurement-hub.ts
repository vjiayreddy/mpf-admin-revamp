/** URL tab keys for customer measurements hub. */

export const MEASUREMENT_HUB_TABS = {
  body: "body",
  pics: "pics",
  form: "form",
  history: "history",
  sizing: "sizing",
} as const

export type MeasurementHubTab =
  (typeof MEASUREMENT_HUB_TABS)[keyof typeof MEASUREMENT_HUB_TABS]

export const MEASUREMENT_HUB_TAB_OPTIONS: {
  id: MeasurementHubTab
  label: string
}[] = [
  { id: "body", label: "Body Profile" },
  { id: "pics", label: "Upload Pics" },
  { id: "form", label: "Measurements" },
  { id: "history", label: "History" },
  { id: "sizing", label: "Standard sizing" },
]

export function parseMeasurementHubTab(
  value: string | null | undefined
): MeasurementHubTab {
  if (value === "1" || value === "pics") return "pics"
  if (value === "2" || value === "form") return "form"
  if (value === "3" || value === "history") return "history"
  if (value === "4" || value === "sizing") return "sizing"
  if (
    value === "body" ||
    value === "pics" ||
    value === "form" ||
    value === "history" ||
    value === "sizing"
  ) {
    return value
  }
  const n = Number(value)
  if (n === 1) return "pics"
  if (n === 2) return "form"
  if (n === 3) return "history"
  if (n === 4) return "sizing"
  return "body"
}

export const MEASUREMENT_APPROVAL_OPTIONS = [
  { value: "APPROVED", label: "Approved" },
  { value: "UNAPPROVED", label: "Unapproved" },
  { value: "PENDING", label: "Pending" },
  { value: "REQUESTED", label: "Requested" },
  { value: "DISMISSED", label: "Dismissed" },
] as const

export const MEASUREMENT_REMARK_OPTIONS = [
  { value: "first_time", label: "First time" },
  { value: "repeat", label: "Repeat" },
  { value: "trial/alt", label: "Trial / Alt" },
] as const

/** Legacy hardcoded tailor / measured-by list. */
export const MEASUREMENT_TAILORED_BY = [
  { value: "self", label: "Self" },
  { value: "studio", label: "Studio" },
  { value: "doorstep", label: "Doorstep" },
] as const

/** Legacy inch fraction dropdown (0, 1/4, 1/2, 3/4). */
export const MEASUREMENT_FRACTION_OPTIONS = [
  { label: "0", value: 0 },
  { label: "1/4", value: 0.25 },
  { label: "1/2", value: 0.5 },
  { label: "3/4", value: 0.75 },
] as const

/** Legacy Fabric Requirement — panna size select. */
export const MEASUREMENT_PANNA_SIZE_OPTIONS = [
  { label: "Select panna", value: "" },
  { label: "58 inches Panna (Bada Panna)", value: "58" },
  { label: "44 inches Panna (Medium Panna)", value: "44" },
  { label: "36 inches Panna (Small Panna)", value: "36" },
] as const

/** Legacy Fabric Requirement — meters whole / fraction digits 0–9. */
export const MEASUREMENT_METERS_DIGIT_OPTIONS = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
] as const
