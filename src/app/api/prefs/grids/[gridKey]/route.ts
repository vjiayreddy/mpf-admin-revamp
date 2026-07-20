import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  getGridPresets,
  isValidGridKey,
  resetWorkingPreset,
} from "@/lib/prefs/grid-presets"

export const dynamic = "force-dynamic"

type RouteCtx = { params: Promise<{ gridKey: string }> }

async function requireUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user?.id ?? null
}

/** GET — list presets + active column state for this grid. */
export async function GET(_req: Request, ctx: RouteCtx) {
  const userId = await requireUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gridKey } = await ctx.params
  if (!isValidGridKey(gridKey)) {
    return NextResponse.json({ error: "Invalid grid key" }, { status: 400 })
  }

  const data = await getGridPresets(userId, gridKey)
  return NextResponse.json(data)
}

/** DELETE — reset working layout to defaults and activate Working. */
export async function DELETE(_req: Request, ctx: RouteCtx) {
  const userId = await requireUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gridKey } = await ctx.params
  if (!isValidGridKey(gridKey)) {
    return NextResponse.json({ error: "Invalid grid key" }, { status: 400 })
  }

  const data = await resetWorkingPreset(userId, gridKey)
  return NextResponse.json(data)
}
