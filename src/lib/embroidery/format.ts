import type { EmbroideryTimestamp } from "@/lib/apollo/queries/embroidery"

export function formatEmbroideryDate(
  value?: EmbroideryTimestamp | string | null
) {
  const raw = typeof value === "string" ? value : value?.timestamp
  if (!raw) return "—"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatWorkType(value?: string[] | string | null) {
  if (!value) return "—"
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "—"
  }
  return value
}

export function firstName(
  people?: Array<{ name?: string | null } | null> | null
) {
  return people?.[0]?.name?.trim() || "—"
}

export function firstImageUrl(
  ...candidates: Array<string | string[] | null | undefined>
) {
  for (const c of candidates) {
    if (Array.isArray(c)) {
      const hit = c.find((u) => typeof u === "string" && u.trim())
      if (hit) return hit.trim()
    } else if (typeof c === "string" && c.trim()) {
      return c.trim()
    }
  }
  return null
}

function hasNonEmptyList(value?: string | string[] | null) {
  if (Array.isArray(value)) return value.some((v) => Boolean(v && String(v).trim()))
  if (typeof value === "string") return value.trim().length > 0
  return false
}

/** Legacy eye-icon cue: design refs, work areas, or work placement present. */
export function hasEmbroideryDesignData(row?: {
  designReferenceImages?: string[] | null
  designReferencesImageUrls?: string[] | null
  workAreas?: string[] | string | null
  workPlacement?: string | string[] | null
} | null) {
  if (!row) return false
  return (
    hasNonEmptyList(row.designReferenceImages) ||
    hasNonEmptyList(row.designReferencesImageUrls) ||
    hasNonEmptyList(row.workAreas) ||
    hasNonEmptyList(row.workPlacement)
  )
}

export function getFractionLabel(fraction?: string | null) {
  switch (fraction) {
    case "ZERO":
      return "0"
    case "ONE_HALF":
      return "1/2"
    case "ONE_FOURTH":
      return "1/4"
    case "THREE_FOURTH":
      return "3/4"
    default:
      return ""
  }
}

export type WorkAreaGroup = { group: string; names: string[] }

export function parseWorkAreaGroups(
  workAreas?: string[] | string | null
): WorkAreaGroup[] {
  const raw: unknown[] = Array.isArray(workAreas)
    ? workAreas
    : typeof workAreas === "string" && workAreas.trim()
      ? [workAreas]
      : []

  const parsed = raw
    .map((wa) => {
      try {
        const obj =
          typeof wa === "string" ? (JSON.parse(wa) as Record<string, unknown>) : wa
        if (!obj || typeof obj !== "object") {
          return {
            group: "Other",
            name: typeof wa === "string" ? wa : "",
          }
        }
        const record = obj as Record<string, unknown>
        return {
          group: String(record.group || "Other"),
          name: String(record.name || record.label || record.id || ""),
        }
      } catch {
        return {
          group: "Other",
          name: typeof wa === "string" ? wa : "",
        }
      }
    })
    .filter((x) => x.name)

  const groupOrder: Record<string, number> = { Left: 0, Right: 1, Both: 2 }
  const byGroup = parsed.reduce(
    (acc, { group, name }) => {
      if (!acc[group]) acc[group] = new Set<string>()
      acc[group].add(name)
      return acc
    },
    {} as Record<string, Set<string>>
  )

  return Object.entries(byGroup)
    .map(([group, set]) => ({
      group,
      names: Array.from(set).sort(
        (a, b) =>
          (groupOrder[a] ?? 99) - (groupOrder[b] ?? 99) || a.localeCompare(b)
      ),
    }))
    .sort((a, b) => a.group.localeCompare(b.group))
}

export function formatDistanceAttr(
  otherAttributes: Array<{ name?: string | null; value?: string | number | null }> | null | undefined,
  key: string
) {
  const attr = (otherAttributes || []).find(
    (a) => a?.name === key || (a as { key?: string })?.key === key
  )
  if (attr?.value == null || attr.value === "") return "N/A"
  const num = Number(attr.value)
  if (!Number.isFinite(num)) return "N/A"
  const options = [0, 0.25, 0.5, 0.75]
  const frac = Math.abs(num - Math.trunc(num))
  let nearest = options[0]
  let minDiff = Math.abs(frac - nearest)
  for (let i = 1; i < options.length; i++) {
    const d = Math.abs(frac - options[i]!)
    if (d < minDiff) {
      minDiff = d
      nearest = options[i]!
    }
  }
  const intPart = Math.trunc(num)
  const fracLabel =
    nearest === 0.25 ? "1/4" : nearest === 0.5 ? "1/2" : nearest === 0.75 ? "3/4" : ""
  const valueLabel = fracLabel ? `${intPart} ${fracLabel}` : `${intPart}`
  return `${valueLabel} ( inch)`
}
