/** URL + GraphQL filter keys for the receipts (store-order payments) list. */

export const RECEIPT_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  stylistId: "stylistId",
  paymentStartDate: "paymentStartDate",
  paymentEndDate: "paymentEndDate",
  hasBalance: "hasBalance",
} as const

export const MORE_RECEIPT_FILTER_KEYS = [
  RECEIPT_FILTER_PARAMS.paymentStartDate,
  RECEIPT_FILTER_PARAMS.paymentEndDate,
  RECEIPT_FILTER_PARAMS.hasBalance,
] as const

export const RECEIPT_BALANCE_OPTIONS = [
  { value: "true", label: "Has balance" },
  { value: "false", label: "No balance" },
] as const

export const PAYMENT_MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "googleplay", label: "Google Pay" },
  { value: "cash", label: "Cash" },
  { value: "mswipe", label: "MSwipe" },
  { value: "razorpay", label: "Razor Pay" },
  { value: "pine labs", label: "Pine Labs" },
  { value: "ezetap", label: "Ezetap" },
  { value: "phonepepos", label: "Phone pe POS" },
  { value: "phonepeqr", label: "Phone pe QR" },
  { value: "psbqr", label: "PSB QR" },
] as const

export const RECEIPT_VERIFICATION_OPTIONS = [
  { value: "Not verified", label: "Not verified" },
  { value: "Verified", label: "Verified" },
] as const
