/** URL + GraphQL filter keys for the ticket tracker list. */

export const TICKET_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  status: "status",
  priority: "priority",
  category: "category",
} as const

/** Status options for list filters (exclude Overdue — display-only via due date). */
export const TICKET_STATUS_OPTIONS = [
  { value: "Open", label: "Open" },
  { value: "Identified", label: "Identified" },
  { value: "In Development", label: "In Development" },
  { value: "In Testing", label: "In Testing" },
  { value: "Deployed", label: "Deployed" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
  { value: "Waiting For Reply", label: "Waiting For Reply" },
  { value: "Pending", label: "Pending" },
] as const

export const TICKET_PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
] as const

/** Filter/list category labels (API list often returns "Feature Request"). */
export const TICKET_CATEGORY_OPTIONS = [
  { value: "Bug", label: "Bug" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "Enhancement", label: "Enhancement" },
  { value: "Support", label: "Support" },
  { value: "Task", label: "Task" },
] as const

export const TICKET_TYPE_FORM_OPTIONS = [
  { value: "ISSUE", label: "Issue" },
  { value: "FEATURE_REQUEST", label: "Feature Request" },
] as const

/** Create form category values (API CreateTicketInput uses FeatureRequest). */
export const TICKET_CATEGORY_FORM_OPTIONS = [
  { value: "Bug", label: "Bug" },
  { value: "FeatureRequest", label: "Feature Request" },
  { value: "Enhancement", label: "Enhancement" },
  { value: "Support", label: "Support" },
  { value: "Task", label: "Task" },
] as const

export const TICKET_PRIORITY_FORM_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
] as const
