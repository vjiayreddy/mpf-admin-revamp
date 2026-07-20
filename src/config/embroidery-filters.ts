/** URL param keys for embroidery list + calendar. */

export const EMBROIDERY_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  stylistId: "stylistId",
  orderStatus: "orderStatus",
  workType: "workType",
  sortByEnum: "sortByEnum",
  startEmbTrialDate: "startEmbTrialDate",
  endEmbTrialDate: "endEmbTrialDate",
  approvalStatus: "approvalStatus",
  embStatus: "embStatus",
  markingStatus: "markingStatus",
  qcStatus: "qcStatus",
  sampleStatus: "sampleStatus",
  userId: "userId",
  calDate: "calDate",
} as const

export type EmbroiderySortBy = "EMB_TRIAL_DATE" | "ORDER_DATE"

export const EMBROIDERY_SORT_OPTIONS: Array<{
  label: string
  value: EmbroiderySortBy
}> = [
  { label: "Emb trial date", value: "EMB_TRIAL_DATE" },
  { label: "Order date", value: "ORDER_DATE" },
]

export const DEFAULT_ORDER_STATUS = "RUNNING"
export const DEFAULT_SORT: EmbroiderySortBy = "EMB_TRIAL_DATE"

/**
 * Legacy running-list default emb statuses (comma-joined in the URL).
 * Matches EmbTrackOrderGridHeader mount defaults.
 */
export const DEFAULT_EMB_STATUS_VALUES = [
  "NOT_STARTED",
  "PERCENT_0_25",
  "PERCENT_25_50",
  "PERCENT_50_70",
  "PERCENT_90",
  "END_STAGES",
  "REWORK",
] as const

export const DEFAULT_EMB_STATUS_PARAM = DEFAULT_EMB_STATUS_VALUES.join(",")

/** Advanced filters shown in “More filters” (emb status lives on the main bar). */
export const MORE_EMBROIDERY_FILTER_KEYS = [
  EMBROIDERY_FILTER_PARAMS.startEmbTrialDate,
  EMBROIDERY_FILTER_PARAMS.endEmbTrialDate,
  EMBROIDERY_FILTER_PARAMS.approvalStatus,
  EMBROIDERY_FILTER_PARAMS.markingStatus,
  EMBROIDERY_FILTER_PARAMS.qcStatus,
  EMBROIDERY_FILTER_PARAMS.sampleStatus,
] as const
