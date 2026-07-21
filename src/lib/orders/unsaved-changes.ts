import type {
  OrderFormItem,
  OrderFormValues,
  OrderMoneyLine,
  OrderPaymentLine,
} from "@/lib/orders/form"

export type OrderExtrasSnapshot = {
  items: OrderFormItem[]
  otherCharges: OrderMoneyLine[]
  deductions: OrderMoneyLine[]
  payments: OrderPaymentLine[]
  secondaryStylistIds: string[]
  leadIds: string[]
  customerCifIds: string[]
}

const FIELD_LABELS: Partial<Record<keyof OrderFormValues, string>> = {
  customerFirstName: "First name",
  customerLastName: "Last name",
  customerPhone: "Phone",
  customerEmail: "Email",
  customerId: "Customer serial no",
  customerCity: "City",
  customerSegment: "Segment",
  customerHeight: "Height",
  customerWeight: "Weight",
  customerIsStyleClubMember: "Style club member",
  orderNo: "Order number",
  studioId: "Studio",
  sourceChannelId: "Source",
  sourceSubChannelId: "Sub source",
  personalStylistId: "Personal stylist",
  orderStatus: "Order status",
  orderDate: "Order date",
  trialDate: "Trial date",
  eventDate: "Event date",
  readyDate: "Ready date",
  deliveryDate: "Delivery date",
  remark: "Remark",
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value)
}

function sortedIds(ids: string[]): string[] {
  return [...ids].map((id) => id.trim()).filter(Boolean).sort()
}

export function snapshotOrderExtras(input: OrderExtrasSnapshot): OrderExtrasSnapshot {
  return {
    items: structuredClone(input.items),
    otherCharges: structuredClone(input.otherCharges),
    deductions: structuredClone(input.deductions),
    payments: structuredClone(input.payments),
    secondaryStylistIds: sortedIds(input.secondaryStylistIds),
    leadIds: sortedIds(input.leadIds),
    customerCifIds: sortedIds(input.customerCifIds),
  }
}

export function orderExtrasEqual(
  a: OrderExtrasSnapshot | null,
  b: OrderExtrasSnapshot
): boolean {
  if (!a) return false
  return (
    stableStringify({
      ...a,
      secondaryStylistIds: sortedIds(a.secondaryStylistIds),
      leadIds: sortedIds(a.leadIds),
      customerCifIds: sortedIds(a.customerCifIds),
    }) ===
    stableStringify({
      ...b,
      secondaryStylistIds: sortedIds(b.secondaryStylistIds),
      leadIds: sortedIds(b.leadIds),
      customerCifIds: sortedIds(b.customerCifIds),
    })
  )
}

export function collectDirtyFormFieldLabels(
  dirtyFields: Partial<Record<keyof OrderFormValues, unknown>>
): string[] {
  const labels: string[] = []
  for (const key of Object.keys(dirtyFields) as Array<keyof OrderFormValues>) {
    if (!dirtyFields[key]) continue
    // Skip internal ids that users don't edit directly as "content"
    if (key === "_id" || key === "userId") continue
    labels.push(FIELD_LABELS[key] ?? String(key))
  }
  return labels
}

export function collectOrderExtrasChangeLabels(
  baseline: OrderExtrasSnapshot | null,
  current: OrderExtrasSnapshot
): string[] {
  if (!baseline) return []
  const labels: string[] = []
  if (stableStringify(baseline.items) !== stableStringify(current.items)) {
    labels.push("Order items")
  }
  if (
    stableStringify(baseline.otherCharges) !==
    stableStringify(current.otherCharges)
  ) {
    labels.push("Other charges")
  }
  if (
    stableStringify(baseline.deductions) !==
    stableStringify(current.deductions)
  ) {
    labels.push("Deductions")
  }
  if (stableStringify(baseline.payments) !== stableStringify(current.payments)) {
    labels.push("Payments")
  }
  if (
    stableStringify(sortedIds(baseline.secondaryStylistIds)) !==
    stableStringify(sortedIds(current.secondaryStylistIds))
  ) {
    labels.push("Secondary stylists")
  }
  if (
    stableStringify(sortedIds(baseline.leadIds)) !==
    stableStringify(sortedIds(current.leadIds))
  ) {
    labels.push("Leads")
  }
  if (
    stableStringify(sortedIds(baseline.customerCifIds)) !==
    stableStringify(sortedIds(current.customerCifIds))
  ) {
    labels.push("CIFs")
  }
  return labels
}
