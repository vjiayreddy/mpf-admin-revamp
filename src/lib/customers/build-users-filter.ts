import {
  CUSTOMER_FILTER_PARAMS,
  CUSTOMER_TYPE_OPTIONS,
  MORE_FILTER_KEYS,
  SORT_BY_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/config/customer-filters"
import {
  endDateFilter,
  startDateFilter,
  type MpfDateFilter,
} from "@/lib/customers/date-filter"
import { labelForCallingCode } from "@/lib/customers/country-calling-codes"
import type { UserFilterInput } from "@/lib/apollo/queries/users"

function splitCsv(value: string | null): string[] | undefined {
  if (!value) return undefined
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

function parseStylistRoleFilter(raw: string | null): unknown[] | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined
  } catch {
    return undefined
  }
}

function optionalStart(iso: string | null): MpfDateFilter | undefined {
  return iso ? startDateFilter(iso) : undefined
}

function optionalEnd(iso: string | null): MpfDateFilter | undefined {
  return iso ? endDateFilter(iso) : undefined
}

/**
 * Pure builder: URL search params → GraphQL UserFilter.
 * Keeps list fetches cheap to reason about and avoids re-parsing in UI.
 */
export function buildUsersFilterFromSearchParams(
  searchParams: URLSearchParams,
  sessionRoleFilter: unknown[]
): UserFilterInput {
  const searchType =
    searchParams.get(CUSTOMER_FILTER_PARAMS.searchType) || "default"
  const isClientParam = searchParams.get(CUSTOMER_FILTER_PARAMS.isClient)
  const isClient = isClientParam === null ? true : isClientParam === "true"

  const stylistFilter = parseStylistRoleFilter(
    searchParams.get(CUSTOMER_FILTER_PARAMS.stylist)
  )
  const roleFilter =
    stylistFilter && stylistFilter.length > 0
      ? stylistFilter
      : sessionRoleFilter.length > 0
        ? sessionRoleFilter
        : undefined

  const searchTerm = searchParams.get(CUSTOMER_FILTER_PARAMS.searchTerm)
  const customerSrNoRaw = searchParams.get(CUSTOMER_FILTER_PARAMS.customerSrNo)
  const customerSrNo =
    searchType === "cusId" && customerSrNoRaw
      ? Number(customerSrNoRaw)
      : undefined

  const filter: UserFilterInput = {
    isClient,
    roleFilter,
    sortByEnum:
      searchParams.get(CUSTOMER_FILTER_PARAMS.sortByEnum) || "REGISTERED_DATE",
  }

  if (searchType !== "cusId" && searchTerm) {
    filter.searchTerm = searchTerm
  }
  if (customerSrNo !== undefined && Number.isFinite(customerSrNo)) {
    filter.customerSrNo = customerSrNo
  }

  const userStatus = searchParams.get(CUSTOMER_FILTER_PARAMS.userStatus)
  if (userStatus) filter.userStatus = userStatus

  const customerType = searchParams.get(CUSTOMER_FILTER_PARAMS.customerType)
  if (customerType) filter.customerType = customerType

  const studioIds = splitCsv(searchParams.get(CUSTOMER_FILTER_PARAMS.studioIds))
  if (studioIds) filter.studioIds = studioIds

  const secondaryStudioIds = splitCsv(
    searchParams.get(CUSTOMER_FILTER_PARAMS.secondaryStudioIds)
  )
  if (secondaryStudioIds) filter.secondaryStudioIds = secondaryStudioIds

  // URL stores dialing digits (e.g. "91"); More Filters uses country dropdown.
  const countryCode = searchParams.get(CUSTOMER_FILTER_PARAMS.countryCode)
  if (countryCode && /^\d+$/.test(countryCode)) {
    filter.countryCode = countryCode
  }

  const startCreated = optionalStart(
    searchParams.get(CUSTOMER_FILTER_PARAMS.startCreatedDate)
  )
  if (startCreated) filter.startCreatedDate = startCreated
  const endCreated = optionalEnd(
    searchParams.get(CUSTOMER_FILTER_PARAMS.endCreatedDate)
  )
  if (endCreated) filter.endCreatedDate = endCreated

  const startCc = optionalStart(
    searchParams.get(CUSTOMER_FILTER_PARAMS.startCCDueDate)
  )
  if (startCc) filter.startCCDueDate = startCc
  const endCc = optionalEnd(
    searchParams.get(CUSTOMER_FILTER_PARAMS.endCCDueDate)
  )
  if (endCc) filter.endCCDueDate = endCc

  const startUpdated = optionalStart(
    searchParams.get(CUSTOMER_FILTER_PARAMS.startLastUpdatedDate)
  )
  if (startUpdated) filter.startLastUpdatedDate = startUpdated
  const endUpdated = optionalEnd(
    searchParams.get(CUSTOMER_FILTER_PARAMS.endLastUpdatedDate)
  )
  if (endUpdated) filter.endLastUpdatedDate = endUpdated

  return filter
}

export type ActiveCustomerFilter = {
  id: string
  label: string
  displayValue: string
  /** URL keys to null out when this chip is removed */
  clear: Record<string, null>
}

function formatChipDate(iso: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateRange(
  startIso: string | null,
  endIso: string | null
): string {
  return `${formatChipDate(startIso)} → ${formatChipDate(endIso)}`
}

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function pushDateRangeChip(
  chips: ActiveCustomerFilter[],
  id: string,
  label: string,
  startKey: string,
  endKey: string,
  searchParams: URLSearchParams
) {
  const start = searchParams.get(startKey)
  const end = searchParams.get(endKey)
  if (!start && !end) return
  chips.push({
    id,
    label,
    displayValue: formatDateRange(start, end),
    clear: { [startKey]: null, [endKey]: null },
  })
}

/**
 * Human-readable active filters for chips UI.
 * One chip per logical filter (date ranges share a chip).
 */
export function listActiveCustomerFilters(
  searchParams: URLSearchParams,
  options?: {
    studioNameById?: Map<string, string>
  }
): ActiveCustomerFilter[] {
  const p = CUSTOMER_FILTER_PARAMS
  const chips: ActiveCustomerFilter[] = []
  const studioNameById = options?.studioNameById

  const resolveStudioNames = (csv: string) => {
    const ids = csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (ids.length === 0) return csv
    const names = ids.map((id) => studioNameById?.get(id) ?? id)
    if (names.length <= 2) return names.join(", ")
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`
  }

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) {
    chips.push({
      id: "searchTerm",
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const customerSrNo = searchParams.get(p.customerSrNo)
  if (customerSrNo) {
    chips.push({
      id: "customerSrNo",
      label: "Customer ID",
      displayValue: customerSrNo,
      clear: { [p.customerSrNo]: null },
    })
  }

  if (searchParams.get(p.stylist)) {
    chips.push({
      id: "stylist",
      label: "Stylist",
      displayValue: "Selected stylist",
      clear: { [p.stylist]: null },
    })
  }

  if (searchParams.get(p.isClient) === "false") {
    chips.push({
      id: "isClient",
      label: "Audience",
      displayValue: "Non client",
      clear: { [p.isClient]: null },
    })
  }

  const sortBy = searchParams.get(p.sortByEnum)
  if (sortBy && sortBy !== "REGISTERED_DATE") {
    chips.push({
      id: "sortByEnum",
      label: "Sort",
      displayValue: optionLabel(SORT_BY_OPTIONS, sortBy),
      clear: { [p.sortByEnum]: null },
    })
  }

  const userStatus = searchParams.get(p.userStatus)
  if (userStatus) {
    chips.push({
      id: "userStatus",
      label: "Status",
      displayValue: optionLabel(USER_STATUS_OPTIONS, userStatus),
      clear: { [p.userStatus]: null },
    })
  }

  const customerType = searchParams.get(p.customerType)
  if (customerType) {
    chips.push({
      id: "customerType",
      label: "Type",
      displayValue: optionLabel(CUSTOMER_TYPE_OPTIONS, customerType),
      clear: { [p.customerType]: null },
    })
  }

  const countryCode = searchParams.get(p.countryCode)
  if (countryCode) {
    chips.push({
      id: "countryCode",
      label: "Country",
      displayValue: labelForCallingCode(countryCode),
      clear: { [p.countryCode]: null },
    })
  }

  const studioIds = searchParams.get(p.studioIds)
  if (studioIds) {
    chips.push({
      id: "studioIds",
      label: "Primary studios",
      displayValue: resolveStudioNames(studioIds),
      clear: { [p.studioIds]: null },
    })
  }

  const secondaryStudioIds = searchParams.get(p.secondaryStudioIds)
  if (secondaryStudioIds) {
    chips.push({
      id: "secondaryStudioIds",
      label: "Secondary studios",
      displayValue: resolveStudioNames(secondaryStudioIds),
      clear: { [p.secondaryStudioIds]: null },
    })
  }

  pushDateRangeChip(
    chips,
    "registeredDate",
    "Registered",
    p.startCreatedDate,
    p.endCreatedDate,
    searchParams
  )
  pushDateRangeChip(
    chips,
    "ccDueDate",
    "CC due",
    p.startCCDueDate,
    p.endCCDueDate,
    searchParams
  )
  pushDateRangeChip(
    chips,
    "lastUpdatedDate",
    "Last updated",
    p.startLastUpdatedDate,
    p.endLastUpdatedDate,
    searchParams
  )

  return chips
}

/** Count non-default filters for badge / summary UI. */
export function countActiveCustomerFilters(
  searchParams: URLSearchParams
): number {
  return listActiveCustomerFilters(searchParams).length
}

/** Advanced (More Filters sheet) count — for the More filters badge. */
export function countAdvancedCustomerFilters(
  searchParams: URLSearchParams
): number {
  const p = CUSTOMER_FILTER_PARAMS
  let count = 0
  for (const key of [
    p.customerType,
    p.userStatus,
    p.countryCode,
    p.studioIds,
    p.secondaryStudioIds,
  ] as const) {
    if (searchParams.get(key)) count += 1
  }
  const pairs: Array<[string, string]> = [
    [p.startCreatedDate, p.endCreatedDate],
    [p.startCCDueDate, p.endCCDueDate],
    [p.startLastUpdatedDate, p.endLastUpdatedDate],
  ]
  for (const [start, end] of pairs) {
    if (searchParams.get(start) || searchParams.get(end)) count += 1
  }
  return count
}

/** All clearable filter URL keys (preserves page). */
export function getClearAllCustomerFilterUpdates(): Record<string, null> {
  const updates: Record<string, null> = {
    [CUSTOMER_FILTER_PARAMS.searchTerm]: null,
    [CUSTOMER_FILTER_PARAMS.customerSrNo]: null,
    [CUSTOMER_FILTER_PARAMS.searchType]: null,
    [CUSTOMER_FILTER_PARAMS.stylist]: null,
    [CUSTOMER_FILTER_PARAMS.isClient]: null,
    [CUSTOMER_FILTER_PARAMS.sortByEnum]: null,
  }
  for (const key of MORE_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}
