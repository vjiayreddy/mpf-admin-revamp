"use client"

import { Suspense, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { EmbroideryCalendar } from "@/components/embroidery/embroidery-calendar"
import { EmbroideryCalendarFiltersBar } from "@/components/embroidery/embroidery-calendar-filters-bar"
import { EmbroideryEventSheet } from "@/components/embroidery/embroidery-event-sheet"
import { Button } from "@/components/ui/button"
import { useEmbroideryCalendar } from "@/hooks/use-embroidery-calendar"

function EmbroideryCalendarInner() {
  const calendar = useEmbroideryCalendar()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Embroidery calendar
        </h1>
        <p className="text-muted-foreground text-sm">
          Jobs plotted by emb trial date or order date. Click an event to update
          the emb trial date.
        </p>
      </div>

      <EmbroideryCalendarFiltersBar
        sortByEnum={calendar.sortByEnum}
        stylistId={calendar.stylistId}
        searchTerm={calendar.searchTerm}
        embStatus={calendar.embStatus}
        orderCount={calendar.orderCount}
        loading={calendar.loading}
        stylists={calendar.stylists}
        stylistsLoading={calendar.stylistsLoading}
        activeFilters={calendar.activeFilters}
        onSortByChange={calendar.setSortByEnum}
        onStylistChange={calendar.setStylistId}
        onSearchChange={calendar.setSearchTerm}
        onEmbStatusChange={calendar.setEmbStatus}
        onClearFilter={calendar.clearFilter}
        onClearAllFilters={calendar.clearAllFilters}
      />

      {calendar.error ? (
        <p className="text-destructive text-sm" role="alert">
          {calendar.error}
        </p>
      ) : null}

      {calendar.loading && calendar.orderCount === 0 ? (
        <div className="text-muted-foreground flex min-h-[24rem] items-center justify-center gap-2 rounded-lg border text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          Loading calendar…
        </div>
      ) : (
        <EmbroideryCalendar
          events={calendar.events}
          initialDate={calendar.initialDate}
          onCalDateChange={calendar.setCalDate}
          onEventClick={setSelectedId}
        />
      )}

      {calendar.hasMore && calendar.orderCount > 0 ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={calendar.loading}
            onClick={calendar.loadMore}
          >
            {calendar.loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}

      <EmbroideryEventSheet
        embroideryId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        onSaved={calendar.reload}
      />
    </div>
  )
}

export function EmbroideryCalendarPageClient() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Loading calendar…</p>
      }
    >
      <EmbroideryCalendarInner />
    </Suspense>
  )
}
