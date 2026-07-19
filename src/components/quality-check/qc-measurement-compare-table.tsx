"use client"

import { useMemo } from "react"

import { formatMeasurementValue } from "@/lib/measurements/format-measurement-value"
import { buildOptionMap } from "@/lib/measurements/has-measurement-options"
import type { MeasurementOption } from "@/lib/measurements/types"
import {
  buildActualMeasurementMap,
  computeQcDifference,
} from "@/lib/quality-check/helpers"
import type {
  QcActualMeasurement,
  QcCompareField,
} from "@/lib/quality-check/types"
import { cn } from "@/lib/utils"

export type QcMeasurementCompareTableProps = {
  rows: QcCompareField[]
  options?: MeasurementOption[] | null
  actualMeasurement?: QcActualMeasurement[] | null
  className?: string
}

function displayOptionValue(
  optionMap: Map<string, MeasurementOption>,
  name?: string | null
): string {
  if (!name) return "—"
  return formatMeasurementValue(optionMap.get(name)?.value)
}

export function QcMeasurementCompareTable({
  rows,
  options,
  actualMeasurement,
  className,
}: QcMeasurementCompareTableProps) {
  const optionMap = useMemo(() => buildOptionMap(options), [options])
  const actualMap = useMemo(
    () => buildActualMeasurementMap(actualMeasurement),
    [actualMeasurement]
  )

  if (!rows.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No QC measurement layout for this category.
      </p>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold tracking-tight">
        Measurement comparison
      </h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] border-collapse text-center text-[11px]">
          <thead>
            <tr className="bg-sky-100/80 dark:bg-sky-950/40">
              <th className="border-border border px-2 py-2 text-left font-semibold">
                Measurement
              </th>
              <th className="border-border border px-2 py-2 font-semibold">
                Body
              </th>
              <th className="border-border border px-2 py-2 font-semibold">
                Loosening
              </th>
              <th className="border-border border px-2 py-2 font-semibold">
                Ready (A)
              </th>
              <th className="border-border border px-2 py-2 font-semibold">
                Front
              </th>
              <th className="border-border border px-2 py-2 font-semibold">
                Back
              </th>
              <th className="border-border bg-sky-50 border px-2 py-2 font-semibold dark:bg-sky-950/60">
                Actual (B)
              </th>
              <th className="border-border border px-2 py-2 font-semibold">
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const actual = actualMap.get(row.actualKey)
              const diffBaseName = row.diffBase || row.ready || row.body
              const baseline = diffBaseName
                ? optionMap.get(diffBaseName)?.value
                : null
              const diff = computeQcDifference(baseline, actual ?? null)

              return (
                <tr
                  key={`${row.actualKey}-${idx}`}
                  className={cn(
                    idx % 2 === 0 ? "bg-background" : "bg-muted/30"
                  )}
                >
                  <td className="border-border border px-2 py-1.5 text-left font-medium">
                    {row.label}
                  </td>
                  <td className="border-border border px-2 py-1.5">
                    {displayOptionValue(optionMap, row.body)}
                  </td>
                  <td className="border-border border px-2 py-1.5">
                    {displayOptionValue(optionMap, row.loosening)}
                  </td>
                  <td className="border-border border px-2 py-1.5">
                    {displayOptionValue(optionMap, row.ready)}
                  </td>
                  <td className="border-border border px-2 py-1.5">
                    {displayOptionValue(optionMap, row.front)}
                  </td>
                  <td className="border-border border px-2 py-1.5">
                    {displayOptionValue(optionMap, row.back)}
                  </td>
                  <td className="border-border bg-sky-50/50 border px-2 py-1.5 font-semibold dark:bg-sky-950/30">
                    {actual != null ? formatMeasurementValue(actual) : "—"}
                  </td>
                  <td className="border-border border px-2 py-1.5">
                    {diff != null ? formatMeasurementValue(diff) : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
