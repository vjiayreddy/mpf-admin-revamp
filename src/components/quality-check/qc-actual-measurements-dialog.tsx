"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  GET_USER_MEASUREMENTS,
  type GetUserMeasurementsData,
  type GetUserMeasurementsVars,
} from "@/lib/apollo/queries/measurements"
import { formatMeasurementValue } from "@/lib/measurements/format-measurement-value"
import { buildOptionMap } from "@/lib/measurements/has-measurement-options"
import { resolveQcCompareLayout } from "@/lib/quality-check/compare-registry"
import { computeQcDifference } from "@/lib/quality-check/helpers"
import { cn } from "@/lib/utils"

export type QcActualMeasurementsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  catId: string
  /** Current draft actual values keyed by actualKey. */
  initialByKey: Record<string, string>
  onApply: (byKey: Record<string, string>) => void
}

export function QcActualMeasurementsDialog({
  open,
  onOpenChange,
  userId,
  catId,
  initialByKey,
  onApply,
}: QcActualMeasurementsDialogProps) {
  const [draft, setDraft] = useState<Record<string, string>>({})

  const canFetch = open && Boolean(userId && catId)

  const { data, loading, error } = useQuery<
    GetUserMeasurementsData,
    GetUserMeasurementsVars
  >(GET_USER_MEASUREMENTS, {
    variables: { userId, catId, page: 1, limit: 1 },
    skip: !canFetch,
    fetchPolicy: "network-only",
  })

  const measurement = data?.getUserMeasurements?.[0] ?? null
  const options = measurement?.options ?? null
  const rows = useMemo(
    () => resolveQcCompareLayout(catId, options),
    [catId, options]
  )
  const optionMap = useMemo(() => buildOptionMap(options), [options])

  useEffect(() => {
    if (!open) return
    setDraft({ ...initialByKey })
    // Sync draft only when the dialog opens, not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [open])

  const displayOption = (name?: string | null) => {
    if (!name) return "—"
    return formatMeasurementValue(optionMap.get(name)?.value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Actual measurements</DialogTitle>
          <DialogDescription>
            Enter actual (B) values. Difference is ready/body baseline minus
            actual.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {loading ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading measurements…
            </p>
          ) : null}
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              Failed to load saved measurements for this category.
            </p>
          ) : null}
          {!loading && !error && !measurement ? (
            <p className="text-muted-foreground text-sm">
              No measurements found. Add measurements for this category and try
              again.
            </p>
          ) : null}
          {!loading && measurement && rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No QC measurement layout for this category.
            </p>
          ) : null}

          {rows.length > 0 ? (
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
                    const raw = draft[row.actualKey] ?? ""
                    const actualNum =
                      raw.trim() === "" ? null : Number(raw.trim())
                    const diffBaseName = row.diffBase || row.ready || row.body
                    const baseline = diffBaseName
                      ? optionMap.get(diffBaseName)?.value
                      : null
                    const diff = computeQcDifference(
                      baseline,
                      actualNum != null && Number.isFinite(actualNum)
                        ? actualNum
                        : null
                    )

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
                          {displayOption(row.body)}
                        </td>
                        <td className="border-border border px-2 py-1.5">
                          {displayOption(row.loosening)}
                        </td>
                        <td className="border-border border px-2 py-1.5">
                          {displayOption(row.ready)}
                        </td>
                        <td className="border-border border px-2 py-1.5">
                          {displayOption(row.front)}
                        </td>
                        <td className="border-border border px-2 py-1.5">
                          {displayOption(row.back)}
                        </td>
                        <td className="border-border bg-sky-50/50 border px-2 py-1 dark:bg-sky-950/30">
                          <Input
                            type="number"
                            step="any"
                            className="mx-auto h-7 w-20 text-center text-xs"
                            value={raw}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                [row.actualKey]: e.target.value,
                              }))
                            }
                            aria-label={`${row.label} actual`}
                          />
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
          ) : null}
        </div>

        <DialogFooter className="border-t px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || rows.length === 0}
            onClick={() => {
              onApply(draft)
              onOpenChange(false)
            }}
          >
            Apply measurements
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
