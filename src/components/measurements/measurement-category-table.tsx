"use client"

import { useMemo } from "react"

import { formatMeasurementValue } from "@/lib/measurements/format-measurement-value"
import { buildOptionMap } from "@/lib/measurements/has-measurement-options"
import type {
  MeasurementLayoutRow,
  MeasurementOption,
} from "@/lib/measurements/types"
import { cn } from "@/lib/utils"

export type MeasurementCategoryTableProps = {
  title?: string
  rows: MeasurementLayoutRow[]
  options?: MeasurementOption[] | null
  className?: string
}

export function MeasurementCategoryTable({
  title,
  rows,
  options,
  className,
}: MeasurementCategoryTableProps) {
  const optionMap = useMemo(() => buildOptionMap(options), [options])

  if (!rows.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No measurement layout available for this category.
      </p>
    )
  }

  const colCount = Math.max(...rows.map((r) => r.length), 1)

  return (
    <div className={cn("space-y-2", className)}>
      {title ? (
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      ) : null}
      <div className="overflow-x-auto rounded-lg border">
        <table className="measurement-table w-full border-collapse text-center text-xs">
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={cn(
                  rowIdx % 2 === 0 ? "bg-background" : "bg-muted/40"
                )}
              >
                {row.map((field) => {
                  const opt = optionMap.get(field.name)
                  return (
                    <td
                      key={field.name}
                      className="border-border border px-2 py-2 align-top"
                    >
                      <div className="text-muted-foreground mb-0.5 font-medium">
                        {field.label}
                      </div>
                      <div className="text-foreground font-semibold">
                        {formatMeasurementValue(opt?.value)}
                      </div>
                    </td>
                  )
                })}
                {/* Pad short rows so columns align */}
                {row.length < colCount
                  ? Array.from({ length: colCount - row.length }).map(
                      (_, i) => (
                        <td
                          key={`pad-${rowIdx}-${i}`}
                          className="border-border border px-2 py-2"
                        />
                      )
                    )
                  : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
