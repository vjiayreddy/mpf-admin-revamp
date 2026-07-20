/** URL params for admin Quality Check orders list (legacy /admin/qualitycheck). */

export const QUALITY_CHECK_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  studioId: "studioId",
  stylistId: "stylistId",
  startTrialDate: "startTrialDate",
  endTrialDate: "endTrialDate",
  startDeliveryDate: "startDeliveryDate",
  endDeliveryDate: "endDeliveryDate",
} as const

/** Date filters shown in the More filters sheet. */
export const MORE_QUALITY_CHECK_FILTER_KEYS = [
  QUALITY_CHECK_PARAMS.startTrialDate,
  QUALITY_CHECK_PARAMS.endTrialDate,
  QUALITY_CHECK_PARAMS.startDeliveryDate,
  QUALITY_CHECK_PARAMS.endDeliveryDate,
] as const

export const QUALITY_CHECK_PAGE_SIZE = 100

/** S3 prefix for QC product image uploads (legacy S3_QC_UPLOAD). */
export const QC_IMAGE_UPLOAD_PATH = "Images/MPFUserImages"

export const QUALITY_CHECK_STATUS_OPTIONS: Array<{
  label: string
  value: string
}> = [
  { label: "Approved", value: "APPROVED" },
  { label: "Alterations", value: "ALTERATIONS" },
  { label: "Discussion", value: "DISCUSSION" },
  { label: "Rejected", value: "REJECTED" },
]
