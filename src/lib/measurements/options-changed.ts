/**
 * Legacy NewForm: create a new measurement record when attribute
 * name/value pairs change; update the existing row when only meta
 * fields (approval, note, panna, meters, etc.) change.
 */

export type OptionNameValue = {
  name: string
  value: number
}

export function toOptionNameValues(
  options:
    | Array<{ name?: string | null; value?: string | number | null }>
    | null
    | undefined
): OptionNameValue[] {
  return (options ?? [])
    .filter((opt): opt is { name: string; value?: string | number | null } =>
      Boolean(opt?.name)
    )
    .map((opt) => ({
      name: opt.name,
      value: Number(opt.value) || 0,
    }))
}

/** True when measurement attribute options differ from the loaded baseline. */
export function measurementAttributeOptionsChanged(
  current: OptionNameValue[],
  saved: OptionNameValue[] | null | undefined
): boolean {
  if (!saved) return true
  if (current.length !== saved.length) return true
  for (let i = 0; i < current.length; i++) {
    const a = current[i]
    const b = saved[i]
    if (!a || !b) return true
    if (a.name !== b.name) return true
    if (a.value !== b.value) return true
  }
  return false
}
