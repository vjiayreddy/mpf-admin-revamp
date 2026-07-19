import {
  CIF_FILTER_PARAMS,
  CIF_STATUS_OPTIONS,
  MORE_CIF_FILTER_KEYS,
} from "@/config/cif-filters"
import type { CifFilterInput } from "@/lib/apollo/queries/cif"
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

/**
 * Pure builder: URL search params → GraphQL CIFFilterInput.
 * defaultStylistId applies when URL has no stylistId (personal_stylist team).
 */
export function buildCifFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultStylistId?: string | null
): CifFilterInput {
  const p = CIF_FILTER_PARAMS
  const params: CifFilterInput = {}

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) params.searchTerm = searchTerm

  const status = searchParams.get(p.customerInfoStatus)
  if (status && status !== "all") params.customerInfoStatus = status

  const stylistId =
    searchParams.get(p.stylistId) || defaultStylistId || undefined
  if (stylistId) params.stylistId = stylistId

  const studioIds = splitCsv(searchParams.get(p.studio))
  if (studioIds) params.studioIds = studioIds

  const userId = searchParams.get(p.userId)
  if (userId) params.userId = userId

  const ratingRaw = searchParams.get(p.rating)
  if (ratingRaw) {
    const rating = Number(ratingRaw)
    if (Number.isFinite(rating)) params.rating = rating
  }

  const brandPartnerSubCatIds = splitCsv(
    searchParams.get(p.brandPartnerSubCatIds)
  )
  if (brandPartnerSubCatIds) params.brandPartnerSubCatIds = brandPartnerSubCatIds

  const startEvent = searchParams.get(p.startEventDate)
  if (startEvent) params.startEventDate = startDateFilter(startEvent)
  const endEvent = searchParams.get(p.endEventDate)
  if (endEvent) params.endEventDate = endDateFilter(endEvent)

  const startFollowUp = searchParams.get(p.startFollowUpDate)
  if (startFollowUp) params.startFollowUpDate = startDateFilter(startFollowUp)
  const endFollowUp = searchParams.get(p.endFollowUpDate)
  if (endFollowUp) params.endFollowUpDate = endDateFilter(endFollowUp)

  const startCreated = searchParams.get(p.startCreatedDate)
  if (startCreated) params.startCreatedDate = startDateFilter(startCreated)
  const endCreated = searchParams.get(p.endCreatedDate)
  if (endCreated) params.endCreatedDate = endDateFilter(endCreated)

  return params
}

export type ActiveCifFilter = {
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

export function listActiveCifFilters(
  searchParams: URLSearchParams,
  options?: {
    studioNameById?: Map<string, string>
    stylistNameById?: Map<string, string>
    hideUserIdChip?: boolean
  }
): ActiveCifFilter[] {
  const p = CIF_FILTER_PARAMS
  const chips: ActiveCifFilter[] = []
  const studioNameById = options?.studioNameById
  const stylistNameById = options?.stylistNameById
  const hideUserIdChip = options?.hideUserIdChip === true

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) {
    chips.push({
      id: "searchTerm",
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const status = searchParams.get(p.customerInfoStatus)
  if (status && status !== "all") {
    chips.push({
      id: "customerInfoStatus",
      label: "Status",
      displayValue: optionLabel(CIF_STATUS_OPTIONS, status),
      clear: { [p.customerInfoStatus]: null },
    })
  }

  const stylistId = searchParams.get(p.stylistId)
  if (stylistId) {
    chips.push({
      id: "stylistId",
      label: "Stylist",
      displayValue: stylistNameById?.get(stylistId) ?? "Selected stylist",
      clear: { [p.stylistId]: null },
    })
  }

  const studio = searchParams.get(p.studio)
  if (studio) {
    const ids = studio
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const names = ids.map((id) => studioNameById?.get(id) ?? id)
    const displayValue =
      names.length <= 2
        ? names.join(", ")
        : `${names.slice(0, 2).join(", ")} +${names.length - 2}`
    chips.push({
      id: "studio",
      label: "Studios",
      displayValue,
      clear: { [p.studio]: null },
    })
  }

  const rating = searchParams.get(p.rating)
  if (rating) {
    chips.push({
      id: "rating",
      label: "Rating",
      displayValue: rating,
      clear: { [p.rating]: null },
    })
  }

  const startEvent = searchParams.get(p.startEventDate)
  const endEvent = searchParams.get(p.endEventDate)
  if (startEvent || endEvent) {
    chips.push({
      id: "eventDate",
      label: "Event date",
      displayValue: `${formatChipDate(startEvent)} → ${formatChipDate(endEvent)}`,
      clear: {
        [p.startEventDate]: null,
        [p.endEventDate]: null,
      },
    })
  }

  const startFollowUp = searchParams.get(p.startFollowUpDate)
  const endFollowUp = searchParams.get(p.endFollowUpDate)
  if (startFollowUp || endFollowUp) {
    chips.push({
      id: "followUpDate",
      label: "Follow-up date",
      displayValue: `${formatChipDate(startFollowUp)} → ${formatChipDate(endFollowUp)}`,
      clear: {
        [p.startFollowUpDate]: null,
        [p.endFollowUpDate]: null,
      },
    })
  }

  const startCreated = searchParams.get(p.startCreatedDate)
  const endCreated = searchParams.get(p.endCreatedDate)
  if (startCreated || endCreated) {
    chips.push({
      id: "createdDate",
      label: "Created date",
      displayValue: `${formatChipDate(startCreated)} → ${formatChipDate(endCreated)}`,
      clear: {
        [p.startCreatedDate]: null,
        [p.endCreatedDate]: null,
      },
    })
  }

  const brandPartner = searchParams.get(p.brandPartnerSubCatIds)
  if (brandPartner) {
    chips.push({
      id: "brandPartnerSubCatIds",
      label: "Cross-sell",
      displayValue: brandPartner,
      clear: { [p.brandPartnerSubCatIds]: null },
    })
  }

  const userId = searchParams.get(p.userId)
  if (userId && !hideUserIdChip) {
    chips.push({
      id: "userId",
      label: "User",
      displayValue: userId,
      clear: { [p.userId]: null },
    })
  }

  return chips
}

export function countAdvancedCifFilters(
  searchParams: URLSearchParams
): number {
  const p = CIF_FILTER_PARAMS
  let count = 0
  if (searchParams.get(p.studio)) count += 1
  if (searchParams.get(p.rating)) count += 1
  if (searchParams.get(p.brandPartnerSubCatIds)) count += 1
  if (searchParams.get(p.startEventDate) || searchParams.get(p.endEventDate)) {
    count += 1
  }
  if (
    searchParams.get(p.startFollowUpDate) ||
    searchParams.get(p.endFollowUpDate)
  ) {
    count += 1
  }
  if (
    searchParams.get(p.startCreatedDate) ||
    searchParams.get(p.endCreatedDate)
  ) {
    count += 1
  }
  return count
}

export function getClearAllCifFilterUpdates(options?: {
  preserveUserId?: boolean
}): Record<string, null> {
  const updates: Record<string, null> = {
    [CIF_FILTER_PARAMS.searchTerm]: null,
    [CIF_FILTER_PARAMS.customerInfoStatus]: null,
    [CIF_FILTER_PARAMS.stylistId]: null,
  }
  if (!options?.preserveUserId) {
    updates[CIF_FILTER_PARAMS.userId] = null
  }
  for (const key of MORE_CIF_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}

/** Resolve personal_stylist team id from session teamsJson. */
export function personalStylistIdFromTeamsJson(
  teamsJson: string | null | undefined
): string | null {
  if (!teamsJson) return null
  try {
    const teams = JSON.parse(teamsJson) as Array<{
      _id?: string
      roleIdentifier?: string
    } | null>
    const personal = teams?.find(
      (t) => t?.roleIdentifier === "personal_stylist"
    )
    return personal?._id ?? null
  } catch {
    return null
  }
}
