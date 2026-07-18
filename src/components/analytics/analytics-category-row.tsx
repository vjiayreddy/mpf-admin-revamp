"use client"

import { Button } from "@/components/ui/button"
import { displayAnalyticsLabel } from "@/lib/analytics/build-analytics-filter"
import type { AnalyticsItem } from "@/lib/apollo/queries/analytics"
import { cn } from "@/lib/utils"

type AnalyticsCategoryRowProps = {
  item: AnalyticsItem
  onView: () => void
  showPercents?: boolean
  showTotal?: boolean
}

export function formatAnalyticsTotal(
  total: AnalyticsItem["total"]
): string | null {
  if (total == null || total === "") return null
  if (typeof total === "number") {
    if (total === 0) return null
    return total.toLocaleString()
  }
  const trimmed = String(total).trim()
  if (!trimmed || trimmed === "0" || trimmed === "0.00") return null
  return trimmed
}

export function AnalyticsCategoryRow({
  item,
  onView,
  showPercents,
  showTotal = true,
}: AnalyticsCategoryRowProps) {
  const totalLabel = formatAnalyticsTotal(item.total)

  return (
    <div
      className={cn(
        "hover:bg-muted/40 grid items-center gap-2 border-b px-3 py-2 last:border-b-0",
        showPercents && showTotal
          ? "grid-cols-[minmax(0,1.4fr)_4.5rem_5rem_minmax(5rem,0.7fr)_auto]"
          : showPercents
            ? "grid-cols-[minmax(0,1.4fr)_4.5rem_5rem_auto]"
            : showTotal
              ? "grid-cols-[minmax(0,1fr)_minmax(5rem,0.6fr)_auto]"
              : "grid-cols-[minmax(0,1fr)_auto]"
      )}
    >
      <p className="truncate text-sm font-medium">
        {displayAnalyticsLabel(item.label)}
        {item.value != null ? (
          <span className="text-muted-foreground font-normal">
            {" "}
            ({item.value})
          </span>
        ) : null}
      </p>
      {showPercents ? (
        <>
          <span className="text-muted-foreground text-center text-xs tabular-nums">
            {item.volumePercent != null ? `${item.volumePercent}%` : "—"}
          </span>
          <span className="text-muted-foreground text-center text-xs tabular-nums">
            {item.pricePercent != null ? `${item.pricePercent}%` : "—"}
          </span>
        </>
      ) : null}
      {showTotal ? (
        <span className="truncate text-right text-sm font-medium tabular-nums">
          {totalLabel ?? "—"}
        </span>
      ) : null}
      <Button
        type="button"
        size="xs"
        variant="default"
        className="justify-self-end"
        onClick={onView}
      >
        View
      </Button>
    </div>
  )
}
