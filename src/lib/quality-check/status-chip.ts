import { cn } from "@/lib/utils"

const STATUS_CLASS: Record<string, string> = {
  APPROVED:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  ALTERATIONS:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  DISCUSSION:
    "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
  REJECTED:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
  NA: "border-border bg-muted text-muted-foreground",
}

export function qualityCheckStatusChipClass(status?: string | null): string {
  const key = (status || "NA").toUpperCase()
  return cn(
    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide",
    STATUS_CLASS[key] ?? STATUS_CLASS.NA
  )
}
