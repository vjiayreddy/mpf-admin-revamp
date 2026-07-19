import type { EventInput } from "@fullcalendar/core"

import type { TrackOrdersSortBy } from "@/config/track-orders-calendar-filters"
import type { StoreOrderCalendarRow } from "@/lib/apollo/queries/store-orders"
import { getStylistColorCode } from "@/lib/track-orders/stylist-colors"

export type TrackOrderCalendarEvent = EventInput & {
  extendedProps: {
    stylist?: string | null
    orderNo?: string | number | null
    orderStatus?: string | null
    remark?: string | null
    chipColor: string
  }
}

export function mapStoreOrdersToCalendarEvents(
  orders: StoreOrderCalendarRow[],
  sortByEnum: TrackOrdersSortBy
): TrackOrderCalendarEvent[] {
  const events: TrackOrderCalendarEvent[] = []

  for (const order of orders) {
    const ts =
      sortByEnum === "ORDER_DATE"
        ? order.orderDate?.timestamp
        : order.trialDate?.timestamp
    if (!ts) continue

    const stylist = order.stylist?.[0]
    const chipColor = getStylistColorCode(stylist?._id)
    const first = order.customerFirstName?.trim() ?? ""
    const last = order.customerLastName?.trim() ?? ""
    const title = `${first} ${last}`.trim() || "Order"

    events.push({
      id: order._id,
      // Include status in title so list view updates are obvious after save.
      title: `${title}${order.orderStatus ? ` (${order.orderStatus})` : ""}`,
      start: ts,
      end: ts,
      allDay: false,
      backgroundColor: "transparent",
      borderColor: "transparent",
      extendedProps: {
        stylist: stylist?.name ?? null,
        orderNo: order.orderNo ?? null,
        orderStatus: order.orderStatus ?? null,
        remark: order.remark ?? null,
        chipColor,
      },
    })
  }

  return events
}

export function isClosedOrderStatus(status?: string | null) {
  return status === "CLOSED" || status === "DELIVERED"
}
