import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { removeBookmarkById } from "@/lib/prefs/bookmarks"

export const dynamic = "force-dynamic"

type RouteCtx = { params: Promise<{ id: string }> }

/** DELETE — remove bookmark by id. */
export async function DELETE(_req: Request, ctx: RouteCtx) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params
  if (!id?.trim()) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const data = await removeBookmarkById(session.user.id, id.trim())
  return NextResponse.json(data)
}
