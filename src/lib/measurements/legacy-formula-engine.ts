import type { MeasurementFieldDef } from "./field-types"
import {
  asLegacyFormulaList,
  hasAttr,
  type LegacyFormula,
  type LegacyFormulaOperation,
} from "./legacy-formula-types"
import { decimalToFraction } from "./format-measurement-value"

function getCombinedValue(
  values: Record<string, number>,
  name: string
): number {
  return (Number(values[name]) || 0) + (Number(values[`${name}_size`]) || 0)
}

function readField(
  values: Record<string, number>,
  name: string | null | undefined
): number {
  if (!hasAttr(name)) return 0
  return getCombinedValue(values, name as string)
}

/**
 * Evaluate one legacy formula object against a flat values map.
 * Semantics mirror legacy load-time *Action helpers + onChange empty A/B paths
 * (ADD/SUB/MUL/DIV/ROUND) so shirt half/back chains match production.
 */
export function evaluateLegacyFormula(
  formula: LegacyFormula,
  values: Record<string, number>
): number {
  let value = 0

  for (const op of formula.operations ?? []) {
    const prevValue = op.considerPerviousValue ? value : 0
    value = applyOperation(op, values, prevValue)
  }

  return value
}

function applyOperation(
  op: LegacyFormulaOperation,
  values: Record<string, number>,
  prevValue: number
): number {
  const hasA = hasAttr(op.attributeA)
  const hasB = hasAttr(op.attributeB)
  const constant = Number(op.hasConstant) || 0
  const a = readField(values, op.attributeA)
  const b = readField(values, op.attributeB)

  switch (op.operation) {
    case "ADD": {
      if (hasA && hasB) return a + b + prevValue + constant
      if (hasA && !hasB) return prevValue + a + constant
      if (!hasA && hasB) return prevValue + b + constant
      return prevValue + constant
    }
    case "SUB": {
      // Mirrors legacy subtractAction for the formula shapes we ship
      // (A-only, B-only with previous, constant-only).
      if (hasA && hasB) {
        const result = Math.abs(a - b)
        return Math.abs(Math.abs(prevValue - result) - constant)
      }
      if (hasA && !hasB) {
        const diff = Math.abs(a - prevValue)
        let next = diff - constant
        if (next <= 0) next = 0
        return next
      }
      if (!hasA && hasB) {
        const diff = Math.abs(b - prevValue)
        let next = diff - constant
        if (next <= 0) next = 0
        return next
      }
      {
        let next = prevValue - constant
        if (next <= 0) next = 0
        return next
      }
    }
    case "MULTIPLY": {
      if (hasA && !hasB) return a * constant
      if (!hasA && hasB) return b * constant
      return prevValue * constant
    }
    case "DIVIDE": {
      // Legacy empty A/B path: prev / constant (half-chest chain).
      if (hasA && !hasB) {
        // Legacy load divisionAction multiplied here; onChange divider uses *.
        // Formula JSON for garments uses empty A/B for true division — prefer that.
        return constant !== 0 ? a / constant : 0
      }
      if (!hasA && hasB) return constant !== 0 ? b / constant : 0
      return constant !== 0 ? prevValue / constant : 0
    }
    case "ROUND": {
      if (constant === 0) return prevValue
      return Math.round(prevValue / constant) * constant
    }
    default:
      return prevValue
  }
}

function writeOutput(
  values: Record<string, number | boolean>,
  outputName: string,
  total: number,
  force = false
): void {
  if (!force && values[`${outputName}_isUpdateManually`] === true) return
  const parts = decimalToFraction(total)
  values[outputName] = parts.inch
  values[`${outputName}_size`] = parts.cm
}

/** Run a list of legacy formula objects; writes outputs into values. */
export function runLegacyFormulas(
  formulas: LegacyFormula[],
  values: Record<string, number | boolean>,
  options?: { force?: boolean }
): void {
  const numeric = values as Record<string, number>
  for (const formula of formulas) {
    const result = evaluateLegacyFormula(formula, numeric)
    writeOutput(values, formula.output_attribute, result, options?.force)
  }
}

/**
 * After hydrate: apply schema default inch/cm where empty, then run every
 * field's `internalFormula` chains (legacy load getCalculatedMeasurements).
 */
export function applyFormulasOnLoad(
  fields: MeasurementFieldDef[][],
  values: Record<string, number | boolean>
): Record<string, number | boolean> {
  const next: Record<string, number | boolean> = { ...values }
  const flat = fields.flat()

  for (const field of flat) {
    const hasInch =
      typeof next[field.name] === "number" &&
      Number.isFinite(next[field.name] as number)
    if (!hasInch && field.defaultInch != null) {
      next[field.name] = field.defaultInch
    }
    const sizeKey = `${field.name}_size`
    const hasSize =
      typeof next[sizeKey] === "number" && Number.isFinite(next[sizeKey] as number)
    if (!hasSize && field.defaultCm != null) {
      next[sizeKey] = field.defaultCm
    } else if (!hasSize) {
      next[sizeKey] = 0
    }
  }

  // Reset per formula (safer than legacy shared accumulator across fields).
  for (const field of flat) {
    const formulas = asLegacyFormulaList(field.internalFormula)
    if (formulas.length) {
      runLegacyFormulas(formulas, next)
    }
  }

  return next
}

/**
 * On field edit: mark manual when needed, then run internal or manual formulas
 * for the changed field (legacy handleCalculateFormula).
 */
export function applyLegacyFieldChange(
  fields: MeasurementFieldDef[][],
  values: Record<string, number | boolean>,
  changedBaseName: string
): Record<string, number | boolean> {
  const next: Record<string, number | boolean> = { ...values }
  const flat = fields.flat()
  const field = flat.find((f) => f.name === changedBaseName)
  if (!field) return next

  const manualList = asLegacyFormulaList(field.manualUpdateFormula)
  const internalList = asLegacyFormulaList(field.internalFormula)

  if (manualList.length) {
    // Editing a formula output marks it (and linked outputs) manual.
    next[`${field.name}_isUpdateManually`] = true
    for (const f of manualList) {
      next[`${f.output_attribute}_isUpdateManually`] = true
    }
    // If manualUpdateFormula[0] is this field name (string form), only flag — legacy.
    runLegacyFormulas(manualList, next, { force: true })
    return next
  }

  // String-array style manualUpdateFormula: ["out_shirt_length"]
  if (
    Array.isArray(field.manualUpdateFormula) &&
    field.manualUpdateFormula.length &&
    typeof field.manualUpdateFormula[0] === "string"
  ) {
    next[`${field.name}_isUpdateManually`] = true
    return next
  }

  if (internalList.length) {
    runLegacyFormulas(internalList, next)
  }

  return next
}

/** True when the field should show the formula (fx) affordance. */
export function fieldHasFormulaBadge(field: MeasurementFieldDef): boolean {
  if (asLegacyFormulaList(field.formula).length) return true
  if (Array.isArray(field.formula) && field.formula.length) return true
  if (field.formula && typeof field.formula === "object") return true
  return false
}
