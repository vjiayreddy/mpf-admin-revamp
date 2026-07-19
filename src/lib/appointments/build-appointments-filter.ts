import {
  APPOINTMENT_FILTER_PARAMS,
  APPOINTMENT_STATUS_OPTIONS,
  MORE_APPOINTMENT_FILTER_KEYS,
} from "@/config/appointment-filters"
import type { AppointmentFilterInput } from "@/lib/apollo/queries/appointments"
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
 * Pure builder: URL search params → GraphQL AppointmentFilterInput.
 * defaultStylistId applies when URL has no stylistId (personal_stylist team).
 */
export function buildAppointmentsFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultStylistId?: string | null
): AppointmentFilterInput {
  const p = APPOINTMENT_FILTER_PARAMS
  const params: AppointmentFilterInput = {}

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) params.searchTerm = searchTerm

  const status = searchParams.get(p.status)
  if (status && status !== "all") params.status = status

  const stylistId = searchParams.get(p.stylistId) || defaultStylistId || undefined
  if (stylistId) params.stylistId = stylistId

  const studioIds = splitCsv(searchParams.get(p.studio))
  if (studioIds) params.studioIds = studioIds

  const userId = searchParams.get(p.userId)
  if (userId) params.userId = userId

  const startIso = searchParams.get(p.startAppointmentDate)
  if (startIso) params.startAppointmentDate = startDateFilter(startIso)

  const endIso = searchParams.get(p.endAppointmentDate)
  if (endIso) params.endAppointmentDate = endDateFilter(endIso)

  return params
}

export type ActiveAppointmentFilter = {
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

export function listActiveAppointmentFilters(
  searchParams: URLSearchParams,
  options?: {
    studioNameById?: Map<string, string>
    stylistNameById?: Map<string, string>
    /** When true, omit the userId chip (customer-scoped appointments page). */
    hideUserIdChip?: boolean
  }
): ActiveAppointmentFilter[] {
  const p = APPOINTMENT_FILTER_PARAMS
  const chips: ActiveAppointmentFilter[] = []
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

  const status = searchParams.get(p.status)
  if (status && status !== "all") {
    chips.push({
      id: "status",
      label: "Status",
      displayValue: optionLabel(APPOINTMENT_STATUS_OPTIONS, status),
      clear: { [p.status]: null },
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

  const start = searchParams.get(p.startAppointmentDate)
  const end = searchParams.get(p.endAppointmentDate)
  if (start || end) {
    chips.push({
      id: "appointmentDate",
      label: "Appointment date",
      displayValue: `${formatChipDate(start)} → ${formatChipDate(end)}`,
      clear: {
        [p.startAppointmentDate]: null,
        [p.endAppointmentDate]: null,
      },
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

export function countAdvancedAppointmentFilters(
  searchParams: URLSearchParams
): number {
  const p = APPOINTMENT_FILTER_PARAMS
  let count = 0
  if (searchParams.get(p.studio)) count += 1
  if (
    searchParams.get(p.startAppointmentDate) ||
    searchParams.get(p.endAppointmentDate)
  ) {
    count += 1
  }
  return count
}

export function getClearAllAppointmentFilterUpdates(options?: {
  preserveUserId?: boolean
}): Record<string, null> {
  const updates: Record<string, null> = {
    [APPOINTMENT_FILTER_PARAMS.searchTerm]: null,
    [APPOINTMENT_FILTER_PARAMS.status]: null,
    [APPOINTMENT_FILTER_PARAMS.stylistId]: null,
  }
  if (!options?.preserveUserId) {
    updates[APPOINTMENT_FILTER_PARAMS.userId] = null
  }
  for (const key of MORE_APPOINTMENT_FILTER_KEYS) {
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
