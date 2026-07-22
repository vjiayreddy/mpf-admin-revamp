"use client"

import { BookmarkIcon, BookmarkCheckIcon } from "lucide-react"

import { useBookmarks } from "@/hooks/use-bookmarks"
import type { BookmarkEntityType } from "@/lib/prefs/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EntityBookmarkButtonProps = {
  entityType: BookmarkEntityType
  entityId: string
  label: string
  href?: string
  subtitle?: string | null
  variant?: "icon" | "outline"
  className?: string
}

export function EntityBookmarkButton({
  entityType,
  entityId,
  label,
  href,
  subtitle,
  variant = "outline",
  className,
}: EntityBookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(entityType, entityId)

  async function onClick(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    await toggleBookmark({
      entityType,
      entityId,
      label,
      href,
      subtitle,
    })
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className={cn("size-8", className)}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        aria-pressed={saved}
        onClick={(e) => void onClick(e)}
      >
        {saved ? (
          <BookmarkCheckIcon className="size-4 text-amber-600 dark:text-amber-400" />
        ) : (
          <BookmarkIcon className="size-4" />
        )}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn("h-8 gap-1.5", className)}
      aria-pressed={saved}
      onClick={(e) => void onClick(e)}
    >
      {saved ? (
        <BookmarkCheckIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
      ) : (
        <BookmarkIcon className="size-3.5" />
      )}
      {saved ? "Saved" : "Save for later"}
    </Button>
  )
}
