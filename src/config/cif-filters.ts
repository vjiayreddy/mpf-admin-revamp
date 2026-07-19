/** URL + GraphQL filter keys for the CIF list (legacy parity). */

export const CIF_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  customerInfoStatus: "customerInfoStatus",
  stylistId: "stylistId",
  studio: "studio",
  userId: "userId",
  rating: "rating",
  startEventDate: "startEventDate",
  endEventDate: "endEventDate",
  startFollowUpDate: "startFollowUpDate",
  endFollowUpDate: "endFollowUpDate",
  startCreatedDate: "startCreatedDate",
  endCreatedDate: "endCreatedDate",
  brandPartnerSubCatIds: "brandPartnerSubCatIds",
} as const

/** Keys cleared by "More Filters → Clear". */
export const MORE_CIF_FILTER_KEYS = [
  CIF_FILTER_PARAMS.studio,
  CIF_FILTER_PARAMS.rating,
  CIF_FILTER_PARAMS.startEventDate,
  CIF_FILTER_PARAMS.endEventDate,
  CIF_FILTER_PARAMS.startFollowUpDate,
  CIF_FILTER_PARAMS.endFollowUpDate,
  CIF_FILTER_PARAMS.startCreatedDate,
  CIF_FILTER_PARAMS.endCreatedDate,
  CIF_FILTER_PARAMS.brandPartnerSubCatIds,
] as const

export const CIF_STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "UNCONFIRMED", label: "Unconfirmed" },
  { value: "BACKED_OUT", label: "Backed Out" },
] as const

export type CifStatusValue = (typeof CIF_STATUS_OPTIONS)[number]["value"]
