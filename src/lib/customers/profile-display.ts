import type { CustomerProfileUser } from "@/lib/apollo/queries/get-user"

export function formatProfileDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function displayCustomerName(user?: CustomerProfileUser | null) {
  if (!user) return "—"
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.fullName ||
    "—"
  )
}

export function customerInitials(user?: CustomerProfileUser | null) {
  const name = displayCustomerName(user)
  if (name === "—") return "?"
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function formatInr(amount?: number | null) {
  if (amount == null || Number.isNaN(amount)) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function e164FromParts(
  countryCode?: string | null,
  phone?: string | null
) {
  const digits = `${countryCode ?? ""}${phone ?? ""}`.replace(/\D/g, "")
  if (!digits) return ""
  return `+${digits}`
}

export function openWhatsApp(countryCode?: string | null, phone?: string | null) {
  const digits = `${countryCode ?? ""}${phone ?? ""}`.replace(/\D/g, "")
  if (!digits) return
  window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer")
}

export function callPhone(countryCode?: string | null, phone?: string | null) {
  const digits = `${countryCode ?? ""}${phone ?? ""}`.replace(/\D/g, "")
  if (!digits) return
  window.location.href = `tel:+${digits}`
}

export function labelize(value?: string | null) {
  if (!value) return "—"
  return value.replaceAll("_", " ").toLowerCase()
}
