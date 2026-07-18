"use client"

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ActiveLeadFilter } from "@/lib/leads/build-leads-filter"
import { cn } from "@/lib/utils"

type LeadsActiveFiltersProps = {
  filters: ActiveLeadFilter[]
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAll: () => void
  className?: string
}

export function LeadsActiveFilters({
  filters,
  onClearFilter,
  onClearAll,
  className,
}: LeadsActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-t pt-3",
        className
      )}
      aria-label="Applied filters"
    >
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Applied
      </span>
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onClearFilter(filter.clear)}
          className="bg-muted text-foreground hover:bg-muted/80 inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs transition-colors"
          title={`Remove ${filter.label} filter`}
        >
          <span className="min-w-0 truncate">
            <span className="text-muted-foreground">{filter.label}: </span>
            <span className="font-medium">{filter.displayValue}</span>
          </span>
          <XIcon className="text-muted-foreground size-3.5 shrink-0" />
        </button>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="text-muted-foreground h-7"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  )
}
