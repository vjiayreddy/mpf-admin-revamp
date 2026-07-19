import { desc, eq } from "drizzle-orm"

import { authDb } from "@/lib/auth-db"
import { session, user } from "@/lib/auth-schema"

export type LoginSessionRow = {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  role: string | null
  createdAt: string | null
  updatedAt: string | null
  expiresAt: string | null
  ipAddress: string | null
  userAgent: string | null
  /** Masked session token (never full value). */
  tokenPreview: string
  active: boolean
}

function toIso(value: Date | null | undefined): string | null {
  if (!value) return null
  try {
    return value.toISOString()
  } catch {
    return null
  }
}

function maskToken(token: string): string {
  if (token.length <= 10) return "••••••••"
  return `${token.slice(0, 6)}…${token.slice(-4)}`
}

/** List Better Auth login sessions from auth.db (joined with user). */
export async function listLoginSessions(
  limit = 100
): Promise<LoginSessionRow[]> {
  const rows = await authDb
    .select({
      id: session.id,
      userId: session.userId,
      token: session.token,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
    })
    .from(session)
    .leftJoin(user, eq(session.userId, user.id))
    .orderBy(desc(session.createdAt))
    .limit(limit)

  const now = Date.now()

  return rows.map((row) => {
    const expiresMs = row.expiresAt?.getTime?.() ?? 0
    return {
      id: row.id,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      role: row.role,
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
      expiresAt: toIso(row.expiresAt),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      tokenPreview: maskToken(row.token),
      active: expiresMs > now,
    }
  })
}
