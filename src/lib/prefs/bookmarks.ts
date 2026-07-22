import { and, desc, eq } from "drizzle-orm"

import { prefsDb } from "@/lib/prefs/prefs-db"
import { entityBookmarks } from "@/lib/prefs/prefs-schema"

export const BOOKMARK_ENTITY_TYPES = ["order", "lead"] as const
export type BookmarkEntityType = (typeof BOOKMARK_ENTITY_TYPES)[number]

export const MAX_BOOKMARKS_PER_USER = 50

export type EntityBookmarkDto = {
  id: string
  entityType: BookmarkEntityType
  entityId: string
  label: string
  href: string
  subtitle: string | null
  createdAt: string
}

export type BookmarksResponse = {
  bookmarks: EntityBookmarkDto[]
}

export function isBookmarkEntityType(value: string): value is BookmarkEntityType {
  return (BOOKMARK_ENTITY_TYPES as readonly string[]).includes(value)
}

function newId() {
  return crypto.randomUUID()
}

function toDto(row: typeof entityBookmarks.$inferSelect): EntityBookmarkDto {
  return {
    id: row.id,
    entityType: row.entityType as BookmarkEntityType,
    entityId: row.entityId,
    label: row.label,
    href: row.href,
    subtitle: row.subtitle ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
  }
}

export function defaultBookmarkHref(
  entityType: BookmarkEntityType,
  entityId: string
) {
  if (entityType === "order") {
    return `/orders/form?orderId=${encodeURIComponent(entityId)}`
  }
  return `/leads/form?leadId=${encodeURIComponent(entityId)}`
}

export async function listBookmarks(
  userId: string
): Promise<BookmarksResponse> {
  const rows = await prefsDb
    .select()
    .from(entityBookmarks)
    .where(eq(entityBookmarks.userId, userId))
    .orderBy(desc(entityBookmarks.createdAt))

  return { bookmarks: rows.map(toDto) }
}

export async function addBookmark(
  userId: string,
  input: {
    entityType: BookmarkEntityType
    entityId: string
    label: string
    href?: string
    subtitle?: string | null
  }
): Promise<BookmarksResponse> {
  const entityId = input.entityId.trim()
  const label = input.label.trim()
  if (!entityId) throw new Error("entityId is required")
  if (!label) throw new Error("label is required")

  const existing = await prefsDb
    .select()
    .from(entityBookmarks)
    .where(
      and(
        eq(entityBookmarks.userId, userId),
        eq(entityBookmarks.entityType, input.entityType),
        eq(entityBookmarks.entityId, entityId)
      )
    )
    .limit(1)

  if (existing[0]) {
    await prefsDb
      .update(entityBookmarks)
      .set({
        label,
        href: input.href?.trim() || existing[0].href,
        subtitle: input.subtitle?.trim() || null,
      })
      .where(eq(entityBookmarks.id, existing[0].id))
    return listBookmarks(userId)
  }

  const countRows = await prefsDb
    .select({ id: entityBookmarks.id })
    .from(entityBookmarks)
    .where(eq(entityBookmarks.userId, userId))

  if (countRows.length >= MAX_BOOKMARKS_PER_USER) {
    throw new Error(
      `You can save at most ${MAX_BOOKMARKS_PER_USER} items. Remove one first.`
    )
  }

  await prefsDb.insert(entityBookmarks).values({
    id: newId(),
    userId,
    entityType: input.entityType,
    entityId,
    label,
    href: input.href?.trim() || defaultBookmarkHref(input.entityType, entityId),
    subtitle: input.subtitle?.trim() || null,
    createdAt: new Date(),
  })

  return listBookmarks(userId)
}

export async function removeBookmarkById(
  userId: string,
  bookmarkId: string
): Promise<BookmarksResponse> {
  await prefsDb
    .delete(entityBookmarks)
    .where(
      and(
        eq(entityBookmarks.userId, userId),
        eq(entityBookmarks.id, bookmarkId)
      )
    )
  return listBookmarks(userId)
}

export async function removeBookmarkByEntity(
  userId: string,
  entityType: BookmarkEntityType,
  entityId: string
): Promise<BookmarksResponse> {
  await prefsDb
    .delete(entityBookmarks)
    .where(
      and(
        eq(entityBookmarks.userId, userId),
        eq(entityBookmarks.entityType, entityType),
        eq(entityBookmarks.entityId, entityId.trim())
      )
    )
  return listBookmarks(userId)
}
