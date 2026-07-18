import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

type AnalyticsSectionCardProps = {
  title: string
  loading?: boolean
  error?: string | null
  empty?: boolean
  filterChips?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function AnalyticsSectionCard({
  title,
  loading,
  error,
  empty,
  filterChips,
  actions,
  className,
  children,
}: AnalyticsSectionCardProps) {
  return (
    <section className={cn("bg-card rounded-lg border", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {filterChips}
        <div className="flex-1" />
        {actions}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-muted-foreground flex min-h-[160px] items-center justify-center gap-2 text-sm">
            <Loader2Icon className="size-4 animate-spin" />
            Loading…
          </div>
        ) : null}
        {!loading && error ? (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}
        {!loading && !error && empty ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No analytics for this range.
          </p>
        ) : null}
        {!loading && !error && !empty ? children : null}
      </div>
    </section>
  )
}
