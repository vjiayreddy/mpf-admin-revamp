export function formatOnlineOrderDate(value?: string | null) {
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

export function formatAddress(parts: {
  address1?: string | null
  address2?: string | null
  landmark?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
}) {
  return [
    parts.address1,
    parts.address2,
    parts.landmark,
    parts.city,
    parts.state,
    parts.country,
    parts.postalCode,
  ]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(", ")
}
