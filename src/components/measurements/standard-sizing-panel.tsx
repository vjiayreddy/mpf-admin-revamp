"use client"

import { useMemo, useState } from "react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { MEASUREMENT_CATEGORY_LIST } from "@/config/measurement-categories"
import {
  GET_STANDARD_SIZE_CHART,
  GET_USER_STANDARD_SIZING,
  SAVE_USER_STANDARD_SIZING,
  type GetStandardSizeChartData,
  type GetStandardSizeChartVars,
  type GetUserStandardSizingData,
  type GetUserStandardSizingVars,
  type SaveUserStandardSizingData,
  type SaveUserStandardSizingVars,
  type StandardSizeChartRow,
  type UserStandardSizingRow,
} from "@/lib/apollo/queries/standard-sizing"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type StandardSizingPanelProps = {
  userId: string
}

export function StandardSizingPanel({ userId }: StandardSizingPanelProps) {
  const [catId, setCatId] = useState(MEASUREMENT_CATEGORY_LIST[0]?.value ?? "")
  const [size, setSize] = useState("")
  const [note, setNote] = useState("")
  const [optionEdits, setOptionEdits] = useState<Record<string, string>>({})
  const [existingId, setExistingId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  const { data: userSizingData, loading: loadingUserSizing, refetch } = useQuery<
    GetUserStandardSizingData,
    GetUserStandardSizingVars
  >(GET_USER_STANDARD_SIZING, {
    variables: { userId, page: 1, limit: 100 },
    fetchPolicy: "network-only",
  })

  const [fetchChart, { data: chartData, loading: loadingChart }] = useLazyQuery<
    GetStandardSizeChartData,
    GetStandardSizeChartVars
  >(GET_STANDARD_SIZE_CHART, { fetchPolicy: "network-only" })

  const [saveSizing, { loading: saving }] = useMutation<
    SaveUserStandardSizingData,
    SaveUserStandardSizingVars
  >(SAVE_USER_STANDARD_SIZING)

  const userRows = useMemo(
    () => userSizingData?.getUserStandardSizing ?? [],
    [userSizingData?.getUserStandardSizing]
  )
  const chartRows = useMemo(
    () => chartData?.getStandardSizeChart ?? [],
    [chartData?.getStandardSizeChart]
  )

  const categoryName = useMemo(
    () =>
      MEASUREMENT_CATEGORY_LIST.find((c) => c.value === catId)?.name ?? catId,
    [catId]
  )

  useEffect(() => {
    if (!catId) return
    void fetchChart({ variables: { catIds: [catId] } })
  }, [catId, fetchChart])

  useEffect(() => {
    const existing = userRows.find((r) => r.catId === catId)
    const nextId = existing?._id ?? undefined
    const nextSize = existing?.size ?? ""
    const nextNote = existing?.note ?? ""
    const nextEdits: Record<string, string> = {}
    for (const opt of existing?.modifiedOptions ?? []) {
      if (opt.name) nextEdits[opt.name] = String(opt.value ?? "")
    }

    setExistingId((prev) => (prev === nextId ? prev : nextId))
    setSize((prev) => (prev === nextSize ? prev : nextSize))
    setNote((prev) => (prev === nextNote ? prev : nextNote))
    setOptionEdits((prev) => {
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(nextEdits)
      if (
        prevKeys.length === nextKeys.length &&
        nextKeys.every((k) => prev[k] === nextEdits[k])
      ) {
        return prev
      }
      return nextEdits
    })
  }, [catId, userRows])

  const chartForSize: StandardSizeChartRow | null = useMemo(() => {
    if (!chartRows.length) return null
    if (size) {
      return chartRows.find((r) => r.size === size) ?? chartRows[0] ?? null
    }
    return chartRows[0] ?? null
  }, [chartRows, size])

  const sizes = useMemo(() => {
    const set = new Set<string>()
    for (const row of chartRows) {
      if (row.size) set.add(row.size)
    }
    return Array.from(set)
  }, [chartRows])

  const onSave = async () => {
    setError(null)
    try {
      const modifiedOptions = Object.entries(optionEdits)
        .filter(([, v]) => v.trim() !== "")
        .map(([name, value]) => ({ name, value }))

      const isUpdate = Boolean(existingId)
      await saveSizing({
        variables: {
          body: [
            {
              userId,
              catId,
              size: size || chartForSize?.size || undefined,
              label: categoryName,
              note: note || undefined,
              modifiedOptions,
              ...(existingId ? { _id: existingId } : {}),
            },
          ],
        },
      })
      notify.success(
        isUpdate ? "Standard sizing updated" : "Standard sizing saved"
      )
      await refetch()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save standard sizing"
      setError(msg)
      notify.fromError(err, "Failed to save standard sizing")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Standard sizing
        </h2>
        <p className="text-muted-foreground text-sm">
          View master size charts and save customer-specific option overrides.
        </p>
      </div>

      <div className="bg-card grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ss-cat">Category</Label>
          <select
            id="ss-cat"
            className={selectClass}
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
          >
            {MEASUREMENT_CATEGORY_LIST.map((c) => (
              <option key={c.value} value={c.value}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-size">Size</Label>
          <select
            id="ss-size"
            className={selectClass}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">Select size</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ss-note">Note</Label>
          <Textarea
            id="ss-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {(loadingChart || loadingUserSizing) && !chartForSize ? (
        <Skeleton className="h-40 w-full" />
      ) : null}

      {chartForSize ? (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-semibold">
            Chart options · {chartForSize.label || categoryName} ·{" "}
            {chartForSize.size || size || "—"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(chartForSize.options ?? []).map((opt) => {
              const name = opt.name || ""
              if (!name) return null
              return (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={`opt-${name}`}>{name}</Label>
                  <Input
                    id={`opt-${name}`}
                    placeholder={String(opt.value ?? "")}
                    value={optionEdits[name] ?? ""}
                    onChange={(e) =>
                      setOptionEdits((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Master: {opt.value ?? "—"}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No master size chart found for this category.
        </p>
      )}

      {userRows.length > 0 ? (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="mb-2 text-sm font-semibold">Saved for customer</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            {userRows.map((row: UserStandardSizingRow) => (
              <li key={row._id ?? `${row.catId}-${row.size}`}>
                {MEASUREMENT_CATEGORY_LIST.find((c) => c.value === row.catId)
                  ?.name ?? row.catId}{" "}
                · size {row.size || "—"}
                {row.catId === catId ? " (editing)" : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" disabled={saving || !catId} onClick={() => void onSave()}>
          {saving ? "Saving…" : existingId ? "Update sizing" : "Save sizing"}
        </Button>
      </div>
    </div>
  )
}
