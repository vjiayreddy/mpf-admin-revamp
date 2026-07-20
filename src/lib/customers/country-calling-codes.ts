import en from "react-phone-number-input/locale/en"
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input"

export type CountryCallingCodeOption = {
  /** Dialing code digits, e.g. "91" (GraphQL UserFilter.countryCode). */
  value: string
  /** Display label, e.g. "India (+91)". */
  label: string
  iso2: string
}

const countryNames = en as Record<string, string>

/**
 * All countries as filter dropdown options.
 * Duplicate calling codes (US/CA → 1) keep one entry with a combined label
 * so the select value stays unique and matches the API filter.
 */
export const COUNTRY_CALLING_CODE_OPTIONS: CountryCallingCodeOption[] =
  (() => {
    const byCode = new Map<string, CountryCallingCodeOption>()

    for (const iso2 of getCountries()) {
      const callingCode = String(getCountryCallingCode(iso2))
      const name = countryNames[iso2] || iso2
      const label = `${name} (+${callingCode})`
      const existing = byCode.get(callingCode)
      if (!existing) {
        byCode.set(callingCode, { value: callingCode, label, iso2 })
      } else {
        const baseName = existing.label.replace(/\s\(\+\d[\d-]*\)$/, "")
        byCode.set(callingCode, {
          value: callingCode,
          label: `${baseName} / ${name} (+${callingCode})`,
          iso2: existing.iso2,
        })
      }
    }

    return Array.from(byCode.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "en")
    )
  })()

export function labelForCallingCode(callingCode: string): string {
  const trimmed = callingCode.trim()
  if (!trimmed) return callingCode
  const match = COUNTRY_CALLING_CODE_OPTIONS.find((o) => o.value === trimmed)
  return match?.label ?? `+${trimmed}`
}
