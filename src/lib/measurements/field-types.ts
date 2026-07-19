import type { LegacyFormula } from "./legacy-formula-types"

export type FormulaOp = "ADD" | "SUB" | "MULTIPLY" | "DIVIDE" | "ROUND"

export type MeasurementFormulaStep = {
  operation: FormulaOp
  value?: number
  field?: string
}

export type MeasurementFieldDef = {
  label: string
  name: string
  role?: string
  isRequired?: boolean
  isUpdateManually?: boolean | null
  canBeEdited?: boolean
  /** Default whole inches when no saved value (legacy schema `inch`). */
  defaultInch?: number | null
  /** Default fraction when no saved value (legacy schema `cm`). */
  defaultCm?: number | null
  /**
   * Display / simple steps, or a legacy formula object (fx badge).
   * `false`/`null` means no formula badge.
   */
  formula?:
    | MeasurementFormulaStep[]
    | LegacyFormula
    | false
    | null
  /**
   * Cascading formulas run on load and when this driver field changes.
   * Prefer `LegacyFormula[]`. String / opaque placeholders allowed until fully ported.
   */
  internalFormula?: LegacyFormula[] | string[] | string | Record<string, unknown> | null
  /** When user edits this calculated field, mark manual + update linked outputs. */
  manualUpdateFormula?: LegacyFormula[] | string[] | null
  resetFormula?: LegacyFormula[] | null
}

export type MeasurementGarmentSchema = {
  catId: string
  subCat: string
  options: MeasurementFieldDef[][]
}
