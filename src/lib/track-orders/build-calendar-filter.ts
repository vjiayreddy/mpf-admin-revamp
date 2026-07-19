import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT_BY,
  TRACK_ORDERS_CALENDAR_PARAMS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-calendar-filters"
import {
  endDateFilter,
  startDateFilter,
} from "@/lib/customers/date-filter"
import type {
  GetAllStoreOrdersVars,
  StoreOrderFilterParams,
} from "@/lib/apollo/queries/store-orders"
import { STORE_ORDERS_PAGE_LIMIT } from "@/lib/apollo/queries/store-orders"

function startOfMonthIso(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
}

function endOfMonthIso(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ).toISOString()
}

export function resolveCalendarMonth(searchParams: URLSearchParams): Date {
  const raw = searchParams.get(TRACK_ORDERS_CALENDAR_PARAMS.calDate)
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
}

export function buildCalendarQueryVars(
  searchParams: URLSearchParams,
  page: number,
  defaultPersonalStylistId?: string | null
): GetAllStoreOrdersVars {
  const p = TRACK_ORDERS_CALENDAR_PARAMS
  const sortRaw = searchParams.get(p.sortByEnum)
  const sortByEnum: TrackOrdersSortBy =
    sortRaw === "ORDER_DATE" ? "ORDER_DATE" : DEFAULT_SORT_BY

  const statusRaw = searchParams.get(p.orderStatus)
  let orderStatus: string | null = DEFAULT_ORDER_STATUS
  if (statusRaw === "ALL") orderStatus = null
  else if (statusRaw) orderStatus = statusRaw

  const month = resolveCalendarMonth(searchParams)
  const startIso = startOfMonthIso(month)
  const endIso = endOfMonthIso(month)

  const params: StoreOrderFilterParams = {
    sortByEnum,
  }

  if (orderStatus) params.orderStatus = orderStatus

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) params.searchTerm = searchTerm

  if (sortByEnum === "ORDER_DATE") {
    params.startOrderDate = startDateFilter(startIso)
    params.endOrderDate = endDateFilter(endIso)
  } else {
    params.startTrialDate = startDateFilter(startIso)
    params.endTrialDate = endDateFilter(endIso)
  }

  const stylistId = searchParams.get(p.stylistId)
  if (stylistId) {
    params.personalStylistId = stylistId
  } else if (defaultPersonalStylistId) {
    params.roleFilter = {
      _id: defaultPersonalStylistId,
      roleIdentifier: "personal_stylist",
    }
  }

  return {
    page,
    limit: STORE_ORDERS_PAGE_LIMIT,
    params,
  }
}
