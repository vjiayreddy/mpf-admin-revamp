import type { LeadListRow, LeadStatusEntry } from "@/lib/apollo/queries/leads"

export function formatLeadDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatLeadDateTime(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function customerFullName(
  first?: string | null,
  last?: string | null
) {
  return [first, last].filter(Boolean).join(" ").trim() || "—"
}

export function latestStatus(
  status?: LeadStatusEntry | LeadStatusEntry[] | null
): LeadStatusEntry | null {
  const list = Array.isArray(status) ? status : status ? [status] : []
  if (!list.length) return null
  return list[list.length - 1] ?? null
}

export function formatPhone(
  countryCode?: string | null,
  phone?: string | null
) {
  if (!phone) return "—"
  return [countryCode, phone].filter(Boolean).join(" ").trim()
}

export function isFollowUpOverdue(row?: LeadListRow | null) {
  const ts = row?.currentStatusDate?.timestamp
  if (!ts) return false
  const latest = latestStatus(row?.status)?.name
  if (latest === "order_closed" || latest === "unsuccessful") return false
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return false
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  return date.getTime() < Date.now() && date.getTime() < endOfToday.getTime()
}

export function openWhatsApp(countryCode?: string | null, phone?: string | null) {
  if (!phone) return
  const digits = `${countryCode || ""}${phone}`.replace(/\D/g, "")
  if (!digits) return
  window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer")
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
