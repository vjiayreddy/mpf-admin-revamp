import { CUSTOMER_FILTER_PARAMS } from "@/config/customer-filters"
import {
  endDateFilter,
  startDateFilter,
  type MpfDateFilter,
} from "@/lib/customers/date-filter"
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

  // country_code in legacy stores country name → callingCode. Until country
  // autocomplete lands, accept a numeric calling code in the same URL key.
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

/** Count non-default filters for badge UI (cheap, URL-only). */
export function countActiveCustomerFilters(
  searchParams: URLSearchParams
): number {
  let count = 0
  const p = CUSTOMER_FILTER_PARAMS

  if (searchParams.get(p.searchTerm)) count += 1
  if (searchParams.get(p.customerSrNo)) count += 1
  if (searchParams.get(p.stylist)) count += 1
  if (searchParams.get(p.userStatus)) count += 1
  if (searchParams.get(p.customerType)) count += 1
  if (searchParams.get(p.countryCode)) count += 1
  if (searchParams.get(p.studioIds)) count += 1
  if (searchParams.get(p.secondaryStudioIds)) count += 1

  for (const key of [
    p.startCreatedDate,
    p.endCreatedDate,
    p.startCCDueDate,
    p.endCCDueDate,
    p.startLastUpdatedDate,
    p.endLastUpdatedDate,
  ] as const) {
    if (searchParams.get(key)) count += 1
  }

  if (searchParams.get(p.isClient) === "false") count += 1
  if (
    searchParams.get(p.sortByEnum) &&
    searchParams.get(p.sortByEnum) !== "REGISTERED_DATE"
  ) {
    count += 1
  }

  return count
}
