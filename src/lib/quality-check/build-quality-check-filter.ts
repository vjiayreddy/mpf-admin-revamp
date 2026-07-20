import {
  MORE_QUALITY_CHECK_FILTER_KEYS,
  QUALITY_CHECK_PAGE_SIZE,
  QUALITY_CHECK_PARAMS,
} from "@/config/quality-check-filters"
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

export type ActiveQualityCheckFilter = {
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

export function buildQualityCheckFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultPersonalStylistId?: string | null
): StoreOrderFilterParams {
  const p = QUALITY_CHECK_PARAMS
  const params: StoreOrderFilterParams = {
    sortByEnum: "TRIAL_DATE",
  }

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) params.searchTerm = searchTerm

  const studioId = searchParams.get(p.studioId)?.trim()
  if (studioId) params.studioIds = [studioId]

  const dateMap: Array<
    [string, keyof StoreOrderFilterParams, "start" | "end"]
  > = [
    [p.startTrialDate, "startTrialDate", "start"],
    [p.endTrialDate, "endTrialDate", "end"],
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

export function buildQualityCheckQueryVars(
  searchParams: URLSearchParams,
  page0Based: number,
  defaultPersonalStylistId?: string | null,
  limit = QUALITY_CHECK_PAGE_SIZE
): GetAllStoreOrdersVars {
  return {
    params: buildQualityCheckFilterFromSearchParams(
      searchParams,
      defaultPersonalStylistId
    ),
    page: page0Based + 1,
    limit,
  }
}

export function listActiveQualityCheckFilters(
  searchParams: URLSearchParams,
  stylistNameById: Map<string, string>,
  studioNameById: Map<string, string>
): ActiveQualityCheckFilter[] {
  const p = QUALITY_CHECK_PARAMS
  const out: ActiveQualityCheckFilter[] = []

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) {
    out.push({
      id: p.searchTerm,
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
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

  const dateLabels: Array<[string, string]> = [
    [p.startTrialDate, "Trial from"],
    [p.endTrialDate, "Trial to"],
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

export function getClearAllQualityCheckFilterUpdates(): Record<
  string,
  null
> {
  const updates: Record<string, null> = {
    [QUALITY_CHECK_PARAMS.searchTerm]: null,
    [QUALITY_CHECK_PARAMS.studioId]: null,
    [QUALITY_CHECK_PARAMS.stylistId]: null,
  }
  for (const key of MORE_QUALITY_CHECK_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}

export function countAdvancedQualityCheckFilters(
  searchParams: URLSearchParams
): number {
  return MORE_QUALITY_CHECK_FILTER_KEYS.filter((key) =>
    Boolean(searchParams.get(key)?.trim())
  ).length
}
