import {
  TICKET_CATEGORY_OPTIONS,
  TICKET_FILTER_PARAMS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
} from "@/config/ticket-filters"
import {
  TICKETS_PAGE_SIZE,
  type GetTicketsVars,
} from "@/lib/apollo/queries/tickets"

/**
 * Pure builder: URL search params → GraphQL getTickets variables
 * (excluding page, which the hook adds as 1-based).
 */
export function buildTicketsFilterFromSearchParams(
  searchParams: URLSearchParams
): Omit<GetTicketsVars, "page" | "pageSize"> {
  const p = TICKET_FILTER_PARAMS
  const filter: Omit<GetTicketsVars, "page" | "pageSize"> = {}

  const search = searchParams.get(p.searchTerm)?.trim()
  if (search) filter.search = search

  const status = searchParams.get(p.status)
  if (status && status !== "all") filter.status = [status]

  const priority = searchParams.get(p.priority)
  if (priority && priority !== "all") filter.priority = [priority]

  const category = searchParams.get(p.category)
  if (category && category !== "all") filter.category = [category]

  return filter
}

export function buildTicketsQueryVars(
  searchParams: URLSearchParams,
  page0Based: number
): GetTicketsVars {
  return {
    page: page0Based + 1,
    pageSize: TICKETS_PAGE_SIZE,
    ...buildTicketsFilterFromSearchParams(searchParams),
  }
}

export type ActiveTicketFilter = {
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

export function listActiveTicketFilters(
  searchParams: URLSearchParams
): ActiveTicketFilter[] {
  const p = TICKET_FILTER_PARAMS
  const chips: ActiveTicketFilter[] = []

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) {
    chips.push({
      id: "searchTerm",
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const status = searchParams.get(p.status)
  if (status && status !== "all") {
    chips.push({
      id: "status",
      label: "Status",
      displayValue: optionLabel(TICKET_STATUS_OPTIONS, status),
      clear: { [p.status]: null },
    })
  }

  const priority = searchParams.get(p.priority)
  if (priority && priority !== "all") {
    chips.push({
      id: "priority",
      label: "Priority",
      displayValue: optionLabel(TICKET_PRIORITY_OPTIONS, priority),
      clear: { [p.priority]: null },
    })
  }

  const category = searchParams.get(p.category)
  if (category && category !== "all") {
    chips.push({
      id: "category",
      label: "Category",
      displayValue: optionLabel(TICKET_CATEGORY_OPTIONS, category),
      clear: { [p.category]: null },
    })
  }

  return chips
}

export function getClearAllTicketFilterUpdates(): Record<string, null> {
  return {
    [TICKET_FILTER_PARAMS.searchTerm]: null,
    [TICKET_FILTER_PARAMS.status]: null,
    [TICKET_FILTER_PARAMS.priority]: null,
    [TICKET_FILTER_PARAMS.category]: null,
  }
}
