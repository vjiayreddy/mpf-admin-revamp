import {
  CUSTOMER_FILTER_PARAMS,
  MORE_FILTER_KEYS,
  SEARCH_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
} from "@/config/customer-filters"

/** Client Connect URL params = customers filters + ccType / studioId. */
export const CLIENT_CONNECT_FILTER_PARAMS = {
  ...CUSTOMER_FILTER_PARAMS,
  ccType: "ccType",
  studioId: "studioId",
} as const

export const CLIENT_CONNECT_MORE_FILTER_KEYS = MORE_FILTER_KEYS

export const CC_TYPE_OPTIONS = [
  { value: "TOUCH_BASE_CC", label: "Touch Base CC" },
  { value: "CURRENT_CC", label: "Current CC" },
  { value: "NEW_CC", label: "New CC" },
  { value: "PORTFOLIO_CC", label: "Portfolio CC" },
] as const

export const CLIENT_CONNECT_SEARCH_TYPE_OPTIONS = SEARCH_TYPE_OPTIONS

export const CLIENT_CONNECT_SORT_OPTIONS = SORT_BY_OPTIONS

export const DEFAULT_CC_TYPE = "TOUCH_BASE_CC"

export type CcTypeOption = (typeof CC_TYPE_OPTIONS)[number]["value"]
