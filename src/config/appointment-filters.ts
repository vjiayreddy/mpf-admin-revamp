/** URL + GraphQL filter keys for the appointments list (legacy parity). */

export const APPOINTMENT_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  status: "status",
  stylistId: "stylistId",
  studio: "studio",
  startAppointmentDate: "startAppointmentDate",
  endAppointmentDate: "endAppointmentDate",
  userId: "userId",
} as const

/** Keys cleared by "More Filters → Clear". */
export const MORE_APPOINTMENT_FILTER_KEYS = [
  APPOINTMENT_FILTER_PARAMS.startAppointmentDate,
  APPOINTMENT_FILTER_PARAMS.endAppointmentDate,
  APPOINTMENT_FILTER_PARAMS.studio,
] as const

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "created", label: "Created" },
  { value: "unconfirmed", label: "Unconfirmed" },
  { value: "not_interested", label: "Not Interested" },
  { value: "follow_up", label: "Follow Up" },
  { value: "ordered", label: "Ordered" },
  { value: "unsuccessful", label: "Unsuccessful" },
] as const

export const APPOINTMENT_TYPE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "studio", label: "Studio" },
  { value: "doorStep", label: "Doorstep" },
] as const

export type AppointmentStatusValue =
  (typeof APPOINTMENT_STATUS_OPTIONS)[number]["value"]

export type AppointmentTypeValue =
  (typeof APPOINTMENT_TYPE_OPTIONS)[number]["value"]
