import type { MeasurementOption } from "@/lib/measurements/types"

export function hasMeasurementOptions(
  options?: MeasurementOption[] | null
): boolean {
  return (options?.length ?? 0) > 0
}

export function buildOptionMap(
  options?: MeasurementOption[] | null
): Map<string, MeasurementOption> {
  const map = new Map<string, MeasurementOption>()
  if (!options?.length) return map
  for (const opt of options) {
    const key = opt.name?.trim()
    if (key && !map.has(key)) map.set(key, opt)
  }
  return map
}
