"use client"

import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ActiveCifFilter } from "@/lib/cif/build-cif-filter"

type CifActiveFiltersProps = {
  filters: ActiveCifFilter[]
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAll: () => void
}

export function CifActiveFilters({
  filters,
  onClearFilter,
  onClearAll,
}: CifActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="gap-1 pr-1 font-normal"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span className="max-w-[12rem] truncate">{filter.displayValue}</span>
          <button
            type="button"
            className="hover:bg-muted ml-0.5 rounded-sm p-0.5"
            aria-label={`Clear ${filter.label} filter`}
            onClick={() => onClearFilter(filter.clear)}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  )
}
