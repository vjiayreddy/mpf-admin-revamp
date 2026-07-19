"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { SearchIcon } from "lucide-react"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TRACK_ORDERS_SORT_OPTIONS,
  TRACK_ORDERS_STATUS_OPTIONS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-calendar-filters"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-8 shrink-0 rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type TrackOrdersCalendarFiltersBarProps = {
  sortByEnum: TrackOrdersSortBy
  orderStatus: string
  stylistId: string
  searchTerm: string
  orderCount: number
  loading?: boolean
  onSortByChange: (value: TrackOrdersSortBy) => void
  onOrderStatusChange: (value: string) => void
  onStylistChange: (value: string) => void
  onSearchChange: (value: string) => void
}

export function TrackOrdersCalendarFiltersBar({
  sortByEnum,
  orderStatus,
  stylistId,
  searchTerm,
  orderCount,
  loading,
  onSortByChange,
  onOrderStatusChange,
  onStylistChange,
  onSearchChange,
}: TrackOrdersCalendarFiltersBarProps) {
  const sortId = useId()
  const statusId = useId()
  const { stylists, loading: stylistsLoading } = useAllStylists()
  const [draft, setDraft] = useState(searchTerm)

  useEffect(() => {
    setDraft(searchTerm)
  }, [searchTerm])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchChange(draft.trim())
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
              placeholder="Search orders…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-9 shrink-0"
          disabled={loading}
        >
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <select
          id={sortId}
          className={cn(selectClass, "min-w-[9rem]")}
          value={sortByEnum}
          disabled={loading}
          onChange={(e) =>
            onSortByChange(e.target.value as TrackOrdersSortBy)
          }
        >
          {TRACK_ORDERS_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          id={statusId}
          className={cn(selectClass, "min-w-[10rem]")}
          value={orderStatus}
          disabled={loading}
          onChange={(e) => onOrderStatusChange(e.target.value)}
        >
          {TRACK_ORDERS_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Status: {opt.label}
            </option>
          ))}
        </select>

        <div className="w-[13rem] [&_label]:sr-only">
          <StylistSearchSelect
            label="Stylist"
            stylists={stylists}
            value={stylistId}
            onChange={onStylistChange}
            loading={stylistsLoading}
            disabled={loading}
          />
        </div>

        <p className="text-muted-foreground ml-auto text-sm">
          Showing <span className="text-foreground font-medium">{orderCount}</span>{" "}
          orders
        </p>
      </div>
    </div>
  )
}
