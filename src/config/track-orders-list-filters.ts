import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT_BY,
  OUTFIT_STATUS_OPTIONS,
  TRACK_ORDERS_SORT_OPTIONS,
  TRACK_ORDERS_STATUS_OPTIONS,
  type TrackOrdersSortBy,
} from "@/config/track-orders-calendar-filters"

export const TRACK_ORDERS_LIST_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  sortByEnum: "sortByEnum",
  orderStatus: "orderStatus",
  stylistId: "stylistId",
  measurementApprovalStatus: "measurementApprovalStatus",
  startOrderDate: "startOrderDate",
  endOrderDate: "endOrderDate",
  startTrialDate: "startTrialDate",
  endTrialDate: "endTrialDate",
  startEventDate: "startEventDate",
  endEventDate: "endEventDate",
  startReadyDate: "startReadyDate",
  endReadyDate: "endReadyDate",
  startDeliveryDate: "startDeliveryDate",
  endDeliveryDate: "endDeliveryDate",
  studioIds: "studioIds",
  hasEmbroidary: "hasEmbroidary",
  outfitStatus: "outfitStatus",
} as const

export const MORE_TRACK_ORDERS_LIST_FILTER_KEYS = [
  TRACK_ORDERS_LIST_PARAMS.startOrderDate,
  TRACK_ORDERS_LIST_PARAMS.endOrderDate,
  TRACK_ORDERS_LIST_PARAMS.startTrialDate,
  TRACK_ORDERS_LIST_PARAMS.endTrialDate,
  TRACK_ORDERS_LIST_PARAMS.startEventDate,
  TRACK_ORDERS_LIST_PARAMS.endEventDate,
  TRACK_ORDERS_LIST_PARAMS.startReadyDate,
  TRACK_ORDERS_LIST_PARAMS.endReadyDate,
  TRACK_ORDERS_LIST_PARAMS.startDeliveryDate,
  TRACK_ORDERS_LIST_PARAMS.endDeliveryDate,
  TRACK_ORDERS_LIST_PARAMS.studioIds,
  TRACK_ORDERS_LIST_PARAMS.hasEmbroidary,
  TRACK_ORDERS_LIST_PARAMS.outfitStatus,
] as const

export const MEASUREMENT_APPROVAL_OPTIONS: Array<{
  label: string
  value: string
}> = [
  { label: "All", value: "" },
  { label: "Approved", value: "APPROVED" },
  { label: "Unapproved", value: "UNAPPROVED" },
  { label: "Pending", value: "PENDING" },
  { label: "Requested", value: "REQUESTED" },
  { label: "Dismissed", value: "DISMISSED" },
]

export const HAS_EMBROIDARY_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Any", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
]

export {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT_BY,
  OUTFIT_STATUS_OPTIONS,
  TRACK_ORDERS_SORT_OPTIONS,
  TRACK_ORDERS_STATUS_OPTIONS,
  type TrackOrdersSortBy,
}
