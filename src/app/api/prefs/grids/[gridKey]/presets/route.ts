import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  createNamedPreset,
  isValidGridKey,
} from "@/lib/prefs/grid-presets"

export const dynamic = "force-dynamic"

type RouteCtx = { params: Promise<{ gridKey: string }> }

/** POST — create a named preset from current column state (max 2). */
export async function POST(req: Request, ctx: RouteCtx) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gridKey } = await ctx.params
  if (!isValidGridKey(gridKey)) {
    return NextResponse.json({ error: "Invalid grid key" }, { status: 400 })
  }

  let body: { name?: string; columnState?: unknown }
  try {
    body = (await req.json()) as { name?: string; columnState?: unknown }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!Array.isArray(body.columnState)) {
    return NextResponse.json(
      { error: "columnState must be an array" },
      { status: 400 }
    )
  }

  try {
    const data = await createNamedPreset(
      session.user.id,
      gridKey,
      body.name ?? "",
      body.columnState
    )
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save preset"
    const status = message.includes("at most") ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
