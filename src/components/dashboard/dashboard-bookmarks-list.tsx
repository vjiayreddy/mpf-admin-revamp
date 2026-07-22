"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  BookmarkIcon,
  ChevronRightIcon,
  PackageIcon,
  UsersRoundIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { useBookmarks } from "@/hooks/use-bookmarks"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  BookmarkEntityType,
  EntityBookmarkDto,
} from "@/lib/prefs/client"
import { cn } from "@/lib/utils"

const CATEGORY_META: Record<
  BookmarkEntityType,
  { title: string; icon: LucideIcon }
> = {
  order: { title: "Orders", icon: PackageIcon },
  lead: { title: "Leads", icon: UsersRoundIcon },
}

const CATEGORY_ORDER: BookmarkEntityType[] = ["order", "lead"]

function BookmarkRow({
  item,
  onRemove,
}: {
  item: EntityBookmarkDto
  onRemove: (id: string) => void
}) {
  return (
    <li className="border-b last:border-b-0">
      <div className="hover:bg-muted/40 flex items-center gap-2 pr-2 transition-colors">
        <Link
          href={item.href}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {item.label}
            </span>
            {item.subtitle ? (
              <span className="text-muted-foreground block truncate text-xs">
                {item.subtitle}
              </span>
            ) : null}
          </span>
          <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
        </Link>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className={cn("size-8 shrink-0")}
          aria-label={`Remove ${item.label}`}
          onClick={() => onRemove(item.id)}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </li>
  )
}

export function DashboardBookmarksList() {
  const { bookmarks, loading, removeById } = useBookmarks()

  const grouped = useMemo(() => {
    const map = new Map<BookmarkEntityType, EntityBookmarkDto[]>()
    for (const type of CATEGORY_ORDER) {
      map.set(type, [])
    }
    for (const item of bookmarks) {
      const list = map.get(item.entityType) ?? []
      list.push(item)
      map.set(item.entityType, list)
    }
    return CATEGORY_ORDER.map((type) => ({
      type,
      ...CATEGORY_META[type],
      items: map.get(type) ?? [],
    })).filter((group) => group.items.length > 0)
  }, [bookmarks])

  return (
    <section className="flex w-full flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          Saved for later
        </h2>
        <p className="text-muted-foreground text-sm">
          Orders and leads you pinned to revisit, grouped by type.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-card overflow-hidden rounded-xl border"
            >
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-card text-muted-foreground flex flex-col items-center gap-2 rounded-xl border px-4 py-10 text-center text-sm">
          <BookmarkIcon className="size-5 opacity-60" />
          <p>Nothing saved yet.</p>
          <p className="text-xs">
            Use “Save for later” on an order or lead to pin it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map((group) => {
            const Icon = group.icon
            return (
              <div
                key={group.type}
                className="bg-card overflow-hidden rounded-xl border"
              >
                <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-2.5">
                  <Icon className="text-muted-foreground size-4" />
                  <h3 className="text-sm font-medium">{group.title}</h3>
                  <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                    {group.items.length}
                  </span>
                </div>
                <ul className="divide-border">
                  {group.items.map((item) => (
                    <BookmarkRow
                      key={item.id}
                      item={item}
                      onRemove={(id) => void removeById(id)}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
