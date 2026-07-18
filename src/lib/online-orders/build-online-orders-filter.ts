import {
  ONLINE_ORDERS_PAGE_LIMIT,
  type GetAllProductOrdersVars,
} from "@/lib/apollo/queries/online-orders"

/**
 * URL page is 0-based; GraphQL getAllProductOrders expects 1-based page.
 * Do not send searchTerm — the schema only accepts page/limit (legacy UI
 * passed params.searchTerm but the query never declared it).
 */
export function buildOnlineOrdersQueryVars(
  page0Based: number
): GetAllProductOrdersVars {
  return {
    page: page0Based + 1,
    limit: ONLINE_ORDERS_PAGE_LIMIT,
  }
}
