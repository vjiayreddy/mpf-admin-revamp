import type { MpfDateFilter } from "@/lib/customers/date-filter"

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

/** Legacy extractDateFormate for status follow-up dates. */
export function extractDateFormat(isoOrDate: string): MpfDateFilter {
  const date = new Date(isoOrDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours() % 12 || 12
  const minute = date.getMinutes()
  return {
    day,
    month,
    year,
    hour,
    minute,
    timestamp: date.toISOString(),
    datestamp: `${year - 2000}${pad2(month)}${pad2(day)}${pad2(hour)}${pad2(minute)}`,
  }
}

/**
 * Legacy extractAppointDateFormate — date from appointment day,
 * hour/minute from selected time.
 */
export function extractAppointDateFormat(
  dateIso: string,
  timeIso: string
): MpfDateFilter {
  const date = new Date(dateIso)
  const time = new Date(timeIso)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = time.getHours()
  const minute = time.getMinutes()
  return {
    day,
    month,
    year,
    hour,
    minute,
    timestamp: date.toISOString(),
    datestamp: `${year - 2000}${pad2(month)}${pad2(day)}${pad2(hour)}${pad2(minute)}`,
  }
}

/** yyyy-MM-dd for date inputs from ISO/timestamp. */
export function isoToDateInput(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** HH:mm for time inputs from ISO/timestamp. */
export function isoToTimeInput(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/** Combine yyyy-MM-dd + HH:mm into a local Date ISO string. */
export function dateAndTimeToIso(dateInput: string, timeInput: string): string {
  const time = timeInput || "00:00"
  const date = new Date(`${dateInput}T${time}:00`)
  return date.toISOString()
}
