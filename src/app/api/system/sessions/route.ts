import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { listLoginSessions } from "@/lib/sessions/list-sessions"

export const dynamic = "force-dynamic"

/** GET — login sessions from auth.db (requires signed-in admin). */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sessions = await listLoginSessions(150)

  return NextResponse.json({
    sessions,
    total: sessions.length,
    active: sessions.filter((s) => s.active).length,
  })
}
