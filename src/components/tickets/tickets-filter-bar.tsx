"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"

import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog"
import { TicketsActiveFilters } from "@/components/tickets/tickets-active-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
} from "@/config/ticket-filters"
import type { ActiveTicketFilter } from "@/lib/tickets/build-tickets-filter"
import { cn } from "@/lib/utils"

const compactSelectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type TicketsFilterBarProps = {
  searchInputValue: string
  status: string
  priority: string
  category: string
  activeFilters: ActiveTicketFilter[]
  loading?: boolean
  onSearchSubmit: (value: string) => void
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onClearFilter: (updates: Record<string, string | null>) => void
  onClearAllFilters: () => void
  onTicketCreated?: () => void
}

export function TicketsFilterBar({
  searchInputValue,
  status,
  priority,
  category,
  activeFilters,
  loading,
  onSearchSubmit,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onClearFilter,
  onClearAllFilters,
  onTicketCreated,
}: TicketsFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)
  const [createOpen, setCreateOpen] = useState(false)
  const statusId = useId()
  const priorityId = useId()
  const categoryId = useId()

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit(draft)
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:p-4">
      <form
        onSubmit={submit}
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <div className="border-input flex min-w-0 flex-1 overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search tickets…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search tickets"
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-9 shrink-0 sm:px-4"
          disabled={loading}
        >
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={statusId} className="sr-only">
          Status
        </label>
        <select
          id={statusId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={status || "all"}
          disabled={loading}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Status: All</option>
          {TICKET_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Status: {opt.label}
            </option>
          ))}
        </select>

        <label htmlFor={priorityId} className="sr-only">
          Priority
        </label>
        <select
          id={priorityId}
          className={cn(compactSelectClass, "min-w-[9rem]")}
          value={priority || "all"}
          disabled={loading}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="all">Priority: All</option>
          {TICKET_PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Priority: {opt.label}
            </option>
          ))}
        </select>

        <label htmlFor={categoryId} className="sr-only">
          Category
        </label>
        <select
          id={categoryId}
          className={cn(compactSelectClass, "min-w-[10rem]")}
          value={category || "all"}
          disabled={loading}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">Category: All</option>
          {TICKET_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Category: {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8"
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon className="size-4" />
          Add ticket
        </Button>
      </div>

      <TicketsActiveFilters
        filters={activeFilters}
        onClearFilter={onClearFilter}
        onClearAll={onClearAllFilters}
      />

      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={onTicketCreated}
      />
    </div>
  )
}
