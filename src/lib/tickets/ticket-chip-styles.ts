/** Badge tone helpers for ticket status / priority / category chips. */

export type TicketChipTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "secondary"

const STATUS_TONE: Record<string, TicketChipTone> = {
  Open: "info",
  Identified: "info",
  "In Development": "warning",
  "In Testing": "secondary",
  Deployed: "success",
  Resolved: "success",
  Closed: "secondary",
  "Waiting For Reply": "warning",
  Pending: "secondary",
  Overdue: "destructive",
}

const PRIORITY_TONE: Record<string, TicketChipTone> = {
  Low: "success",
  Medium: "warning",
  High: "warning",
  Critical: "destructive",
}

const CATEGORY_TONE: Record<string, TicketChipTone> = {
  Bug: "destructive",
  "Feature Request": "info",
  FeatureRequest: "info",
  Enhancement: "info",
  Support: "success",
  Task: "secondary",
}

const TONE_CLASS: Record<TicketChipTone, string> = {
  default: "bg-muted text-foreground",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  destructive: "bg-destructive/15 text-destructive",
  secondary: "bg-muted text-muted-foreground",
}

export function ticketStatusTone(status?: string | null): TicketChipTone {
  if (!status) return "default"
  return STATUS_TONE[status] ?? "default"
}

export function ticketPriorityTone(priority?: string | null): TicketChipTone {
  if (!priority) return "default"
  return PRIORITY_TONE[priority] ?? "default"
}

export function ticketCategoryTone(category?: string | null): TicketChipTone {
  if (!category) return "default"
  return CATEGORY_TONE[category] ?? "default"
}

export function ticketChipClass(tone: TicketChipTone): string {
  return TONE_CLASS[tone]
}
