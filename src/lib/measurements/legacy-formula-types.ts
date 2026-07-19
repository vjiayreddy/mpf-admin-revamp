export type LegacyFormulaOperation = {
  sortOrder?: number
  operation: "ADD" | "SUB" | "MULTIPLY" | "DIVIDE" | "ROUND" | string
  attributeA?: string | null
  attributeB?: string | null
  hasConstant?: number | null
  /** Legacy typo retained for parity with formula JSON. */
  considerPerviousValue?: boolean
}

export type LegacyFormula = {
  output_attribute: string
  operations: LegacyFormulaOperation[]
}

export function isLegacyFormula(value: unknown): value is LegacyFormula {
  if (!value || typeof value !== "object") return false
  const v = value as LegacyFormula
  return (
    typeof v.output_attribute === "string" && Array.isArray(v.operations)
  )
}

export function asLegacyFormulaList(value: unknown): LegacyFormula[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter(isLegacyFormula)
  }
  if (isLegacyFormula(value)) return [value]
  return []
}

export function hasAttr(name: string | null | undefined): boolean {
  return name != null && String(name).trim() !== ""
}
