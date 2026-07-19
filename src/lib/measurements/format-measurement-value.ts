/**
 * Port of legacy getFractionFromString / getFractionValues.
 * Stored values encode inches as `whole.fractionCode` where the fractional
 * part maps to 1/4, 1/2, or 3/4 display strings.
 */

function getFractionValues(cm: number): { value: number; str: string } {
  if (cm >= 0 && cm <= 9) {
    if (cm >= 0 && cm < 3) return { value: 0.25, str: "1/4" }
    if (cm >= 3 && cm <= 5) return { value: 0.5, str: "1/2" }
    return { value: 0.75, str: "3/4" }
  }
  if (cm >= 10) {
    if (cm >= 10 && cm <= 30) return { value: 0.25, str: "1/4" }
    if (cm >= 30 && cm <= 50) return { value: 0.5, str: "1/2" }
    return { value: 0.75, str: "3/4" }
  }
  return { value: 0, str: "" }
}

function parseFraction(raw: string | number): {
  inch: number
  cmString: string
} {
  const parts = String(raw).split(".")
  const inch = Number(parts[0]) || 0
  if (parts.length < 2 || parts[1] === "") {
    return { inch, cmString: "" }
  }
  return {
    inch,
    cmString: getFractionValues(Number(parts[1])).str,
  }
}

/** Format a measurement option value for display (e.g. `38 1/2`). */
export function formatMeasurementValue(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" && value.trim() === "") return "—"

  const numeric =
    typeof value === "number" ? value : Number(String(value).trim())
  if (!Number.isFinite(numeric) || numeric === 0) {
    // Non-numeric labels (e.g. shoe size text) — show as-is when present
    if (typeof value === "string" && value.trim() && !Number.isFinite(numeric)) {
      return value.trim()
    }
    if (numeric === 0) return "—"
  }

  const { inch, cmString } = parseFraction(value)
  if (!inch && !cmString) return "—"
  return cmString ? `${inch} ${cmString}` : String(inch)
}
