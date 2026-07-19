"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { TrackOrdersCalendarFiltersBar } from "@/components/track-orders/calendar-filters-bar"
import { OrderEventSheet } from "@/components/track-orders/order-event-sheet"
import { TrackOrdersCalendar } from "@/components/track-orders/track-orders-calendar"
import { Button } from "@/components/ui/button"
import { useTrackOrdersCalendar } from "@/hooks/use-track-orders-calendar"

export function TrackOrdersCalendarPageClient() {
  const calendar = useTrackOrdersCalendar()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetOpenNonce, setSheetOpenNonce] = useState(0)

  const openOrderSheet = (id: string) => {
    setSelectedOrderId(id)
    setSheetOpenNonce((n) => n + 1)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Track Orders Calendar
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View store orders by trial or order date and update status from the
          calendar.
        </p>
      </div>

      <TrackOrdersCalendarFiltersBar
        sortByEnum={calendar.sortByEnum}
        orderStatus={calendar.orderStatus}
        stylistId={calendar.stylistId}
        searchTerm={calendar.searchTerm}
        orderCount={calendar.orderCount}
        loading={calendar.loading}
        onSortByChange={calendar.setSortByEnum}
        onOrderStatusChange={calendar.setOrderStatus}
        onStylistChange={calendar.setStylistId}
        onSearchChange={calendar.setSearchTerm}
      />

      {calendar.error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {calendar.error}
        </p>
      ) : null}

      {calendar.loading && calendar.orderCount === 0 ? (
        <div className="text-muted-foreground flex min-h-[24rem] items-center justify-center gap-2 rounded-lg border text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          Loading calendar…
        </div>
      ) : (
        <TrackOrdersCalendar
          events={calendar.events}
          initialDate={calendar.initialDate}
          onCalDateChange={calendar.setCalDate}
          onEventClick={openOrderSheet}
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

      <OrderEventSheet
        key={`${selectedOrderId ?? "closed"}-${sheetOpenNonce}`}
        open={sheetOpen}
        orderId={selectedOrderId}
        openNonce={sheetOpenNonce}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) setSelectedOrderId(null)
        }}
        onSaved={async (patch) => {
          calendar.applyLocalOrderUpdate(patch)
          await calendar.reload()
        }}
      />
    </div>
  )
}
