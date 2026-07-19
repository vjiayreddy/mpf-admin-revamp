export const TRIAL_PARAMS = {
  tab: "tab",
  page: "page",
  searchTerm: "searchTerm",
  stylistId: "stylistId",
  trialStatus: "trialStatus",
  trialDecision: "trialDecision",
  trialRating: "trialRating",
  measurementStatus: "measurementStatus",
} as const

/** Secondary filters shown in the More filters sheet (customer-list pattern). */
export const MORE_TRIAL_FILTER_KEYS = [
  TRIAL_PARAMS.trialStatus,
  TRIAL_PARAMS.trialDecision,
  TRIAL_PARAMS.trialRating,
  TRIAL_PARAMS.measurementStatus,
] as const

export const TRIAL_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "First Trail Done", value: "FIRST_TRIAL_DONE" },
  { label: "Second Trail Done", value: "SECOND_TRIAL_DONE" },
  { label: "Third Trail Done", value: "THIRD_TRIAL_DONE" },
  { label: "Pending", value: "PENDING" },
  { label: "Delivered", value: "DELIVERED" },
]

export const TRIAL_RATING_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Excellent", value: "EXCELLENT" },
  { label: "Good", value: "GOOD" },
  { label: "Not Bad", value: "NOT_BAD" },
  { label: "Bad", value: "BAD" },
  { label: "Worst", value: "WORST" },
]

export const TRIAL_DECISION_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Approved", value: "APPROVED" },
  { label: "Alterations", value: "ALTERATIONS" },
  { label: "Discussion", value: "DISCUSSION" },
  { label: "Rejected", value: "REJECTED" },
]

export const TRIAL_MEASUREMENT_STATUS_OPTIONS: Array<{
  label: string
  value: string
}> = [
  { label: "Updated", value: "UPDATED" },
  { label: "Pending", value: "PENDING" },
  { label: "Done", value: "DONE" },
]

/** S3 prefix for trial image/video uploads (legacy S3_TRIAL_IMAGE_UPLOAD). */
export const TRIAL_IMAGE_UPLOAD_PATH = "Images/MPFUserImages_2.0"
