import type {
  OrderQualityCheckItem,
  QcActualMeasurement,
} from "@/lib/quality-check/types"

/** Normalize item numbers so `"1"` and `1` match (legacy QC product dialog). */
export function normalizeItemNumber(
  itemNumber: string | number | null | undefined
): string {
  if (itemNumber == null || itemNumber === "") return ""
  const raw = String(itemNumber).trim()
  if (!raw) return ""
  const asNum = Number(raw)
  return Number.isFinite(asNum) ? String(asNum) : raw
}

export function findOrderQualityCheck(
  checks: OrderQualityCheckItem[] | null | undefined,
  itemNumber: string | number | null | undefined
): OrderQualityCheckItem | null {
  const key = normalizeItemNumber(itemNumber)
  if (!checks?.length || !key) return null
  return (
    checks.find((c) => normalizeItemNumber(c.itemNumber) === key) ?? null
  )
}

/** True when a QC already exists for this product (legacy `hasQualityCheck`). */
export function hasOrderQualityCheck(
  checks: OrderQualityCheckItem[] | null | undefined,
  itemNumber: string | number | null | undefined
): boolean {
  return Boolean(findOrderQualityCheck(checks, itemNumber)?._id)
}

/** Prefer first source; fill gaps from later sources by item number. */
export function mergeOrderQualityChecks(
  ...sources: Array<OrderQualityCheckItem[] | null | undefined>
): OrderQualityCheckItem[] {
  const byItem = new Map<string, OrderQualityCheckItem>()
  for (const list of sources) {
    if (!list?.length) continue
    for (const check of list) {
      if (!check?._id) continue
      const key = normalizeItemNumber(check.itemNumber)
      if (!key) continue
      if (!byItem.has(key)) byItem.set(key, check)
    }
  }
  return Array.from(byItem.values())
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
