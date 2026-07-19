import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  getLoginSessionById,
  revokeLoginSession,
} from "@/lib/sessions/session-ops"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ id: string }>
}

/** GET — single login session detail. */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const row = await getLoginSessionById(id)
  if (!row) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json({
    session: row,
    isCurrent: session.session.id === id,
  })
}

/**
 * DELETE — force logout: remove session from auth.db.
 * Any browser still holding that cookie will lose access on next auth check.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await getLoginSessionById(id)
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const isCurrent = session.session.id === id
  const { deleted } = await revokeLoginSession(id)

  if (!deleted) {
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    revokedId: id,
    isCurrent,
  })
}
