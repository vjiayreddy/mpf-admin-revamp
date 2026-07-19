import type {
  MeasurementFieldDef,
  MeasurementFormulaStep,
} from "./field-types"
import {
  getFractionFromString,
  snapToQuarterFraction,
} from "./format-measurement-value"
import { applyLegacyFieldChange } from "./legacy-formula-engine"
import { isLegacyFormula } from "./legacy-formula-types"

/** Combined inch + fractional cm (legacy: Number(inch) + Number(cm)). */
export function getCombinedValue(
  values: Record<string, number>,
  name: string
): number {
  return (Number(values[name]) || 0) + (Number(values[`${name}_size`]) || 0)
}

/**
 * Split a combined value into inch + `_size` quarter fraction.
 * Snaps true decimals (formula results) to the nearest quarter.
 */
export function setCombinedValue(
  values: Record<string, number>,
  name: string,
  total: number
): void {
  const safe = Number.isFinite(total) ? total : 0
  const abs = Math.abs(safe)
  let inch = Math.trunc(abs)
  const rawFrac = abs - inch
  let fraction = snapToQuarterFraction(rawFrac)
  if (rawFrac >= 0.875) {
    inch += 1
    fraction = 0
  }
  const sign = safe < 0 ? -1 : 1
  values[name] = sign * inch
  values[`${name}_size`] = fraction
}

/**
 * Load a stored measurement option into inch + `_size` using legacy decoding.
 */
export function loadCombinedValue(
  values: Record<string, number>,
  name: string,
  stored: string | number | null | undefined
): void {
  const parsed = getFractionFromString(stored)
  values[name] = parsed.inch
  values[`${name}_size`] = parsed.fraction
}

function stepOperand(
  step: MeasurementFormulaStep,
  values: Record<string, number>
): number {
  if (step.field != null && step.field !== "") {
    return getCombinedValue(values, step.field)
  }
  return step.value ?? 0
}

/**
 * Evaluate a simple formula step list.
 * Starts at 0; ADD/SUB/MULTIPLY/DIVIDE apply each operand; ROUND uses value as step size.
 */
export function evaluateFormulaSteps(
  steps: MeasurementFormulaStep[],
  values: Record<string, number>
): number {
  let acc = 0

  for (const step of steps) {
    const operand = stepOperand(step, values)

    switch (step.operation) {
      case "ADD":
        acc += operand
        break
      case "SUB":
        acc -= operand
        break
      case "MULTIPLY":
        acc *= operand
        break
      case "DIVIDE":
        if (operand !== 0) acc /= operand
        break
      case "ROUND": {
        const stepSize = operand || 0.25
        acc = Math.round(acc / stepSize) * stepSize
        break
      }
      default:
        break
    }
  }

  return acc
}

function baseFieldName(name: string): string {
  return name.endsWith("_size") ? name.slice(0, -"_size".length) : name
}

/**
 * Apply cascading updates after a field edit.
 * Prefers legacy `internalFormula` / `manualUpdateFormula` objects (parity).
 * Falls back to simple `formula` step arrays for schemas not yet fully ported.
 */
export function applyFieldChange(
  fields: MeasurementFieldDef[][],
  values: Record<string, number | boolean>,
  changedName: string
): Record<string, number | boolean> {
  const changedBase = baseFieldName(changedName)
  const flat = fields.flat()
  const field = flat.find((f) => f.name === changedBase)

  const hasLegacy =
    !!field &&
    ((Array.isArray(field.internalFormula) &&
      field.internalFormula.some(isLegacyFormula)) ||
      (Array.isArray(field.manualUpdateFormula) &&
        (field.manualUpdateFormula.some(isLegacyFormula) ||
          typeof field.manualUpdateFormula[0] === "string")))

  if (hasLegacy) {
    return applyLegacyFieldChange(fields, values, changedBase)
  }

  // Simple step-array cascade (older simplified schemas)
  const next: Record<string, number | boolean> = { ...values }
  const numeric: Record<string, number> = {}
  for (const [k, v] of Object.entries(next)) {
    if (typeof v === "number") numeric[k] = v
  }
  const dirty = new Set<string>([changedBase])

  for (let pass = 0; pass < flat.length + 1; pass++) {
    let progressed = false

    for (const f of flat) {
      const steps = f.formula
      if (!Array.isArray(steps) || !steps.length) continue
      if (isLegacyFormula(steps as unknown)) continue

      const dependsOnDirty = steps.some(
        (s) =>
          typeof s === "object" &&
          s != null &&
          "field" in s &&
          (s as MeasurementFormulaStep).field != null &&
          dirty.has((s as MeasurementFormulaStep).field!)
      )
      if (!dependsOnDirty) continue
      if (next[`${f.name}_isUpdateManually`] === true) continue

      const result = evaluateFormulaSteps(
        steps as MeasurementFormulaStep[],
        numeric
      )
      const prev = getCombinedValue(numeric, f.name)
      if (Math.abs(result - prev) > 1e-9) {
        setCombinedValue(numeric, f.name, result)
        next[f.name] = numeric[f.name]
        next[`${f.name}_size`] = numeric[`${f.name}_size`]
        dirty.add(f.name)
        progressed = true
      }
    }

    if (!progressed) break
  }

  return next
}
