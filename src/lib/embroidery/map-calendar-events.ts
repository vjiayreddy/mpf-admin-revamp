import type { EventInput } from "@fullcalendar/core"

import type { EmbroiderySortBy } from "@/config/embroidery-filters"
import type { EmbroideryListRow } from "@/lib/apollo/queries/embroidery"
import { getStylistColorCode } from "@/lib/track-orders/stylist-colors"

export type EmbroideryCalendarEvent = EventInput & {
  extendedProps: {
    embroideryReqNo?: string | null
    productNo?: string | null
    embStatus?: string | null
    chipColor: string
  }
}

export function mapEmbroideryToCalendarEvents(
  rows: EmbroideryListRow[],
  sortByEnum: EmbroiderySortBy
): EmbroideryCalendarEvent[] {
  const events: EmbroideryCalendarEvent[] = []

  for (const row of rows) {
    const ts =
      sortByEnum === "ORDER_DATE"
        ? row.orderDate?.timestamp
        : row.embTrialDate?.timestamp ||
          row.trialDate?.timestamp ||
          row.orderItemAttributes?.trialDate?.timestamp
    if (!ts) continue

    const title =
      row.customerName?.trim() ||
      row.storeOrderProductNumber ||
      row.embroideryReqNo ||
      "Embroidery"

    events.push({
      id: row._id,
      title: `${title}${row.embStatus ? ` (${row.embStatus})` : ""}`,
      start: ts,
      end: ts,
      allDay: true,
      backgroundColor: "transparent",
      borderColor: "transparent",
      extendedProps: {
        embroideryReqNo: row.embroideryReqNo ?? null,
        productNo: row.storeOrderProductNumber ?? null,
        embStatus: row.embStatus ?? null,
        chipColor: getStylistColorCode(row.stylistId),
      },
    })
  }

  return events
}
