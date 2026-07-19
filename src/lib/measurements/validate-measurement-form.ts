import type { MeasurementFieldDef } from "./field-types"
import { getCombinedValue } from "./formula-engine"

export type FieldValidationError = {
  name: string
  label: string
  message: string
}

/**
 * Legacy DynamicFormFields inch rules:
 * required (if isRequired), number, >= 0, <= 100, integer.
 */
export function validateMeasurementFormValues(
  fields: MeasurementFieldDef[][],
  values: Record<string, number | boolean | string>
): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const numeric: Record<string, number> = {}
  for (const [k, v] of Object.entries(values)) {
    if (typeof v === "number") numeric[k] = v
  }

  for (const field of fields.flat()) {
    // Still validate required calculated fields for completeness
    const hasKey = Object.prototype.hasOwnProperty.call(numeric, field.name)
    const inch = hasKey ? numeric[field.name] : undefined

    if (hasKey && inch !== undefined) {
      if (Number.isNaN(Number(inch))) {
        errors.push({
          name: field.name,
          label: field.label,
          message: `${field.label} must be a number`,
        })
        continue
      }
      if (inch < 0) {
        errors.push({
          name: field.name,
          label: field.label,
          message: `${field.label} must be 0 or greater`,
        })
        continue
      }
      if (inch > 100) {
        errors.push({
          name: field.name,
          label: field.label,
          message: `${field.label} must be 100 or less`,
        })
        continue
      }
      if (!Number.isInteger(Number(inch))) {
        errors.push({
          name: field.name,
          label: field.label,
          message: `${field.label} must be a whole number (inches)`,
        })
        continue
      }
    }

    if (field.isRequired) {
      const total = getCombinedValue(numeric, field.name)
      if (!Number.isFinite(total) || total <= 0) {
        errors.push({
          name: field.name,
          label: field.label,
          message: `${field.label} is required`,
        })
      }
    }
  }

  return errors
}
