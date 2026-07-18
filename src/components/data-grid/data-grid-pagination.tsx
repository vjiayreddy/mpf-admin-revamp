"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DataGridPaginationProps = {
  /** 0-based page index */
  page: number
  pageSize: number
  /** Rows on the current page — used to disable Next when short page */
  currentPageCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
  /** When set, Next uses totalCount instead of short-page heuristic */
  totalCount?: number
}

export function DataGridPagination({
  page,
  pageSize,
  currentPageCount,
  onPageChange,
  disabled = false,
  className,
  totalCount,
}: DataGridPaginationProps) {
  const canPrev = page > 0 && !disabled
  const canNext =
    totalCount != null
      ? (page + 1) * pageSize < totalCount && !disabled
      : currentPageCount >= pageSize && !disabled

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t px-3 py-2",
        className
      )}
    >
      <p className="text-muted-foreground text-sm">
        Page {page + 1}
        <span className="text-muted-foreground/70">
          {" "}
          · up to {pageSize} per page
          {totalCount != null ? ` · ${totalCount.toLocaleString()} total` : ""}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-4" />
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
