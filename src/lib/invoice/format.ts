import { extractDateFormat } from "@/lib/appointments/date-payload"
import type { MpfDateFilter } from "@/lib/customers/date-filter"

export function formatInvoiceDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatRupees(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "—"
  return `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatAmount(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "—"
  return Number(value).toFixed(2)
}

export function customerFullName(
  first?: string | null,
  last?: string | null
) {
  return [first, last].filter(Boolean).join(" ").trim() || "—"
}

/** Convert HTML date input (yyyy-mm-dd) to MPF date payload. */
export function dateInputToMpfFilter(
  value: string
): MpfDateFilter | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return extractDateFormat(date.toISOString())
}

export function timestampToDateInput(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
