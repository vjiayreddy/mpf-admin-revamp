import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT_BY,
  MORE_TRACK_ORDERS_LIST_FILTER_KEYS,
  TRACK_ORDERS_LIST_PARAMS,
  TRACK_ORDERS_STATUS_OPTIONS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-list-filters"
import {
  dateInputToIso,
  endDateFilter,
  isoToDateInput,
  startDateFilter,
} from "@/lib/customers/date-filter"
import type {
  GetAllStoreOrdersVars,
  StoreOrderFilterParams,
} from "@/lib/apollo/queries/store-orders"
import { TRACK_ORDERS_LIST_PAGE_LIMIT } from "@/lib/apollo/queries/store-orders"

export type ActiveTrackOrdersListFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function splitCsv(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function readDateParam(searchParams: URLSearchParams, key: string) {
  const raw = searchParams.get(key)
  if (!raw) return null
  return raw.includes("T") ? raw : dateInputToIso(raw)
}

export function buildTrackOrdersListFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultPersonalStylistId?: string | null
): StoreOrderFilterParams {
  const p = TRACK_ORDERS_LIST_PARAMS
  const sortRaw = searchParams.get(p.sortByEnum)
  const sortByEnum: TrackOrdersSortBy =
    sortRaw === "ORDER_DATE" ? "ORDER_DATE" : DEFAULT_SORT_BY

  const statusRaw = searchParams.get(p.orderStatus)
  let orderStatus: string | null = DEFAULT_ORDER_STATUS
  if (statusRaw === "ALL") orderStatus = null
  else if (statusRaw) orderStatus = statusRaw

  const params: StoreOrderFilterParams = { sortByEnum }

  if (orderStatus) params.orderStatus = orderStatus

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) params.searchTerm = searchTerm

  const measurement = searchParams.get(p.measurementApprovalStatus)
  if (measurement) params.measurementApprovalStatus = measurement

  const studioIds = splitCsv(searchParams.get(p.studioIds))
  if (studioIds.length) params.studioIds = studioIds

  const outfitStatus = splitCsv(searchParams.get(p.outfitStatus))
  if (outfitStatus.length) params.outfitStatus = outfitStatus

  const emb = searchParams.get(p.hasEmbroidary)
  if (emb === "true") params.hasEmbroidary = true
  if (emb === "false") params.hasEmbroidary = false

  const dateMap: Array<[string, keyof StoreOrderFilterParams, "start" | "end"]> =
    [
      [p.startOrderDate, "startOrderDate", "start"],
      [p.endOrderDate, "endOrderDate", "end"],
      [p.startTrialDate, "startTrialDate", "start"],
      [p.endTrialDate, "endTrialDate", "end"],
      [p.startEventDate, "startEventDate", "start"],
      [p.endEventDate, "endEventDate", "end"],
      [p.startReadyDate, "startReadyDate", "start"],
      [p.endReadyDate, "endReadyDate", "end"],
      [p.startDeliveryDate, "startDeliveryDate", "start"],
      [p.endDeliveryDate, "endDeliveryDate", "end"],
    ]

  for (const [urlKey, paramKey, kind] of dateMap) {
    const iso = readDateParam(searchParams, urlKey)
    if (!iso) continue
    // Note: legacy TrackOrderList duplicated startDeliveryDate for the end
    // bound — we map each URL key once to the matching GraphQL param.
    params[paramKey] = (
      kind === "start" ? startDateFilter(iso) : endDateFilter(iso)
    ) as never
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

  return params
}

export function buildTrackOrdersListQueryVars(
  searchParams: URLSearchParams,
  page0Based: number,
  defaultPersonalStylistId?: string | null,
  limit = TRACK_ORDERS_LIST_PAGE_LIMIT
): GetAllStoreOrdersVars {
  return {
    params: buildTrackOrdersListFilterFromSearchParams(
      searchParams,
      defaultPersonalStylistId
    ),
    page: page0Based + 1,
    limit,
  }
}

export function countAdvancedTrackOrdersListFilters(
  searchParams: URLSearchParams
): number {
  let count = 0
  for (const key of MORE_TRACK_ORDERS_LIST_FILTER_KEYS) {
    const value = searchParams.get(key)
    if (value != null && value !== "") count += 1
  }
  return count
}

export function listActiveTrackOrdersListFilters(
  searchParams: URLSearchParams,
  opts: {
    stylistNameById: Map<string, string>
    studioNameById: Map<string, string>
  }
): ActiveTrackOrdersListFilter[] {
  const p = TRACK_ORDERS_LIST_PARAMS
  const filters: ActiveTrackOrdersListFilter[] = []

  const search = searchParams.get(p.searchTerm)?.trim()
  if (search) {
    filters.push({
      id: "search",
      label: "Search",
      displayValue: search,
      clear: { [p.searchTerm]: null },
    })
  }

  const status = searchParams.get(p.orderStatus)
  if (status && status !== DEFAULT_ORDER_STATUS) {
    filters.push({
      id: "status",
      label: "Status",
      displayValue:
        TRACK_ORDERS_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
        status,
      clear: { [p.orderStatus]: null },
    })
  }

  const sort = searchParams.get(p.sortByEnum)
  if (sort && sort !== DEFAULT_SORT_BY) {
    filters.push({
      id: "sort",
      label: "Sort",
      displayValue: sort === "ORDER_DATE" ? "Order date" : "Trial date",
      clear: { [p.sortByEnum]: null },
    })
  }

  const stylistId = searchParams.get(p.stylistId)
  if (stylistId) {
    filters.push({
      id: "stylist",
      label: "Stylist",
      displayValue: opts.stylistNameById.get(stylistId) ?? stylistId,
      clear: { [p.stylistId]: null },
    })
  }

  const measurement = searchParams.get(p.measurementApprovalStatus)
  if (measurement) {
    filters.push({
      id: "measurement",
      label: "Measurement",
      displayValue: measurement,
      clear: { [p.measurementApprovalStatus]: null },
    })
  }

  const emb = searchParams.get(p.hasEmbroidary)
  if (emb === "true" || emb === "false") {
    filters.push({
      id: "emb",
      label: "Embroidery",
      displayValue: emb === "true" ? "Yes" : "No",
      clear: { [p.hasEmbroidary]: null },
    })
  }

  const outfit = splitCsv(searchParams.get(p.outfitStatus))
  if (outfit.length) {
    filters.push({
      id: "outfit",
      label: "Outfit",
      displayValue: outfit.join(", "),
      clear: { [p.outfitStatus]: null },
    })
  }

  const studios = splitCsv(searchParams.get(p.studioIds))
  if (studios.length) {
    filters.push({
      id: "studios",
      label: "Studios",
      displayValue: studios
        .map((id) => opts.studioNameById.get(id) ?? id)
        .join(", "),
      clear: { [p.studioIds]: null },
    })
  }

  const dateLabels: Array<[string, string]> = [
    [p.startOrderDate, "Order from"],
    [p.endOrderDate, "Order to"],
    [p.startTrialDate, "Trial from"],
    [p.endTrialDate, "Trial to"],
    [p.startEventDate, "Event from"],
    [p.endEventDate, "Event to"],
    [p.startReadyDate, "Ready from"],
    [p.endReadyDate, "Ready to"],
    [p.startDeliveryDate, "Delivery from"],
    [p.endDeliveryDate, "Delivery to"],
  ]
  for (const [key, label] of dateLabels) {
    const raw = searchParams.get(key)
    if (!raw) continue
    filters.push({
      id: key,
      label,
      displayValue: isoToDateInput(raw),
      clear: { [key]: null },
    })
  }

  return filters
}

export function getClearMoreTrackOrdersListFilterUpdates(): Record<
  string,
  null
> {
  const updates: Record<string, null> = {}
  for (const key of MORE_TRACK_ORDERS_LIST_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}

export function getClearAllTrackOrdersListFilterUpdates(): Record<
  string,
  string | null
> {
  const p = TRACK_ORDERS_LIST_PARAMS
  return {
    ...getClearMoreTrackOrdersListFilterUpdates(),
    [p.searchTerm]: null,
    [p.sortByEnum]: null,
    [p.orderStatus]: null,
    [p.stylistId]: null,
    [p.measurementApprovalStatus]: null,
    [p.page]: "0",
  }
}
