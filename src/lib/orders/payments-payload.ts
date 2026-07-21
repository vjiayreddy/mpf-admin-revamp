import { extractDateFormat } from "@/lib/appointments/date-payload"
import type { StoreOrderTimestamp } from "@/lib/apollo/queries/store-orders"
import type { OrderPaymentLine } from "@/lib/orders/form"

function cleanTimestamp(date?: StoreOrderTimestamp | null) {
  if (!date?.timestamp && date?.day == null) return null
  return {
    datestamp: date.datestamp ?? "",
    day: date.day ?? 0,
    hour: date.hour ?? 0,
    minute: date.minute ?? 0,
    month: date.month ?? 0,
    timestamp: date.timestamp ?? "",
    year: date.year ?? 0,
  }
}

/** Map form payment lines → updatePaymentsForStoreOrder vars. */
export function buildUpdatePaymentsPayload(lines: OrderPaymentLine[]) {
  return lines.map((item) => ({
    date: cleanTimestamp(item.date),
    amount: Number(item.amount) || 0,
    modeOfPayment: item.modeOfPayment,
    note: item.note,
    isAdvance: item.isAdvance === true || item.isAdvance === "true",
    ...(item.screenShotUrl ? { screenShotUrl: item.screenShotUrl } : {}),
    ...(item.verifiedBy ? { verifiedBy: item.verifiedBy } : {}),
    ...(item.isVerified != null ? { isVerified: item.isVerified } : {}),
    ...(item.accountRemark ? { accountRemark: item.accountRemark } : {}),
  }))
}

export function paymentDateFromInput(dateInput: string) {
  if (!dateInput.trim()) return null
  return extractDateFormat(new Date(`${dateInput}T00:00:00`).toISOString())
}
