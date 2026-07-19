"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2Icon,
  PlayIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  HEALTH_CHECK_CATALOG,
  modulesWithChecks,
  type HealthCheckMeta,
} from "@/lib/health/catalog"
import type {
  HealthCheckResult,
  HealthModuleId,
  HealthRunSummary,
} from "@/lib/health/types"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

type CheckTone = "pass" | "fail" | "skipped" | "unknown" | "running"

const MODULE_GROUPS = modulesWithChecks()
const ALL_CHECK_IDS = HEALTH_CHECK_CATALOG.map((c) => c.id)

function resultFor(
  run: HealthRunSummary | null,
  checkId: string
): HealthCheckResult | undefined {
  return run?.results.find((r) => r.checkId === checkId)
}

function checkTone(
  run: HealthRunSummary | null,
  checkId: string,
  runningIds: Set<string> | "all" | null
): CheckTone {
  if (runningIds === "all" || runningIds?.has(checkId)) return "running"
  const row = resultFor(run, checkId)
  if (!row) return "unknown"
  if (row.skipped) return "skipped"
  if (!row.ok) return "fail"
  return "pass"
}

function moduleTone(
  run: HealthRunSummary | null,
  checks: HealthCheckMeta[],
  runningIds: Set<string> | "all" | null
): CheckTone {
  const tones = checks.map((c) => checkTone(run, c.id, runningIds))
  if (tones.some((t) => t === "running")) return "running"
  if (tones.some((t) => t === "fail")) return "fail"
  if (tones.every((t) => t === "skipped")) return "skipped"
  if (tones.every((t) => t === "unknown")) return "unknown"
  if (tones.every((t) => t === "pass" || t === "skipped")) return "pass"
  return "unknown"
}

function overallDot(run: HealthRunSummary | null, running: boolean) {
  if (running) return "bg-amber-500 animate-pulse"
  if (!run) return "bg-muted-foreground/40"
  if (run.ok) return "bg-emerald-500"
  return "bg-red-500"
}

function toneClass(tone: CheckTone) {
  switch (tone) {
    case "pass":
      return "text-emerald-600 dark:text-emerald-400"
    case "fail":
      return "text-red-600 dark:text-red-400"
    case "skipped":
      return "text-amber-700 dark:text-amber-400"
    case "running":
      return "text-amber-600"
    default:
      return "text-muted-foreground"
  }
}

function toneLabel(tone: CheckTone) {
  switch (tone) {
    case "pass":
      return "ok"
    case "fail":
      return "fail"
    case "skipped":
      return "skip"
    case "running":
      return "…"
    default:
      return "—"
  }
}

function checkboxToneClass(tone: CheckTone) {
  switch (tone) {
    case "pass":
      return "accent-emerald-600 border-emerald-600 text-emerald-600"
    case "fail":
      return "accent-red-600 border-red-600 text-red-600"
    case "skipped":
      return "accent-amber-600 border-amber-600 text-amber-700"
    case "running":
      return "accent-amber-500 border-amber-500 text-amber-600"
    default:
      return "accent-primary border-input"
  }
}

function initialExpanded(): Record<HealthModuleId, boolean> {
  const map = {} as Record<HealthModuleId, boolean>
  for (const mod of MODULE_GROUPS) map[mod.id] = true
  return map
}

export function HealthStatusPopover() {
  const [open, setOpen] = useState(false)
  const [run, setRun] = useState<HealthRunSummary | null>(null)
  const [history, setHistory] = useState<
    Array<{
      runId: string
      finishedAt: string
      ok: boolean
      passed: number
      failed: number
      ranBy: string | null
    }>
  >([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] =
    useState<Record<HealthModuleId, boolean>>(initialExpanded)
  const [runningIds, setRunningIds] = useState<Set<string> | "all" | null>(
    null
  )

  const running = runningIds !== null
  const allExpanded = MODULE_GROUPS.every((m) => expanded[m.id])

  const loadLast = useCallback(async () => {
    try {
      const res = await fetch("/api/health/run", { method: "GET" })
      if (!res.ok) return
      const data = (await res.json()) as {
        lastRun?: HealthRunSummary | null
        history?: Array<{
          runId: string
          finishedAt: string
          ok: boolean
          passed: number
          failed: number
          ranBy: string | null
        }>
      }
      if (data.lastRun) setRun(data.lastRun)
      if (data.history) setHistory(data.history.slice(0, 5))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (open) void loadLast()
  }, [open, loadLast])

  const selectAll = useCallback(() => {
    setSelected(new Set(ALL_CHECK_IDS))
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
  }, [])

  const expandAll = useCallback(() => {
    setExpanded(initialExpanded())
  }, [])

  const collapseAll = useCallback(() => {
    const map = {} as Record<HealthModuleId, boolean>
    for (const mod of MODULE_GROUPS) map[mod.id] = false
    setExpanded(map)
  }, [])

  const runRequest = useCallback(
    async (body: { modules?: HealthModuleId[]; checkIds?: string[] }) => {
      const ids =
        body.checkIds ??
        (body.modules
          ? MODULE_GROUPS.filter((m) => body.modules!.includes(m.id)).flatMap(
              (m) => m.checks.map((c) => c.id)
            )
          : null)

      setRunningIds(ids ? new Set(ids) : "all")
      try {
        const res = await fetch("/api/health/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const data = (await res.json()) as HealthRunSummary & { error?: string }
        if (!res.ok && !data.results) {
          notify.error(data.error ?? "Health run failed")
          return
        }
        setRun(data)
        void loadLast()
        if (data.ok) {
          notify.success(
            `Health OK · ${data.passed} passed` +
              (data.skipped ? ` · ${data.skipped} skip` : "")
          )
        } else {
          notify.error(`Health · ${data.failed} failed`)
        }
      } catch (err) {
        notify.fromError(err, "Health run failed")
      } finally {
        setRunningIds(null)
      }
    },
    [loadLast]
  )

  const handleRunAll = useCallback(() => {
    selectAll()
    expandAll()
    void runRequest({})
  }, [selectAll, expandAll, runRequest])

  const toggleCheck = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleModule = useCallback((moduleId: HealthModuleId) => {
    const ids = MODULE_GROUPS.find((m) => m.id === moduleId)?.checks.map(
      (c) => c.id
    )
    if (!ids?.length) return
    setSelected((prev) => {
      const next = new Set(prev)
      const allOn = ids.every((id) => next.has(id))
      if (allOn) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }, [])

  const toggleExpanded = useCallback((moduleId: HealthModuleId) => {
    setExpanded((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }, [])

  const selectedList = useMemo(() => Array.from(selected), [selected])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="System health"
        className={cn(
          "hover:bg-muted relative inline-flex size-8 items-center justify-center rounded-lg",
          "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        )}
      >
        <ActivityIcon className="size-4" />
        <span
          className={cn(
            "absolute top-1.5 right-1.5 size-1.5 rounded-full",
            overallDot(run, running)
          )}
          aria-hidden
        />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] p-0" sideOffset={6}>
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium">System health</p>
            <p className="text-muted-foreground truncate text-[11px]">
              {run
                ? `${new Date(run.finishedAt).toLocaleTimeString()} · ${run.durationMs}ms`
                : "Test each API endpoint"}
            </p>
          </div>
          <Button
            type="button"
            size="xs"
            disabled={running}
            onClick={handleRunAll}
          >
            {runningIds === "all" ? (
              <Loader2Icon className="size-3 animate-spin" />
            ) : (
              <PlayIcon className="size-3" />
            )}
            Run all
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-b px-3 py-1.5">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-6 px-1.5 text-[10px]"
            disabled={running}
            onClick={allExpanded ? collapseAll : expandAll}
          >
            {allExpanded ? "Hide all" : "Show all"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-6 px-1.5 text-[10px]"
            disabled={running}
            onClick={selectAll}
          >
            Select all
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="h-6 px-1.5 text-[10px]"
            disabled={running || selectedList.length === 0}
            onClick={clearSelection}
          >
            Clear selection
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {MODULE_GROUPS.map((mod) => {
            const mTone = moduleTone(run, mod.checks, runningIds)
            const moduleCheckIds = mod.checks.map((c) => c.id)
            const allSelected = moduleCheckIds.every((id) => selected.has(id))
            const someSelected =
              !allSelected && moduleCheckIds.some((id) => selected.has(id))
            const isOpen = expanded[mod.id] !== false

            return (
              <div key={mod.id} className="border-b last:border-b-0">
                <div className="bg-muted/40 flex items-center gap-1.5 px-2 py-1.5">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground inline-flex size-5 shrink-0 items-center justify-center rounded"
                    aria-expanded={isOpen}
                    aria-label={
                      isOpen
                        ? `Hide ${mod.label} endpoints`
                        : `Show ${mod.label} endpoints`
                    }
                    onClick={() => toggleExpanded(mod.id)}
                  >
                    {isOpen ? (
                      <ChevronDownIcon className="size-3.5" />
                    ) : (
                      <ChevronRightIcon className="size-3.5" />
                    )}
                  </button>
                  <input
                    type="checkbox"
                    className={cn(
                      "size-3.5 shrink-0 rounded-sm border",
                      checkboxToneClass(mTone)
                    )}
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    disabled={running}
                    onChange={() => toggleModule(mod.id)}
                    aria-label={`Select all ${mod.label} endpoints`}
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-xs font-semibold"
                    onClick={() => toggleExpanded(mod.id)}
                  >
                    {mod.label}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · {mod.checks.length}
                    </span>
                  </button>
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      toneClass(mTone)
                    )}
                  >
                    {toneLabel(mTone)}
                  </span>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    disabled={running}
                    aria-label={`Run all ${mod.label} endpoints`}
                    onClick={() => {
                      setSelected((prev) => {
                        const next = new Set(prev)
                        moduleCheckIds.forEach((id) => next.add(id))
                        return next
                      })
                      setExpanded((prev) => ({ ...prev, [mod.id]: true }))
                      void runRequest({ modules: [mod.id] })
                    }}
                  >
                    {runningIds !== "all" &&
                    runningIds &&
                    moduleCheckIds.every((id) => runningIds.has(id)) &&
                    moduleCheckIds.length === runningIds.size ? (
                      <Loader2Icon className="size-3 animate-spin" />
                    ) : (
                      <PlayIcon className="size-3" />
                    )}
                  </Button>
                </div>

                {isOpen ? (
                  <ul>
                    {mod.checks.map((check) => {
                      const tone = checkTone(run, check.id, runningIds)
                      const row = resultFor(run, check.id)
                      return (
                        <li
                          key={check.id}
                          className="hover:bg-muted/50 flex items-start gap-2 py-1.5 pr-3 pl-12"
                        >
                          <input
                            type="checkbox"
                            className={cn(
                              "mt-0.5 size-3.5 shrink-0 rounded-sm border",
                              checkboxToneClass(tone)
                            )}
                            checked={selected.has(check.id)}
                            disabled={running}
                            onChange={() => toggleCheck(check.id)}
                            aria-label={`Select ${check.name}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium leading-tight">
                                  {check.name}
                                  {check.optional ? (
                                    <span className="text-muted-foreground font-normal">
                                      {" "}
                                      · opt
                                    </span>
                                  ) : null}
                                </p>
                                <p className="text-muted-foreground truncate font-mono text-[10px]">
                                  {check.endpoint}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 text-[10px] tabular-nums",
                                  toneClass(tone)
                                )}
                              >
                                {toneLabel(tone)}
                                {row && tone !== "running"
                                  ? ` · ${row.durationMs}ms`
                                  : ""}
                              </span>
                            </div>
                            {tone === "fail" &&
                            (row?.error || row?.detail) ? (
                              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[10px] break-all">
                                {row.error ?? row.detail}
                              </p>
                            ) : null}
                          </div>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="mt-0.5 shrink-0"
                            disabled={running}
                            aria-label={`Run ${check.name}`}
                            onClick={() => {
                              setSelected((prev) => new Set(prev).add(check.id))
                              void runRequest({ checkIds: [check.id] })
                            }}
                          >
                            {runningIds !== "all" &&
                            runningIds?.has(check.id) &&
                            runningIds.size === 1 ? (
                              <Loader2Icon className="size-3 animate-spin" />
                            ) : (
                              <PlayIcon className="size-3" />
                            )}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            )
          })}
        </div>

        {history.length > 0 ? (
          <div className="border-t px-3 py-2">
            <p className="text-muted-foreground mb-1 text-[10px] font-medium tracking-wide uppercase">
              Saved reports
            </p>
            <ul className="space-y-0.5">
              {history.map((h) => (
                <li
                  key={h.runId}
                  className="flex items-center justify-between gap-2 text-[10px]"
                >
                  <span className="text-muted-foreground truncate">
                    {new Date(h.finishedAt).toLocaleString()}
                    {h.ranBy ? ` · ${h.ranBy}` : ""}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 tabular-nums",
                      h.ok
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {h.ok ? "ok" : "fail"} · {h.passed}/{h.passed + h.failed}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={running || selectedList.length === 0}
            onClick={() => void runRequest({ checkIds: selectedList })}
          >
            {runningIds !== "all" &&
            runningIds &&
            selectedList.length > 0 &&
            selectedList.every((id) => runningIds.has(id)) ? (
              <Loader2Icon className="size-3 animate-spin" />
            ) : (
              <PlayIcon className="size-3" />
            )}
            Run selected
            {selectedList.length > 0 ? ` (${selectedList.length})` : ""}
          </Button>
          {run ? (
            <span className="text-muted-foreground text-[10px]">
              {run.passed} ok · {run.failed} fail · {run.skipped} skip
            </span>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
