import { cn } from "@/lib/utils"

/** Soft chip colors for production status values. */
export function productionStatusChipClass(status?: string | null): string {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
    case "IN_PROGRESS":
      return "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
    case "URGENT":
      return "mpf-status-alert border-red-200 bg-red-50 hover:bg-red-100"
    case "ISSUE":
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
    default:
      return "border-border bg-muted text-foreground hover:bg-muted/80"
  }
}

export function productionStatusChipButtonClass(status?: string | null): string {
  return cn(
    "inline-flex h-7 max-w-full items-center truncate rounded-full border px-2.5 text-xs font-medium",
    productionStatusChipClass(status)
  )
}
