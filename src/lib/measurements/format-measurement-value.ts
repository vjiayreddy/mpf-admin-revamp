/**
 * Port of legacy getFractionFromString / getFractionValues / decimalToFraction.
 * Stored values encode inches as `whole.fractionCode` where the fractional
 * part maps to 1/4, 1/2, or 3/4 display strings.
 */

export type MeasurementFractionParts = {
  inch: number
  /** Numeric fraction for form/select: 0 | 0.25 | 0.5 | 0.75 */
  fraction: number
  /** Display label: "" | "1/4" | "1/2" | "3/4" */
  fractionLabel: string
}

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

/** Snap a decimal remainder to the nearest quarter used by the form select. */
export function snapToQuarterFraction(fraction: number): number {
  if (!Number.isFinite(fraction) || fraction <= 0) return 0
  if (fraction >= 0.875) return 0.75
  const options = [0, 0.25, 0.5, 0.75]
  let best = 0
  let bestDist = Infinity
  for (const opt of options) {
    const dist = Math.abs(fraction - opt)
    if (dist < bestDist) {
      bestDist = dist
      best = opt
    }
  }
  return best
}

/**
 * Port of legacy `decimalToFraction` — used when writing formula results
 * back to inch + `_size` fields.
 */
export function decimalToFraction(decimal: number): {
  inch: number
  cm: number
  cmString: string
} {
  if (!Number.isFinite(decimal)) {
    return { inch: 0, cm: 0, cmString: "0" }
  }

  let wholeNumber = Math.floor(decimal)
  let decimalPart = decimal - wholeNumber

  if (decimalPart === 0) {
    return { inch: wholeNumber, cmString: "0", cm: 0 }
  }

  const result = decimalPart * 100
  let cmString = "0"

  if (result <= 25) {
    cmString = "1/4"
    decimalPart = 0.25
  } else if (result >= 25 && result <= 50) {
    cmString = "1/2"
    decimalPart = 0.5
  } else if (result >= 50 && result <= 75) {
    cmString = "3/4"
    decimalPart = 0.75
  } else {
    cmString = "0"
    decimalPart = 0
    wholeNumber = wholeNumber + 1
  }

  return { inch: wholeNumber, cmString, cm: decimalPart }
}

/**
 * Split a stored measurement value into whole inches + quarter fraction.
 * Supports both true decimals (38.5) and legacy digit codes (38.3 → 1/2).
 */
export function getFractionFromString(
  value: string | number | null | undefined
): MeasurementFractionParts {
  if (value === null || value === undefined || value === "") {
    return { inch: 0, fraction: 0, fractionLabel: "" }
  }

  const numeric =
    typeof value === "number" ? value : Number(String(value).trim())
  if (!Number.isFinite(numeric)) {
    return { inch: 0, fraction: 0, fractionLabel: "" }
  }

  const parts = String(value).split(".")
  const inch = Math.trunc(Math.abs(Number(parts[0]) || 0))
  const sign = numeric < 0 ? -1 : 1

  if (parts.length < 2 || parts[1] === "") {
    return { inch: sign * inch, fraction: 0, fractionLabel: "" }
  }

  const decimalDigits = parts[1]
  const asTrueDecimal = Number(`0.${decimalDigits}`)

  if (
    Math.abs(asTrueDecimal - 0.25) < 1e-6 ||
    Math.abs(asTrueDecimal - 0.5) < 1e-6 ||
    Math.abs(asTrueDecimal - 0.75) < 1e-6
  ) {
    const snapped = snapToQuarterFraction(asTrueDecimal)
    const label =
      snapped === 0.25
        ? "1/4"
        : snapped === 0.5
          ? "1/2"
          : snapped === 0.75
            ? "3/4"
            : ""
    return { inch: sign * inch, fraction: snapped, fractionLabel: label }
  }

  const coded = getFractionValues(Number(decimalDigits))
  return {
    inch: sign * inch,
    fraction: coded.value,
    fractionLabel: coded.str,
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
    if (typeof value === "string" && value.trim() && !Number.isFinite(numeric)) {
      return value.trim()
    }
    if (numeric === 0) return "—"
  }

  const parsed = getFractionFromString(value)
  if (!parsed.inch && !parsed.fractionLabel) return "—"
  return parsed.fractionLabel
    ? `${parsed.inch} ${parsed.fractionLabel}`
    : String(parsed.inch)
}
