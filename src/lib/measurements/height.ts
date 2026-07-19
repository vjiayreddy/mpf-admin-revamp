/** Height helpers for body profile (legacy feet/inch ↔ cm). */

export function cmToFeetInches(heightCm: number): {
  feet: number
  inches: number
} {
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    return { feet: 0, inches: 0 }
  }
  const totalInches = heightCm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches: inches === 12 ? 0 : inches }
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0)
  // API expects Int! height — same as legacy BodyProfileForm Math.round(...)
  return Math.round(totalInches * 2.54)
}
