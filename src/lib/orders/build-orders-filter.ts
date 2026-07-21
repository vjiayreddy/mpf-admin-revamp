import {
  MORE_ORDERS_FILTER_KEYS,
  ORDERS_PAGE_SIZE,
  ORDERS_PARAMS,
  ORDER_STATUS_FILTER_OPTIONS,
} from "@/config/orders-filters"
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

export type ActiveOrdersFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function readDateParam(searchParams: URLSearchParams, key: string) {
  const raw = searchParams.get(key)
  if (!raw) return null
  return raw.includes("T") ? raw : dateInputToIso(raw)
}

export function buildOrdersFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultPersonalStylistId?: string | null
): StoreOrderFilterParams {
  const p = ORDERS_PARAMS
  const params: StoreOrderFilterParams = {
    sortByEnum: "ORDER_DATE",
  }

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) params.searchTerm = searchTerm

  const orderStatus = searchParams.get(p.orderStatus)?.trim()
  if (orderStatus && orderStatus !== "ALL") {
    params.orderStatus = orderStatus
  }

  const studioId = searchParams.get(p.studioId)?.trim()
  if (studioId) params.studioIds = [studioId]

  const emb = searchParams.get(p.hasEmbroidary)?.trim()
  if (emb === "true") params.hasEmbroidary = true
  if (emb === "false") params.hasEmbroidary = false

  const dateMap: Array<
    [string, keyof StoreOrderFilterParams, "start" | "end"]
  > = [
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
    params[paramKey] = (
      kind === "start" ? startDateFilter(iso) : endDateFilter(iso)
    ) as never
  }

  const stylistId = searchParams.get(p.stylistId)?.trim()
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

export function buildOrdersQueryVars(
  searchParams: URLSearchParams,
  page0Based: number,
  defaultPersonalStylistId?: string | null,
  limit = ORDERS_PAGE_SIZE
): GetAllStoreOrdersVars {
  return {
    params: buildOrdersFilterFromSearchParams(
      searchParams,
      defaultPersonalStylistId
    ),
    page: page0Based + 1,
    limit,
  }
}

export function listActiveOrdersFilters(
  searchParams: URLSearchParams,
  stylistNameById: Map<string, string>,
  studioNameById: Map<string, string>
): ActiveOrdersFilter[] {
  const p = ORDERS_PARAMS
  const out: ActiveOrdersFilter[] = []

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) {
    out.push({
      id: p.searchTerm,
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const orderStatus = searchParams.get(p.orderStatus)?.trim()
  if (orderStatus && orderStatus !== "ALL") {
    out.push({
      id: p.orderStatus,
      label: "Status",
      displayValue:
        ORDER_STATUS_FILTER_OPTIONS.find((o) => o.value === orderStatus)
          ?.label || orderStatus,
      clear: { [p.orderStatus]: null },
    })
  }

  const stylistId = searchParams.get(p.stylistId)?.trim()
  if (stylistId) {
    out.push({
      id: p.stylistId,
      label: "Stylist",
      displayValue: stylistNameById.get(stylistId) || stylistId,
      clear: { [p.stylistId]: null },
    })
  }

  const studioId = searchParams.get(p.studioId)?.trim()
  if (studioId) {
    out.push({
      id: p.studioId,
      label: "Studio",
      displayValue: studioNameById.get(studioId) || studioId,
      clear: { [p.studioId]: null },
    })
  }

  const emb = searchParams.get(p.hasEmbroidary)?.trim()
  if (emb === "true" || emb === "false") {
    out.push({
      id: p.hasEmbroidary,
      label: "Embroidery",
      displayValue: emb === "true" ? "Yes" : "No",
      clear: { [p.hasEmbroidary]: null },
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
    out.push({
      id: key,
      label,
      displayValue: isoToDateInput(raw) || raw.slice(0, 10),
      clear: { [key]: null },
    })
  }

  return out
}

export function getClearAllOrdersFilterUpdates(): Record<string, null> {
  const updates: Record<string, null> = {
    [ORDERS_PARAMS.searchTerm]: null,
    [ORDERS_PARAMS.orderStatus]: null,
    [ORDERS_PARAMS.studioId]: null,
    [ORDERS_PARAMS.stylistId]: null,
  }
  for (const key of MORE_ORDERS_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}

export function countAdvancedOrdersFilters(
  searchParams: URLSearchParams
): number {
  return MORE_ORDERS_FILTER_KEYS.filter((key) =>
    Boolean(searchParams.get(key)?.trim())
  ).length
}
