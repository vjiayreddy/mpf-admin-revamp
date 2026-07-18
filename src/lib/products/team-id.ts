/** Resolve first team id from session teamsJson (legacy saveProduct teamId). */
export function teamIdFromTeamsJson(
  teamsJson: string | null | undefined
): string | null {
  if (!teamsJson) return null
  try {
    const teams = JSON.parse(teamsJson) as Array<{ _id?: string } | null>
    return teams?.[0]?._id ?? null
  } catch {
    return null
  }
}
