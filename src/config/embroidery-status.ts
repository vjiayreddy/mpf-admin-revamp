/** Single source of truth for embroidery status enums / labels. */

export type EmbroideryStatusOption = {
  value: string
  label: string
}

export const EMB_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "PERCENT_0_25", label: "Up to 25%" },
  { value: "PERCENT_25_50", label: "25%-50%" },
  { value: "PERCENT_50_70", label: "50%-70%" },
  { value: "PERCENT_90", label: "90%" },
  { value: "GONE_FOR_STITCHING", label: "Gone For Stitching" },
  { value: "END_STAGES", label: "End-Stages" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REWORK", label: "Rework" },
  { value: "CLOSED", label: "Closed" },
]

export const MARKING_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "PENDING", label: "Pending" },
  {
    value: "SEND_FOR_MARKING_AT_WORKSHOP",
    label: "Send for marking at workshop",
  },
  { value: "RECEIVED", label: "Received" },
  { value: "HOLD", label: "Hold" },
  { value: "ISSUE", label: "Issue" },
]

export const SAMPLE_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "SAMPLE_PENDING", label: "Sample Pending" },
  { value: "SAMPLE_UNDER_MAKING", label: "Sample Under Making" },
  {
    value: "SAMPLE_STYLIST_APPROVAL_PENDING",
    label: "Sample Stylist Approval Pending",
  },
  {
    value: "SAMPLE_CLIENT_APPROVAL_PENDING",
    label: "Sample Client Approval Pending",
  },
  { value: "SAMPLE_APPROVED", label: "Sample Approved" },
]

export const PAPER_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "EXISTING", label: "Existing" },
  { value: "NEW", label: "New" },
  { value: "NEW_MIX_OF_EXISTING", label: "New Mix of existing" },
  { value: "MIX_OF_EXISTING_AND_NEW", label: "Mix of existing and new" },
  {
    value: "DONT_KNOW_IF_EXISTING_PAPER",
    label: "Don't know if existing paper",
  },
  { value: "PAPER_APPROVED", label: "Paper approved" },
  { value: "READY", label: "Ready" },
  { value: "PAPER_MISSING", label: "Paper missing" },
]

export const APPROVAL_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "PENDING", label: "Pending" },
  { value: "INCOMPLETE", label: "Incomplete" },
  { value: "CLARIFICATION_REQ", label: "Clarification Required" },
  { value: "APPROVED", label: "Approved" },
]

export const QC_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "ON_HOLD", label: "On Hold" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REWORK", label: "Rework" },
  { value: "ISSUE", label: "Issue" },
]

export const WORK_TYPE_OPTIONS: EmbroideryStatusOption[] = [
  { value: "HAND", label: "Hand" },
  { value: "MACHINE", label: "Machine" },
  { value: "MACHINE_AND_HAND", label: "Machine And Hand" },
  { value: "MONOGRAM", label: "Monogram" },
  { value: "HAND_PAINT", label: "Hand Paint" },
  { value: "COMPUTERIZED", label: "Computerized" },
]

export const EMB_ORDER_STATUS_OPTIONS: EmbroideryStatusOption[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "RUNNING", label: "Running" },
  { value: "UNCONFIRMED", label: "Un Confirmed" },
  { value: "READY_FOR_DELIVERY", label: "Ready for delivery" },
  { value: "HOLD", label: "Hold" },
  { value: "ALTERATIONS", label: "Alteration" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CLOSED", label: "Closed" },
]

export type EmbroideryStatusField =
  | "embStatus"
  | "markingStatus"
  | "sampleStatus"
  | "paperStatus"
  | "approvalStatus"
  | "qcStatus"
  | "workType"

const FIELD_OPTIONS: Record<
  EmbroideryStatusField,
  EmbroideryStatusOption[]
> = {
  embStatus: EMB_STATUS_OPTIONS,
  markingStatus: MARKING_STATUS_OPTIONS,
  sampleStatus: SAMPLE_STATUS_OPTIONS,
  paperStatus: PAPER_STATUS_OPTIONS,
  approvalStatus: APPROVAL_STATUS_OPTIONS,
  qcStatus: QC_STATUS_OPTIONS,
  workType: WORK_TYPE_OPTIONS,
}

export function getEmbroideryStatusLabel(
  field: EmbroideryStatusField,
  value?: string | null
) {
  if (!value) return "—"
  return FIELD_OPTIONS[field].find((o) => o.value === value)?.label ?? value
}
