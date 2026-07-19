"use client"

import { useCallback, useMemo, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core"

import type { TrackOrderCalendarEvent } from "@/lib/track-orders/map-calendar-events"
import { isClosedOrderStatus } from "@/lib/track-orders/map-calendar-events"
import { cn } from "@/lib/utils"

type TrackOrdersCalendarProps = {
  events: TrackOrderCalendarEvent[]
  initialDate: Date
  onCalDateChange: (iso: string) => void
  onEventClick: (orderId: string) => void
  className?: string
}

function EventChip({ arg }: { arg: EventContentArg }) {
  const props = arg.event.extendedProps as TrackOrderCalendarEvent["extendedProps"]
  const color = props.chipColor || "#CAD3C8"
  const closed = isClosedOrderStatus(props.orderStatus)
  const label = `${arg.event.title}${
    props.orderNo != null ? ` - ${props.orderNo}` : ""
  }`

  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight",
        closed && "line-through opacity-70"
      )}
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
      title={label}
    >
      {label}
    </span>
  )
}

export function TrackOrdersCalendar({
  events,
  initialDate,
  onCalDateChange,
  onEventClick,
  className,
}: TrackOrdersCalendarProps) {
  const lastMonthKey = useRef<string | null>(null)

  const plugins = useMemo(
    () => [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    []
  )

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const start = arg.view.currentStart
      const monthKey = `${start.getFullYear()}-${start.getMonth()}`
      if (lastMonthKey.current === monthKey) return
      lastMonthKey.current = monthKey
      // Defer URL updates — FullCalendar may call this under flushSync.
      const iso = start.toISOString()
      queueMicrotask(() => {
        onCalDateChange(iso)
      })
    },
    [onCalDateChange]
  )

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      arg.jsEvent.preventDefault()
      const id = arg.event.id
      if (id) onEventClick(id)
    },
    [onEventClick]
  )

  return (
    <div
      className={cn(
        "mpf-track-orders-calendar bg-card overflow-hidden rounded-lg border p-3",
        className
      )}
    >
      <FullCalendar
        plugins={plugins}
        initialView="listMonth"
        initialDate={initialDate}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "listMonth,dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
        events={events}
        editable={false}
        selectable={false}
        dayMaxEvents={2}
        navLinks
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        eventContent={(arg) => <EventChip arg={arg} />}
      />
    </div>
  )
}
