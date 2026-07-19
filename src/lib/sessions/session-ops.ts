import { eq } from "drizzle-orm"

import { authDb } from "@/lib/auth-db"
import { session, user } from "@/lib/auth-schema"
import type { LoginSessionRow } from "@/lib/sessions/list-sessions"

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

function toRow(row: {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date | null
  updatedAt: Date | null
  ipAddress: string | null
  userAgent: string | null
  userName: string | null
  userEmail: string | null
  role: string | null
}): LoginSessionRow {
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
    active: expiresMs > Date.now(),
  }
}

/** Fetch one login session by id (joined with user). */
export async function getLoginSessionById(
  sessionId: string
): Promise<LoginSessionRow | null> {
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
    .where(eq(session.id, sessionId))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  return toRow(row)
}

/**
 * Delete a Better Auth session row from auth.db.
 * Other browsers holding that session token will fail getSession on next check.
 */
export async function revokeLoginSession(
  sessionId: string
): Promise<{ deleted: boolean }> {
  const deleted = await authDb
    .delete(session)
    .where(eq(session.id, sessionId))
    .returning({ id: session.id })

  return { deleted: deleted.length > 0 }
}
