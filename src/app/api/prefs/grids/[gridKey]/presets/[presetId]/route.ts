import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  deleteNamedPreset,
  isValidGridKey,
  renameNamedPreset,
} from "@/lib/prefs/grid-presets"

export const dynamic = "force-dynamic"

type RouteCtx = { params: Promise<{ gridKey: string; presetId: string }> }

/** PATCH — rename a named preset. */
export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gridKey, presetId } = await ctx.params
  if (!isValidGridKey(gridKey)) {
    return NextResponse.json({ error: "Invalid grid key" }, { status: 400 })
  }

  let body: { name?: string }
  try {
    body = (await req.json()) as { name?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const data = await renameNamedPreset(
      session.user.id,
      gridKey,
      presetId,
      body.name ?? ""
    )
    return NextResponse.json(data)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to rename preset"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/** DELETE — delete a named preset. */
export async function DELETE(_req: Request, ctx: RouteCtx) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gridKey, presetId } = await ctx.params
  if (!isValidGridKey(gridKey)) {
    return NextResponse.json({ error: "Invalid grid key" }, { status: 400 })
  }

  try {
    const data = await deleteNamedPreset(session.user.id, gridKey, presetId)
    return NextResponse.json(data)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete preset"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
