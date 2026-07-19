import {
  MORE_TRIAL_FILTER_KEYS,
  TRIAL_DECISION_OPTIONS,
  TRIAL_MEASUREMENT_STATUS_OPTIONS,
  TRIAL_PARAMS,
  TRIAL_RATING_OPTIONS,
  TRIAL_STATUS_OPTIONS,
} from "@/config/trial-filters"
import {
  TRIAL_LIST_PAGE_LIMIT,
  type GetOrderTrialsByFilterVars,
  type OrderTrialFilterParams,
} from "@/lib/apollo/queries/trial"

export type ActiveTrialFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function optionLabel(
  options: Array<{ label: string; value: string }>,
  value: string
) {
  return options.find((o) => o.value === value)?.label ?? value
}

export function buildTrialListQueryVars(
  searchParams: URLSearchParams,
  page: number,
  defaultPersonalStylistId?: string | null
): GetOrderTrialsByFilterVars {
  const params: OrderTrialFilterParams = {}

  const searchTerm = searchParams.get(TRIAL_PARAMS.searchTerm)?.trim()
  if (searchTerm) params.searchTerm = searchTerm

  const stylistId = searchParams.get(TRIAL_PARAMS.stylistId)
  if (stylistId && stylistId !== "all") {
    params.stylistId = stylistId
  } else if (defaultPersonalStylistId) {
    params.stylistId = defaultPersonalStylistId
  }

  const trialStatus = searchParams.get(TRIAL_PARAMS.trialStatus)
  if (trialStatus) params.trialStatus = trialStatus

  const trialDecision = searchParams.get(TRIAL_PARAMS.trialDecision)
  if (trialDecision) params.trialDecision = trialDecision

  const trialRating = searchParams.get(TRIAL_PARAMS.trialRating)
  if (trialRating) params.trialRating = trialRating

  const measurementStatus = searchParams.get(TRIAL_PARAMS.measurementStatus)
  if (measurementStatus) params.measurementStatus = measurementStatus

  return {
    page: page + 1,
    limit: TRIAL_LIST_PAGE_LIMIT,
    params,
  }
}

export function listActiveTrialFilters(
  searchParams: URLSearchParams,
  opts: {
    stylistNameById: Map<string, string>
  }
): ActiveTrialFilter[] {
  const chips: ActiveTrialFilter[] = []
  const p = TRIAL_PARAMS

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
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
      displayValue: opts.stylistNameById.get(stylistId) ?? stylistId,
      clear: { [p.stylistId]: null },
    })
  }

  const trialStatus = searchParams.get(p.trialStatus)
  if (trialStatus) {
    chips.push({
      id: "trialStatus",
      label: "Trail status",
      displayValue: optionLabel(TRIAL_STATUS_OPTIONS, trialStatus),
      clear: { [p.trialStatus]: null },
    })
  }

  const trialDecision = searchParams.get(p.trialDecision)
  if (trialDecision) {
    chips.push({
      id: "trialDecision",
      label: "Decision",
      displayValue: optionLabel(TRIAL_DECISION_OPTIONS, trialDecision),
      clear: { [p.trialDecision]: null },
    })
  }

  const trialRating = searchParams.get(p.trialRating)
  if (trialRating) {
    chips.push({
      id: "trialRating",
      label: "Rating",
      displayValue: optionLabel(TRIAL_RATING_OPTIONS, trialRating),
      clear: { [p.trialRating]: null },
    })
  }

  const measurementStatus = searchParams.get(p.measurementStatus)
  if (measurementStatus) {
    chips.push({
      id: "measurementStatus",
      label: "Measurement",
      displayValue: optionLabel(
        TRIAL_MEASUREMENT_STATUS_OPTIONS,
        measurementStatus
      ),
      clear: { [p.measurementStatus]: null },
    })
  }

  return chips
}

export function countAdvancedTrialFilters(
  searchParams: URLSearchParams
): number {
  let count = 0
  for (const key of MORE_TRIAL_FILTER_KEYS) {
    if (searchParams.get(key)?.trim()) count += 1
  }
  return count
}

export function getClearMoreTrialFilterUpdates(): Record<string, null> {
  const updates: Record<string, null> = {}
  for (const key of MORE_TRIAL_FILTER_KEYS) {
    updates[key] = null
  }
  return updates
}

export function getClearAllTrialFilterUpdates(): Record<
  string,
  string | null
> {
  const p = TRIAL_PARAMS
  return {
    [p.searchTerm]: null,
    [p.stylistId]: null,
    [p.trialStatus]: null,
    [p.trialDecision]: null,
    [p.trialRating]: null,
    [p.measurementStatus]: null,
    [p.page]: "0",
  }
}
