/**
 * Golden checks for shirt legacy formula chains (parity with tested legacy behavior).
 * Run: npx tsx src/lib/measurements/__tests__/shirt-formula-golden.ts
 */
import { shirtSchema } from "../schemas/shirt"
import {
  applyFormulasOnLoad,
  evaluateLegacyFormula,
} from "../legacy-formula-engine"
import {
  shirtBackChestFormula,
  shirtChestReadyFormula,
  shirtFromHalfChestFormula,
  outShirtLengthFormula,
} from "../legacy-internal-formulas"
import { getCombinedValue } from "../formula-engine"

function assertClose(actual: number, expected: number, label: string) {
  if (Math.abs(actual - expected) > 1e-6) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
}

function combined(
  values: Record<string, number | boolean>,
  name: string
): number {
  const numeric: Record<string, number> = {}
  for (const [k, v] of Object.entries(values)) {
    if (typeof v === "number") numeric[k] = v
  }
  return getCombinedValue(numeric, name)
}

// --- Unit: individual formulas ---
{
  const values: Record<string, number> = {
    in_shirt_length: 30,
    in_shirt_length_size: 0,
  }
  assertClose(
    evaluateLegacyFormula(outShirtLengthFormula, values),
    29.5,
    "out length"
  )
}

{
  const values: Record<string, number> = {
    shirt_chest_body: 40,
    shirt_chest_body_size: 0,
    shirt_chest_loosening: 3,
    shirt_chest_loosening_size: 0,
  }
  const ready = evaluateLegacyFormula(shirtChestReadyFormula, values)
  assertClose(ready, 43, "chest ready")
  values.shirt_chest_ready = 43
  values.shirt_chest_ready_size = 0
  // (43 + 1 + 1.5) / 4 = 11.375 → round 0.25 → 11.5
  const half = evaluateLegacyFormula(shirtFromHalfChestFormula, values)
  assertClose(half, 11.5, "front half chest")
  values.shirt_from_half_chest = 11
  values.shirt_from_half_chest_size = 0.5
  // abs(2*11.5 - 43) + 1.25 = abs(23-43)+1.25 = 20+1.25 = 21.25
  const back = evaluateLegacyFormula(shirtBackChestFormula, values)
  assertClose(back, 21.25, "back chest")
}

// --- Integration: applyFormulasOnLoad ---
{
  const hydrated: Record<string, number | boolean> = {
    in_shirt_length: 30,
    in_shirt_length_size: 0,
    shirt_chest_body: 40,
    shirt_chest_body_size: 0,
    // loosening defaults applied from schema (3)
  }
  const result = applyFormulasOnLoad(shirtSchema.options, hydrated)
  assertClose(combined(result, "out_shirt_length"), 29.5, "load out length")
  assertClose(combined(result, "shirt_chest_loosening"), 3, "default loosening")
  assertClose(combined(result, "shirt_chest_ready"), 43, "load chest ready")
  assertClose(combined(result, "shirt_from_half_chest"), 11.5, "load half chest")
  assertClose(combined(result, "shirt_back_chest"), 21.25, "load back chest")
}

console.log("shirt-formula-golden: all checks passed")
