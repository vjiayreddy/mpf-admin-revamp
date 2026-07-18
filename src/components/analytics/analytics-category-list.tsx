"use client"

import { useMemo } from "react"

import {
  AnalyticsCategoryRow,
  formatAnalyticsTotal,
} from "@/components/analytics/analytics-category-row"
import { AnalyticsDrillDownDialog } from "@/components/analytics/analytics-drill-down-dialog"
import type { AnalyticsItem } from "@/lib/apollo/queries/analytics"
import { cn } from "@/lib/utils"

type DrillProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  loading?: boolean
  rows: Parameters<typeof AnalyticsDrillDownDialog>[0]["rows"]
  totalCount?: number | null
  page: number
  onPageChange: (page: number) => void
  pageSize?: number
}

type AnalyticsCategoryListProps = {
  items: AnalyticsItem[]
  onView: (item: AnalyticsItem) => void
  showPercents?: boolean
  emptyLabel?: string
  drill: DrillProps
}

export function AnalyticsCategoryList({
  items,
  onView,
  showPercents,
  emptyLabel = "No items in this tab.",
  drill,
}: AnalyticsCategoryListProps) {
  const showTotal = useMemo(
    () => items.some((item) => formatAnalyticsTotal(item.total) != null),
    [items]
  )

  return (
    <>
      {items.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          {emptyLabel}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div
            className={cn(
              "bg-muted/50 text-muted-foreground grid gap-2 border-b px-3 py-2 text-xs font-medium tracking-wide uppercase",
              showPercents && showTotal
                ? "grid-cols-[minmax(0,1.4fr)_4.5rem_5rem_minmax(5rem,0.7fr)_auto]"
                : showPercents
                  ? "grid-cols-[minmax(0,1.4fr)_4.5rem_5rem_auto]"
                  : showTotal
                    ? "grid-cols-[minmax(0,1fr)_minmax(5rem,0.6fr)_auto]"
                    : "grid-cols-[minmax(0,1fr)_auto]"
            )}
          >
            <span>Category</span>
            {showPercents ? (
              <>
                <span className="text-center">Vol</span>
                <span className="text-center">Price</span>
              </>
            ) : null}
            {showTotal ? <span className="text-right">Total</span> : null}
            <span className="w-14 justify-self-end text-right"> </span>
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            {items.map((item) => (
              <AnalyticsCategoryRow
                key={item.label}
                item={item}
                showPercents={showPercents}
                showTotal={showTotal}
                onView={() => onView(item)}
              />
            ))}
          </div>
        </div>
      )}
      <AnalyticsDrillDownDialog {...drill} />
    </>
  )
}
