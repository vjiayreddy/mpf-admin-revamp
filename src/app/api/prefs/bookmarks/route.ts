import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import {
  addBookmark,
  isBookmarkEntityType,
  listBookmarks,
  removeBookmarkByEntity,
} from "@/lib/prefs/bookmarks"

export const dynamic = "force-dynamic"

/** GET — list current user's bookmarks (newest first). */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await listBookmarks(session.user.id)
  return NextResponse.json(data)
}

/** POST — add or refresh a bookmark. */
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    entityType?: string
    entityId?: string
    label?: string
    href?: string
    subtitle?: string | null
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.entityType || !isBookmarkEntityType(body.entityType)) {
    return NextResponse.json(
      { error: "entityType must be order or lead" },
      { status: 400 }
    )
  }
  if (!body.entityId?.trim()) {
    return NextResponse.json({ error: "entityId is required" }, { status: 400 })
  }
  if (!body.label?.trim()) {
    return NextResponse.json({ error: "label is required" }, { status: 400 })
  }

  try {
    const data = await addBookmark(session.user.id, {
      entityType: body.entityType,
      entityId: body.entityId,
      label: body.label,
      href: body.href,
      subtitle: body.subtitle,
    })
    return NextResponse.json(data)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save bookmark"
    const status = message.includes("at most") ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

/** DELETE — remove by entityType + entityId query params. */
export async function DELETE(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const entityType = url.searchParams.get("entityType") ?? ""
  const entityId = url.searchParams.get("entityId") ?? ""

  if (!isBookmarkEntityType(entityType) || !entityId.trim()) {
    return NextResponse.json(
      { error: "entityType and entityId are required" },
      { status: 400 }
    )
  }

  const data = await removeBookmarkByEntity(
    session.user.id,
    entityType,
    entityId
  )
  return NextResponse.json(data)
}
