import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { isValidGridKey, setActivePreset } from "@/lib/prefs/grid-presets"

export const dynamic = "force-dynamic"

type RouteCtx = { params: Promise<{ gridKey: string }> }

/** POST — activate a preset for this grid. */
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

  let body: { presetId?: string }
  try {
    body = (await req.json()) as { presetId?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.presetId?.trim()) {
    return NextResponse.json({ error: "presetId is required" }, { status: 400 })
  }

  try {
    const data = await setActivePreset(
      session.user.id,
      gridKey,
      body.presetId.trim()
    )
    return NextResponse.json(data)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to activate preset"
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
