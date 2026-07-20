import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  isValidGridKey,
  saveActiveColumnState,
} from "@/lib/prefs/grid-presets"

export const dynamic = "force-dynamic"

type RouteCtx = { params: Promise<{ gridKey: string }> }

/** PUT — save column state onto the active preset. */
export async function PUT(req: Request, ctx: RouteCtx) {
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

  let body: { columnState?: unknown }
  try {
    body = (await req.json()) as { columnState?: unknown }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!Array.isArray(body.columnState)) {
    return NextResponse.json(
      { error: "columnState must be an array" },
      { status: 400 }
    )
  }

  const data = await saveActiveColumnState(
    session.user.id,
    gridKey,
    body.columnState
  )
  return NextResponse.json(data)
}
