import {
  LEAD_FILTER_PARAMS,
  LEAD_RATING_OPTIONS,
  LEAD_STATUS_OPTIONS,
  MORE_LEAD_FILTER_KEYS,
} from "@/config/lead-filters"
import {
  LEADS_PAGE_LIMIT,
  type GetAllLeadsVars,
  type LeadFilterInput,
  type LeadRoleFilterItem,
} from "@/lib/apollo/queries/leads"
import {
  endDateFilter,
  startDateFilter,
} from "@/lib/customers/date-filter"

function splitCsv(value: string | null): string[] | undefined {
  if (!value) return undefined
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : undefined
}

export function buildLeadsFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultPersonalStylistId?: string | null
): LeadFilterInput {
  const p = LEAD_FILTER_PARAMS
  const params: LeadFilterInput = {
    roleFilter: defaultPersonalStylistId
      ? [
          {
            _id: defaultPersonalStylistId,
            roleIdentifier: "personal_stylist",
          } satisfies LeadRoleFilterItem,
        ]
      : [],
  }

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) params.searchTerm = searchTerm

  const userId = searchParams.get(p.userId)
  if (userId) params.userId = userId

  const status = splitCsv(searchParams.get(p.status))
  if (status) params.status = status

  const studioIds = splitCsv(searchParams.get(p.studioIds))
  if (studioIds) params.studioIds = studioIds

  const sourceCatIds = splitCsv(searchParams.get(p.sourceCatIds))
  if (sourceCatIds) params.sourceCatIds = sourceCatIds

  const creditTo = searchParams.get(p.creditToSalesTeamIds)
  if (creditTo) params.creditToSalesTeamIds = [creditTo]

  const brandPartnerSubCatIds = splitCsv(
    searchParams.get(p.brandPartnerSubCatIds)
  )
  if (brandPartnerSubCatIds) {
    params.brandPartnerSubCatIds = brandPartnerSubCatIds
  }

  const rating = searchParams.get(p.rating)
  if (rating != null && rating !== "") {
    const n = Number(rating)
    if (Number.isFinite(n)) params.rating = n
  }

  const datePairs: Array<[keyof LeadFilterInput, string | null]> = [
    ["startLeadDate", searchParams.get(p.startLeadDate)],
    ["endLeadDate", searchParams.get(p.endLeadDate)],
    ["startFollowUpDate", searchParams.get(p.startFollowUpDate)],
    ["endFollowUpDate", searchParams.get(p.endFollowUpDate)],
    ["startExpectedClosureDate", searchParams.get(p.startExpectedClosureDate)],
    ["endExpectedClosureDate", searchParams.get(p.endExpectedClosureDate)],
    ["startEventDate", searchParams.get(p.startEventDate)],
    ["endEventDate", searchParams.get(p.endEventDate)],
    [
      "startLeadLinkOrderCloseDate",
      searchParams.get(p.startLeadLinkOrderCloseDate),
    ],
    [
      "endLeadLinkOrderCloseDate",
      searchParams.get(p.endLeadLinkOrderCloseDate),
    ],
  ]

  for (const [key, iso] of datePairs) {
    if (!iso) continue
    const isEnd = String(key).startsWith("end")
    ;(params as Record<string, unknown>)[key] = isEnd
      ? endDateFilter(iso)
      : startDateFilter(iso)
  }

  return params
}

export function buildLeadsQueryVars(
  searchParams: URLSearchParams,
  page0Based: number,
  defaultPersonalStylistId?: string | null,
  opts?: { isDownloadActive?: boolean; limit?: number }
): GetAllLeadsVars {
  const params = buildLeadsFilterFromSearchParams(
    searchParams,
    defaultPersonalStylistId
  )
  if (opts?.isDownloadActive) {
    params.isDownloadActive = true
  }
  return {
    params,
    page: page0Based + 1,
    limit: opts?.limit ?? LEADS_PAGE_LIMIT,
  }
}

export type ActiveLeadFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function formatChipDate(iso: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value
}

export function listActiveLeadFilters(
  searchParams: URLSearchParams,
  options?: {
    studioNameById?: Map<string, string>
    stylistNameById?: Map<string, string>
    sourceNameById?: Map<string, string>
    brandPartnerNameById?: Map<string, string>
  }
): ActiveLeadFilter[] {
  const p = LEAD_FILTER_PARAMS
  const chips: ActiveLeadFilter[] = []
  const studioNameById = options?.studioNameById
  const stylistNameById = options?.stylistNameById
  const sourceNameById = options?.sourceNameById
  const brandPartnerNameById = options?.brandPartnerNameById

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
  if (status) {
    chips.push({
      id: "status",
      label: "Status",
      displayValue: status
        .split(",")
        .map((s) => optionLabel(LEAD_STATUS_OPTIONS, s.trim()))
        .join(", "),
      clear: { [p.status]: null },
    })
  }

  const creditTo = searchParams.get(p.creditToSalesTeamIds)
  if (creditTo) {
    chips.push({
      id: "creditTo",
      label: "Credit To",
      displayValue: stylistNameById?.get(creditTo) ?? "Selected stylist",
      clear: { [p.creditToSalesTeamIds]: null },
    })
  }

  const studios = searchParams.get(p.studioIds)
  if (studios) {
    chips.push({
      id: "studios",
      label: "Studio",
      displayValue: studios
        .split(",")
        .map((id) => studioNameById?.get(id.trim()) ?? id.trim())
        .join(", "),
      clear: { [p.studioIds]: null },
    })
  }

  const sources = searchParams.get(p.sourceCatIds)
  if (sources) {
    chips.push({
      id: "sources",
      label: "Source",
      displayValue: sources
        .split(",")
        .map((id) => sourceNameById?.get(id.trim()) ?? id.trim())
        .join(", "),
      clear: { [p.sourceCatIds]: null },
    })
  }

  const brandPartners = searchParams.get(p.brandPartnerSubCatIds)
  if (brandPartners) {
    chips.push({
      id: "brandPartners",
      label: "Cross selling",
      displayValue: brandPartners
        .split(",")
        .map((id) => brandPartnerNameById?.get(id.trim()) ?? id.trim())
        .join(", "),
      clear: { [p.brandPartnerSubCatIds]: null },
    })
  }

  const rating = searchParams.get(p.rating)
  if (rating != null && rating !== "") {
    chips.push({
      id: "rating",
      label: "Rating",
      displayValue: optionLabel(LEAD_RATING_OPTIONS, rating),
      clear: { [p.rating]: null },
    })
  }

  const dateChip = (
    id: string,
    label: string,
    startKey: string,
    endKey: string
  ) => {
    const start = searchParams.get(startKey)
    const end = searchParams.get(endKey)
    if (!start && !end) return
    chips.push({
      id,
      label,
      displayValue: `${formatChipDate(start)} – ${formatChipDate(end)}`,
      clear: { [startKey]: null, [endKey]: null },
    })
  }

  dateChip("leadDate", "Lead date", p.startLeadDate, p.endLeadDate)
  dateChip(
    "followUp",
    "Follow-up",
    p.startFollowUpDate,
    p.endFollowUpDate
  )
  dateChip(
    "closure",
    "Expected closure",
    p.startExpectedClosureDate,
    p.endExpectedClosureDate
  )
  dateChip("event", "Event date", p.startEventDate, p.endEventDate)
  dateChip(
    "linkClose",
    "Link order close",
    p.startLeadLinkOrderCloseDate,
    p.endLeadLinkOrderCloseDate
  )

  const userId = searchParams.get(p.userId)
  if (userId) {
    chips.push({
      id: "userId",
      label: "Customer",
      displayValue: userId,
      clear: { [p.userId]: null },
    })
  }

  return chips
}

export function countAdvancedLeadFilters(
  searchParams: URLSearchParams
): number {
  let count = 0
  for (const key of MORE_LEAD_FILTER_KEYS) {
    if (searchParams.get(key)) count += 1
  }
  return count
}

export function getClearMoreLeadFilterUpdates(): Record<string, null> {
  const updates: Record<string, null> = {}
  for (const key of MORE_LEAD_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}

export function getClearAllLeadFilterUpdates(): Record<string, string | null> {
  const updates: Record<string, string | null> = {
    [LEAD_FILTER_PARAMS.page]: "0",
    [LEAD_FILTER_PARAMS.searchTerm]: null,
    [LEAD_FILTER_PARAMS.creditToSalesTeamIds]: null,
    [LEAD_FILTER_PARAMS.userId]: null,
  }
  for (const key of MORE_LEAD_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}
