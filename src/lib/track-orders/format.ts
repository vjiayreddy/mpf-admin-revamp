import type { StoreOrderTimestamp } from "@/lib/apollo/queries/store-orders"

export function formatStoreOrderDate(
  value?: StoreOrderTimestamp | string | null
) {
  const raw = typeof value === "string" ? value : value?.timestamp
  if (!raw) return "—"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatRupees(amount?: number | null) {
  if (amount == null || Number.isNaN(Number(amount))) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function customerFullName(
  first?: string | null,
  last?: string | null
) {
  const name = `${first ?? ""} ${last ?? ""}`.trim()
  return name || "—"
}

export function truncateWords(text?: string | null, maxWords = 6) {
  if (!text?.trim()) return "—"
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(" ")}…`
}
