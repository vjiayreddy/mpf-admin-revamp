export const TRACK_ORDERS_CALENDAR_PARAMS = {
  calDate: "calDate",
  sortByEnum: "sortByEnum",
  orderStatus: "orderStatus",
  stylistId: "stylistId",
  searchTerm: "searchTerm",
} as const

export type TrackOrdersSortBy = "TRIAL_DATE" | "ORDER_DATE"

export const TRACK_ORDERS_SORT_OPTIONS: Array<{
  label: string
  value: TrackOrdersSortBy
}> = [
  { label: "Trial date", value: "TRIAL_DATE" },
  { label: "Order date", value: "ORDER_DATE" },
]

export const TRACK_ORDERS_STATUS_OPTIONS: Array<{
  label: string
  value: string
}> = [
  { label: "All", value: "ALL" },
  { label: "Running", value: "RUNNING" },
  { label: "Ready for delivery", value: "READY_FOR_DELIVERY" },
  { label: "Hold", value: "HOLD" },
  { label: "Alterations", value: "ALTERATIONS" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Draft", value: "DRAFT" },
]

export const ORDER_STATUS_EDIT_OPTIONS = TRACK_ORDERS_STATUS_OPTIONS.filter(
  (o) => o.value !== "ALL"
)

export const OUTFIT_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Not Started", value: "not_started" },
  { label: "Fabric Ordered", value: "fabric_ordered" },
  { label: "Fabric Received", value: "fabric_received" },
  { label: "Blutailor Alt", value: "bluetailor_alt" },
  { label: "Dying Given", value: "dying_given" },
  { label: "Dying Recevied", value: "dying_received" },
  { label: "Redyeing given", value: "redyeing_given" },
  { label: "Redyeing Received", value: "redyeing_received" },
  { label: "Item Outsourced", value: "item_outsourced" },
  { label: "Emb Outsourced", value: "emb_outsourced" },
]

export const DEFAULT_SORT_BY: TrackOrdersSortBy = "TRIAL_DATE"
export const DEFAULT_ORDER_STATUS = "RUNNING"
