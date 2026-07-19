import type {
  OrderQualityCheckItem,
  QcActualMeasurement,
} from "@/lib/quality-check/types"

export function findOrderQualityCheck(
  checks: OrderQualityCheckItem[] | null | undefined,
  itemNumber: string | number | null | undefined
): OrderQualityCheckItem | null {
  if (!checks?.length || itemNumber == null || itemNumber === "") return null
  const key = String(itemNumber)
  return checks.find((c) => String(c.itemNumber ?? "") === key) ?? null
}

export function buildActualMeasurementMap(
  actuals?: QcActualMeasurement[] | null
): Map<string, number> {
  const map = new Map<string, number>()
  if (!actuals?.length) return map
  for (const row of actuals) {
    const name = row.name?.trim()
    if (!name) continue
    const value = Number(row.value)
    if (Number.isFinite(value)) map.set(name, value)
  }
  return map
}

/** Legacy calculateValues: baseline option value − actual. */
export function computeQcDifference(
  baseline: string | number | null | undefined,
  actual: number | null | undefined
): number | null {
  if (actual == null || !Number.isFinite(actual)) return null
  const base = Number(baseline)
  if (!Number.isFinite(base)) return null
  const diff = base - actual
  return Number.isFinite(diff) ? diff : null
}
