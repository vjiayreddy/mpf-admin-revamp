import { jwtDecode } from "jwt-decode"

/**
 * MPF GraphQL expects Mongo ObjectIds (24-char hex).
 * Better Auth session.user.id is a local SQLite id — use the JWT `_id` instead.
 */
export function mpfUserIdFromAccessToken(
  token?: string | null
): string | null {
  if (!token?.trim()) return null
  try {
    const payload = jwtDecode<{ _id?: string }>(token)
    const id = payload._id?.trim()
    if (!id) return null
    if (!/^[a-fA-F0-9]{24}$/.test(id)) return null
    return id
  } catch {
    return null
  }
}
