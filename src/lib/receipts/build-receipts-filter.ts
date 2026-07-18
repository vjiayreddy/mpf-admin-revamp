import {
  MORE_RECEIPT_FILTER_KEYS,
  RECEIPT_BALANCE_OPTIONS,
  RECEIPT_FILTER_PARAMS,
} from "@/config/receipt-filters"
import {
  RECEIPTS_PAGE_LIMIT,
  type GetStoreOrderPaymentsVars,
  type StoreOrderPaymentsFilterInput,
} from "@/lib/apollo/queries/receipts"
import {
  endDateFilter,
  startDateFilter,
} from "@/lib/customers/date-filter"

/**
 * Pure builder: URL search params → GraphQL StoreOrderPaymentsFilterInput.
 */
export function buildReceiptsFilterFromSearchParams(
  searchParams: URLSearchParams
): StoreOrderPaymentsFilterInput {
  const p = RECEIPT_FILTER_PARAMS
  const filter: StoreOrderPaymentsFilterInput = {}

  const search = searchParams.get(p.searchTerm)?.trim()
  if (search) filter.searchTerm = search

  const stylistId = searchParams.get(p.stylistId)
  if (stylistId && stylistId !== "all") {
    filter.stylistId = stylistId
  }

  const start = searchParams.get(p.paymentStartDate)
  if (start) {
    filter.paymentStartDate = startDateFilter(start)
  }

  const end = searchParams.get(p.paymentEndDate)
  if (end) {
    filter.paymentEndDate = endDateFilter(end)
  }

  const hasBalance = searchParams.get(p.hasBalance)
  if (hasBalance === "true") filter.hasBalance = true
  if (hasBalance === "false") filter.hasBalance = false

  return filter
}

export function buildReceiptsQueryVars(
  searchParams: URLSearchParams,
  page0Based: number,
  limit = RECEIPTS_PAGE_LIMIT
): GetStoreOrderPaymentsVars {
  return {
    params: buildReceiptsFilterFromSearchParams(searchParams),
    page: page0Based + 1,
    limit,
  }
}

export type ActiveReceiptFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value
}

function formatChipDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function listActiveReceiptFilters(
  searchParams: URLSearchParams,
  opts?: {
    stylistNameById?: Map<string, string>
  }
): ActiveReceiptFilter[] {
  const p = RECEIPT_FILTER_PARAMS
  const chips: ActiveReceiptFilter[] = []

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) {
    chips.push({
      id: "searchTerm",
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const stylistId = searchParams.get(p.stylistId)
  if (stylistId && stylistId !== "all") {
    chips.push({
      id: "stylistId",
      label: "Stylist",
      displayValue: opts?.stylistNameById?.get(stylistId) ?? stylistId,
      clear: { [p.stylistId]: null },
    })
  }

  const start = searchParams.get(p.paymentStartDate)
  if (start) {
    chips.push({
      id: "paymentStartDate",
      label: "Payment from",
      displayValue: formatChipDate(start),
      clear: { [p.paymentStartDate]: null },
    })
  }

  const end = searchParams.get(p.paymentEndDate)
  if (end) {
    chips.push({
      id: "paymentEndDate",
      label: "Payment to",
      displayValue: formatChipDate(end),
      clear: { [p.paymentEndDate]: null },
    })
  }

  const hasBalance = searchParams.get(p.hasBalance)
  if (hasBalance === "true" || hasBalance === "false") {
    chips.push({
      id: "hasBalance",
      label: "Balance",
      displayValue: optionLabel(RECEIPT_BALANCE_OPTIONS, hasBalance),
      clear: { [p.hasBalance]: null },
    })
  }

  return chips
}

export function countAdvancedReceiptFilters(
  searchParams: URLSearchParams
): number {
  let count = 0
  for (const key of MORE_RECEIPT_FILTER_KEYS) {
    const value = searchParams.get(key)
    if (value && value !== "all") count += 1
  }
  return count
}

export function getClearAllReceiptFilterUpdates(): Record<string, null> {
  return {
    [RECEIPT_FILTER_PARAMS.searchTerm]: null,
    [RECEIPT_FILTER_PARAMS.stylistId]: null,
    [RECEIPT_FILTER_PARAMS.paymentStartDate]: null,
    [RECEIPT_FILTER_PARAMS.paymentEndDate]: null,
    [RECEIPT_FILTER_PARAMS.hasBalance]: null,
  }
}

export function getClearMoreReceiptFilterUpdates(): Record<string, null> {
  const updates: Record<string, null> = {}
  for (const key of MORE_RECEIPT_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}
