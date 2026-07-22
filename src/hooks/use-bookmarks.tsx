"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  addEntityBookmark,
  fetchBookmarks,
  removeBookmarkById,
  removeEntityBookmark,
  type BookmarkEntityType,
  type EntityBookmarkDto,
} from "@/lib/prefs/client"
import { notify } from "@/lib/notify"

type BookmarksContextValue = {
  bookmarks: EntityBookmarkDto[]
  loading: boolean
  isBookmarked: (entityType: BookmarkEntityType, entityId: string) => boolean
  toggleBookmark: (input: {
    entityType: BookmarkEntityType
    entityId: string
    label: string
    href?: string
    subtitle?: string | null
  }) => Promise<void>
  removeById: (bookmarkId: string) => Promise<void>
  refresh: () => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

function bookmarkKey(entityType: BookmarkEntityType, entityId: string) {
  return `${entityType}:${entityId}`
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<EntityBookmarkDto[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchBookmarks()
      setBookmarks(data.bookmarks)
    } catch {
      // Session may not be ready yet; ignore soft failures on mount.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const keySet = useMemo(() => {
    const set = new Set<string>()
    for (const b of bookmarks) {
      set.add(bookmarkKey(b.entityType, b.entityId))
    }
    return set
  }, [bookmarks])

  const isBookmarked = useCallback(
    (entityType: BookmarkEntityType, entityId: string) =>
      keySet.has(bookmarkKey(entityType, entityId.trim())),
    [keySet]
  )

  const toggleBookmark = useCallback(
    async (input: {
      entityType: BookmarkEntityType
      entityId: string
      label: string
      href?: string
      subtitle?: string | null
    }) => {
      const entityId = input.entityId.trim()
      if (!entityId) return

      try {
        if (isBookmarked(input.entityType, entityId)) {
          const data = await removeEntityBookmark(input.entityType, entityId)
          setBookmarks(data.bookmarks)
          notify.success("Removed from saved")
        } else {
          const data = await addEntityBookmark({
            ...input,
            entityId,
          })
          setBookmarks(data.bookmarks)
          notify.success("Saved for later")
        }
      } catch (err) {
        notify.fromError(err, "Could not update saved item")
      }
    },
    [isBookmarked]
  )

  const removeById = useCallback(async (bookmarkId: string) => {
    try {
      const data = await removeBookmarkById(bookmarkId)
      setBookmarks(data.bookmarks)
      notify.success("Removed from saved")
    } catch (err) {
      notify.fromError(err, "Could not remove saved item")
    }
  }, [])

  const value = useMemo(
    (): BookmarksContextValue => ({
      bookmarks,
      loading,
      isBookmarked,
      toggleBookmark,
      removeById,
      refresh,
    }),
    [bookmarks, loading, isBookmarked, toggleBookmark, removeById, refresh]
  )

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) {
    throw new Error("useBookmarks must be used within BookmarksProvider")
  }
  return ctx
}
