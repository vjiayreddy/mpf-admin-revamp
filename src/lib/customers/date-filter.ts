/**
 * MPF API date filter shape (legacy startDateFilter / endDateFilter, without moment).
 */

export type MpfDateFilter = {
  day: number
  month: number
  year: number
  hour: number
  minute: number
  timestamp: string
  datestamp: string
}

function parts(date: Date) {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

export function startDateFilter(isoOrDate: string): MpfDateFilter {
  const date = new Date(isoOrDate)
  const { day, month, year } = parts(date)
  const datestamp = `${year - 2000}${pad2(month)}${pad2(day)}0000`
  return {
    day,
    month,
    year,
    hour: 0,
    minute: 0,
    timestamp: date.toISOString(),
    datestamp,
  }
}

export function endDateFilter(isoOrDate: string): MpfDateFilter {
  const date = new Date(isoOrDate)
  const { day, month, year } = parts(date)
  const datestamp = `${year - 2000}${pad2(month)}${pad2(day)}2359`
  return {
    day,
    month,
    year,
    hour: 23,
    minute: 59,
    timestamp: date.toISOString(),
    datestamp,
  }
}

/** URL stores ISO; date inputs need yyyy-MM-dd. */
export function isoToDateInput(value: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  return `${y}-${m}-${d}`
}

/** Local date input → ISO for URL (stable, timezone-safe enough for filter ranges). */
export function dateInputToIso(value: string): string | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}
