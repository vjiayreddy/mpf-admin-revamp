export function formatInr(value?: number | null) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 4,
  }).format(n)
}

export function formatNumber(value?: number | null) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat("en-US").format(n)
}

export function formatTimestamp(value?: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}
