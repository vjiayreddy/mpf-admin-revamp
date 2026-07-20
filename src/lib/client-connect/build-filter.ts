import {
  CC_TYPE_OPTIONS,
  CLIENT_CONNECT_FILTER_PARAMS,
  CLIENT_CONNECT_MORE_FILTER_KEYS,
  DEFAULT_CC_TYPE,
} from "@/config/client-connect-filters"
import {
  buildUsersFilterFromSearchParams,
  countAdvancedCustomerFilters,
  getClearAllCustomerFilterUpdates,
  listActiveCustomerFilters,
  type ActiveCustomerFilter,
} from "@/lib/customers/build-users-filter"
import type { UserFilterInput } from "@/lib/apollo/queries/users"

export function getCcTypeFromSearchParams(searchParams: URLSearchParams) {
  return (
    searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.ccType)?.trim() ||
    DEFAULT_CC_TYPE
  )
}

export function getStudioIdFromSearchParams(searchParams: URLSearchParams) {
  return searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.studioId)?.trim() || ""
}

export function buildClientConnectFilterFromSearchParams(
  searchParams: URLSearchParams,
  sessionRoleFilter: unknown[]
): UserFilterInput {
  return buildUsersFilterFromSearchParams(searchParams, sessionRoleFilter)
}

export function listActiveClientConnectFilters(
  searchParams: URLSearchParams,
  opts: { studioNameById: Map<string, string> }
): ActiveCustomerFilter[] {
  const base = listActiveCustomerFilters(searchParams, opts)
  const ccType = searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.ccType)
  const studioId = searchParams.get(CLIENT_CONNECT_FILTER_PARAMS.studioId)

  const extra: ActiveCustomerFilter[] = []
  if (ccType && ccType !== DEFAULT_CC_TYPE) {
    const label =
      CC_TYPE_OPTIONS.find((o) => o.value === ccType)?.label ||
      ccType.replace(/_/g, " ")
    extra.push({
      id: CLIENT_CONNECT_FILTER_PARAMS.ccType,
      label: "Connect type",
      displayValue: label,
      clear: { [CLIENT_CONNECT_FILTER_PARAMS.ccType]: null },
    })
  }
  if (studioId) {
    extra.push({
      id: CLIENT_CONNECT_FILTER_PARAMS.studioId,
      label: "Studio id",
      displayValue: opts.studioNameById.get(studioId) || studioId,
      clear: { [CLIENT_CONNECT_FILTER_PARAMS.studioId]: null },
    })
  }
  return [...extra, ...base]
}

export function countAdvancedClientConnectFilters(
  searchParams: URLSearchParams
) {
  return countAdvancedCustomerFilters(searchParams)
}

export function getClearAllClientConnectFilterUpdates(): Record<string, null> {
  return {
    ...getClearAllCustomerFilterUpdates(),
    [CLIENT_CONNECT_FILTER_PARAMS.ccType]: null,
    [CLIENT_CONNECT_FILTER_PARAMS.studioId]: null,
  }
}

export { CLIENT_CONNECT_MORE_FILTER_KEYS }
