import { getCombinedValue } from "./formula-engine"

export type FabricBodyMetrics = {
  bodyMax: number
  bodyLength: number
  sleeveLength: number
}

function numKeys(values: Record<string, number | boolean | string>) {
  return Object.keys(values).filter(
    (k) =>
      !k.endsWith("_size") &&
      !k.endsWith("_isUpdateManually") &&
      typeof values[k] === "number"
  )
}

function combined(
  values: Record<string, number | boolean | string>,
  name: string
): number {
  const numeric: Record<string, number> = {}
  for (const [k, v] of Object.entries(values)) {
    if (typeof v === "number") numeric[k] = v
  }
  return getCombinedValue(numeric, name)
}

function findBy(
  values: Record<string, number | boolean | string>,
  pred: (name: string) => boolean
): number {
  for (const name of numKeys(values)) {
    if (pred(name)) return combined(values, name)
  }
  return 0
}

/**
 * Port of legacy `getMeasurementBodyLength` for Fabric Requirement readonly fields.
 * Derives Body Max / Length / Sleeve from current form values.
 */
export function getFabricBodyMetrics(
  values: Record<string, number | boolean | string>
): FabricBodyMetrics {
  const chest = findBy(
    values,
    (n) => n.endsWith("_chest_ready") && !n.includes("below")
  )
  const waist = findBy(values, (n) => n.endsWith("_waist_ready"))
  const seat = findBy(values, (n) => n.endsWith("_seat_ready"))

  let bodyMax = 0
  if (chest >= waist && chest >= seat) bodyMax = chest
  else if (waist >= chest && waist >= seat) bodyMax = waist
  else bodyMax = seat

  // Prefer garment body length (shirt: in_shirt_length); exclude sleeve/half
  const lengthNames = numKeys(values).filter(
    (n) =>
      !n.includes("sleeve") &&
      !n.includes("half") &&
      (n === "in_shirt_length" ||
        n.endsWith("_length") ||
        /_length$/.test(n))
  )
  lengthNames.sort((a, b) => {
    if (a === "in_shirt_length") return -1
    if (b === "in_shirt_length") return 1
    return a.length - b.length
  })
  const bodyLength = lengthNames[0] ? combined(values, lengthNames[0]) : 0

  const sleeveLength = findBy(
    values,
    (n) => n.includes("sleeve_length") && !n.includes("half")
  )

  return { bodyMax, bodyLength, sleeveLength }
}
