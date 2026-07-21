/** URL params for admin Orders list (legacy /admin/orders). */

export const ORDERS_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  orderStatus: "orderStatus",
  studioId: "studioId",
  stylistId: "stylistId",
  hasEmbroidary: "hasEmbroidary",
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
} as const

export const MORE_ORDERS_FILTER_KEYS = [
  ORDERS_PARAMS.startOrderDate,
  ORDERS_PARAMS.endOrderDate,
  ORDERS_PARAMS.startTrialDate,
  ORDERS_PARAMS.endTrialDate,
  ORDERS_PARAMS.startEventDate,
  ORDERS_PARAMS.endEventDate,
  ORDERS_PARAMS.startReadyDate,
  ORDERS_PARAMS.endReadyDate,
  ORDERS_PARAMS.startDeliveryDate,
  ORDERS_PARAMS.endDeliveryDate,
  ORDERS_PARAMS.hasEmbroidary,
] as const

export const ORDERS_PAGE_SIZE = 100

/** Legacy ORDER_FILTERS (exclude ALL — empty URL = all). */
export const ORDER_STATUS_FILTER_OPTIONS: Array<{
  label: string
  value: string
}> = [
  { label: "Draft", value: "DRAFT" },
  { label: "Running", value: "RUNNING" },
  { label: "Un Confirmed", value: "UNCONFIRMED" },
  { label: "Ready for delivery", value: "READY_FOR_DELIVERY" },
  { label: "Hold", value: "HOLD" },
  { label: "Alteration", value: "ALTERATIONS" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Closed", value: "CLOSED" },
]

export const EMBROIDERY_FILTER_OPTIONS: Array<{
  label: string
  value: string
}> = [
  { label: "With embroidery", value: "true" },
  { label: "Without embroidery", value: "false" },
]
