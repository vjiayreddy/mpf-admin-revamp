import type { MpfDateFilter } from "@/lib/customers/date-filter"

/** Build MPF date object for verifyStoreOrderPayment body.date. */
export function paymentDateInputToMpfFilter(
  value: string
): MpfDateFilter | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n))
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

export function formatReceiptDate(value?: string | null) {
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
  return `Rs. ${Number(value).toLocaleString("en-IN")} /-`
}

export function customerFullName(
  first?: string | null,
  last?: string | null
) {
  return [first, last].filter(Boolean).join(" ").trim() || "—"
}
