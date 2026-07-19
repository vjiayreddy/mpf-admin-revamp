import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import { calCommonMeasurements } from "./cal-common-measurements"
import { getFractionFromString } from "./format-measurement-value"
import { setCombinedValue } from "./formula-engine"

export type CommonMeasurementOption = {
  name?: string | null
  value?: string | number | null
}

/** Categories that seed from last saved Shirt when they have no own save. */
export const SHIRT_COMMON_CAT_IDS = new Set<string>([
  MEASUREMENT_CATEGORIES.BLAZER,
  MEASUREMENT_CATEGORIES.WAISTCOAT,
  MEASUREMENT_CATEGORIES.INDOWESTERN,
  MEASUREMENT_CATEGORIES.KURTA,
  MEASUREMENT_CATEGORIES.JODHPURI,
  MEASUREMENT_CATEGORIES.SHERWANI,
  MEASUREMENT_CATEGORIES.SADARI,
  MEASUREMENT_CATEGORIES.CHUDIDAR,
  MEASUREMENT_CATEGORIES.SUIT,
])

/** Categories that seed from last saved Trouser when they have no own save. */
export const TROUSER_COMMON_CAT_IDS = new Set<string>([
  MEASUREMENT_CATEGORIES.CHINOS,
  MEASUREMENT_CATEGORIES.POONA_PANT,
  MEASUREMENT_CATEGORIES.DHOTI,
  MEASUREMENT_CATEGORIES.GURKA_PANT,
  MEASUREMENT_CATEGORIES.SUIT,
])

export function needsShirtCommon(catId: string): boolean {
  return SHIRT_COMMON_CAT_IDS.has(catId)
}

export function needsTrouserCommon(catId: string): boolean {
  return TROUSER_COMMON_CAT_IDS.has(catId)
}

/**
 * Apply shirt or trouser common mappings into a values map for the target category.
 * Uses the declared ADD/SUB operations from legacy `calCommonMeasurements`
 * (ADD adds offset; SUB subtracts — intended config semantics).
 */
export function applyCommonMeasurements(
  sourceOptions: CommonMeasurementOption[] | null | undefined,
  sourceKind: "shirt" | "trouser",
  values: Record<string, number | boolean>
): Record<string, number | boolean> {
  const next = { ...values }
  const block =
    sourceKind === "shirt"
      ? calCommonMeasurements[0]
      : calCommonMeasurements[1]
  if (!block?.inputs?.length) return next

  for (const input of block.inputs) {
    const source = (sourceOptions ?? []).find((o) => o.name === input.name)
    if (!source || source.value == null || source.value === "") continue

    const parsed = getFractionFromString(source.value)
    const sourceTotal = parsed.inch + parsed.fraction

    for (const output of input.outputs ?? []) {
      if (!output?.name) continue
      let total = sourceTotal
      const offset = Number(output.value) || 0
      if (output.operation === "SUB") {
        total = sourceTotal - offset
      } else if (output.operation === "ADD") {
        total = sourceTotal + offset
      } else {
        // Legacy fallback: treat unknown as subtract (matches buggy else branch)
        total = sourceTotal - offset
      }
      if (total <= 0) total = 0
      setCombinedValue(next as Record<string, number>, output.name, total)
    }
  }

  return next
}
