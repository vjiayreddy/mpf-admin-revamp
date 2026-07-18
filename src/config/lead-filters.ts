/** URL + GraphQL filter keys for the leads list. */

export const LEAD_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  status: "status",
  creditToSalesTeamIds: "creditToSalesTeamIds",
  userId: "userId",
  studioIds: "studioIds",
  sourceCatIds: "sourceCatIds",
  brandPartnerSubCatIds: "brandPartnerSubCatIds",
  rating: "rating",
  startLeadDate: "startLeadDate",
  endLeadDate: "endLeadDate",
  startFollowUpDate: "startFollowUpDate",
  endFollowUpDate: "endFollowUpDate",
  startExpectedClosureDate: "startExpectedClosureDate",
  endExpectedClosureDate: "endExpectedClosureDate",
  startEventDate: "startEventDate",
  endEventDate: "endEventDate",
  startLeadLinkOrderCloseDate: "startLeadLinkOrderCloseDate",
  endLeadLinkOrderCloseDate: "endLeadLinkOrderCloseDate",
} as const

export const MORE_LEAD_FILTER_KEYS = [
  LEAD_FILTER_PARAMS.studioIds,
  LEAD_FILTER_PARAMS.sourceCatIds,
  LEAD_FILTER_PARAMS.brandPartnerSubCatIds,
  LEAD_FILTER_PARAMS.rating,
  LEAD_FILTER_PARAMS.startLeadDate,
  LEAD_FILTER_PARAMS.endLeadDate,
  LEAD_FILTER_PARAMS.startFollowUpDate,
  LEAD_FILTER_PARAMS.endFollowUpDate,
  LEAD_FILTER_PARAMS.startExpectedClosureDate,
  LEAD_FILTER_PARAMS.endExpectedClosureDate,
  LEAD_FILTER_PARAMS.startEventDate,
  LEAD_FILTER_PARAMS.endEventDate,
  LEAD_FILTER_PARAMS.startLeadLinkOrderCloseDate,
  LEAD_FILTER_PARAMS.endLeadLinkOrderCloseDate,
] as const

export const LEAD_STATUS_OPTIONS = [
  { value: "created", label: "Created" },
  { value: "follow_up", label: "Follow Up" },
  { value: "hot_leads", label: "Hot Leads" },
  { value: "appointment", label: "Appointment" },
  { value: "order_closed", label: "Order Closed" },
  { value: "unsuccessful", label: "Unsuccessful" },
  { value: "unconfirmed", label: "Unconfirmed" },
] as const

export const LEAD_RATING_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
] as const

/** Statuses that require a follow-up / appointment date on update. */
export const LEAD_STATUS_REQUIRES_DATE = new Set([
  "follow_up",
  "unconfirmed",
  "appointment",
])
