import { INVOICE_FILTER_PARAMS } from "@/config/invoice-filters"
import {
  INVOICE_PAGE_LIMIT,
  type GetOrderInvoicesByFilterVars,
  type OrderInvoiceFilterInput,
} from "@/lib/apollo/queries/invoice"

export function buildInvoiceFilterFromSearchParams(
  searchParams: URLSearchParams
): OrderInvoiceFilterInput | undefined {
  const search = searchParams.get(INVOICE_FILTER_PARAMS.searchTerm)?.trim()
  if (!search) return undefined
  return { searchTerm: search }
}

export function buildInvoicesQueryVars(
  searchParams: URLSearchParams,
  page0Based: number
): GetOrderInvoicesByFilterVars {
  const filter = buildInvoiceFilterFromSearchParams(searchParams)
  return {
    page: page0Based + 1,
    limit: INVOICE_PAGE_LIMIT,
    ...(filter ? { filter } : {}),
  }
}

export function getClearAllInvoiceFilterUpdates(): Record<
  string,
  string | null
> {
  return {
    [INVOICE_FILTER_PARAMS.searchTerm]: null,
    [INVOICE_FILTER_PARAMS.page]: "0",
  }
}
