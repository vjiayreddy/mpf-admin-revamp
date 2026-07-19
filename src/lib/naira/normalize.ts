/**
 * Pull a list payload out of common Nyra response shapes:
 * array | { data: T[] } | { records: T[] } | first array value.
 */
export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== "object") return []

  const obj = payload as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data as T[]
  if (Array.isArray(obj.records)) return obj.records as T[]
  if (Array.isArray(obj.results)) return obj.results as T[]

  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) return value as T[]
  }
  return []
}

export function readPeriodDays(payload: unknown, fallback: number): number {
  if (!payload || typeof payload !== "object") return fallback
  const obj = payload as Record<string, unknown>
  const days = obj.days ?? obj.period_days
  return typeof days === "number" && Number.isFinite(days) ? days : fallback
}
