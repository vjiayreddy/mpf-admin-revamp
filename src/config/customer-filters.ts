/** URL + GraphQL filter keys for the customers list (legacy parity). */

export const CUSTOMER_FILTER_PARAMS = {
  page: "page",
  searchType: "searchType",
  isClient: "isClient",
  searchTerm: "searchTerm",
  customerSrNo: "customerSrNo",
  sortByEnum: "sortByEnum",
  stylist: "stylist",
  userStatus: "userStatus",
  customerType: "customerType",
  countryCode: "country_code",
  studioIds: "studioIds",
  secondaryStudioIds: "secondaryStudioIds",
  startCreatedDate: "startCreatedDate",
  endCreatedDate: "endCreatedDate",
  startCCDueDate: "startCCDueDate",
  endCCDueDate: "endCCDueDate",
  startLastUpdatedDate: "startLastUpdatedDate",
  endLastUpdatedDate: "endLastUpdatedDate",
} as const

/** Keys cleared by "More Filters → Clear" (legacy CustomerDataFilter). */
export const MORE_FILTER_KEYS = [
  CUSTOMER_FILTER_PARAMS.startCreatedDate,
  CUSTOMER_FILTER_PARAMS.endCreatedDate,
  CUSTOMER_FILTER_PARAMS.startCCDueDate,
  CUSTOMER_FILTER_PARAMS.endCCDueDate,
  CUSTOMER_FILTER_PARAMS.startLastUpdatedDate,
  CUSTOMER_FILTER_PARAMS.endLastUpdatedDate,
  CUSTOMER_FILTER_PARAMS.customerType,
  CUSTOMER_FILTER_PARAMS.userStatus,
  CUSTOMER_FILTER_PARAMS.countryCode,
  CUSTOMER_FILTER_PARAMS.studioIds,
  CUSTOMER_FILTER_PARAMS.secondaryStudioIds,
] as const

export const SEARCH_TYPE_OPTIONS = [
  { value: "default", label: "Name / phone / email" },
  { value: "cusId", label: "Customer ID" },
] as const

export const SORT_BY_OPTIONS = [
  { value: "REGISTERED_DATE", label: "Registered date" },
  { value: "CC_DUE_DATE", label: "CC due date" },
  { value: "LAST_UPDATED", label: "Last updated" },
] as const

export const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "PASSIVE", label: "Passive" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "UNASSIGNED", label: "Unassigned" },
  { value: "ISSUE", label: "Issue" },
  { value: "MPF_GROUP", label: "MPF Group" },
] as const

export const CUSTOMER_TYPE_OPTIONS = [
  { value: "DAILY_WEAR", label: "Daily Wear" },
  { value: "OCCASIONAL", label: "Occasional" },
  { value: "STAR_CLIENT", label: "Star Client" },
] as const

export type SearchType = (typeof SEARCH_TYPE_OPTIONS)[number]["value"]
export type SortByEnum = (typeof SORT_BY_OPTIONS)[number]["value"]
