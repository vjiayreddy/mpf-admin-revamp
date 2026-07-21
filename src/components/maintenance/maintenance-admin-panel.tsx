"use client"

import { useCallback, useEffect, useState } from "react"
import {
  CircleCheckIcon,
  ConstructionIcon,
  Loader2Icon,
  MegaphoneIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
} from "lucide-react"

import { useMaintenance } from "@/components/maintenance/maintenance-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatMaintenanceWhen } from "@/lib/maintenance/format"
import {
  DEFAULT_ACTIVE_MESSAGE,
  DEFAULT_MAINTENANCE_MESSAGE,
  type MaintenancePhase,
  type MaintenancePostBody,
  type MaintenanceState,
} from "@/lib/maintenance/types"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

async function postMaintenance(
  body: MaintenancePostBody
): Promise<MaintenanceState> {
  const res = await fetch("/api/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(err?.error || "Request failed")
  }
  return (await res.json()) as MaintenanceState
}

const STATUS_META: Record<
  MaintenancePhase,
  { label: string; hint: string; className: string; dot: string }
> = {
  idle: {
    label: "Idle",
    hint: "Portal is open for everyone",
    className: "border-border bg-muted/40 text-foreground",
    dot: "bg-emerald-500",
  },
  upcoming: {
    label: "Warning live",
    hint: "Countdown notice is showing on open sessions",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
    dot: "bg-amber-500",
  },
  active: {
    label: "Locked",
    hint: "Full-screen maintenance lock is active",
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100",
    dot: "bg-rose-500",
  },
}

export function MaintenanceAdminPanel() {
  const { state, refresh, applyState } = useMaintenance()
  const [minutes, setMinutes] = useState("30")
  const [duration, setDuration] = useState("60")
  const [scheduleMessage, setScheduleMessage] = useState(
    DEFAULT_MAINTENANCE_MESSAGE
  )
  const [activeMessage, setActiveMessage] = useState(DEFAULT_ACTIVE_MESSAGE)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!state) return
    if (state.message) {
      if (state.status === "active") setActiveMessage(state.message)
      if (state.status === "upcoming") setScheduleMessage(state.message)
    }
  }, [state])

  const run = useCallback(
    async (body: MaintenancePostBody, success: string) => {
      setBusy(true)
      try {
        const next = await postMaintenance(body)
        // Close lock/warning immediately on this client (and Ably/poll for others).
        applyState(next)
        notify.success(success)
      } catch (err) {
        notify.fromError(err, "Maintenance update failed")
        await refresh()
      } finally {
        setBusy(false)
      }
    },
    [applyState, refresh]
  )

  const status = state?.status ?? "idle"
  const meta = STATUS_META[status]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.16em] uppercase">
            System
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Warn every open admin session before a deploy, then lock the portal
            until work is done.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 self-start sm:self-auto"
          disabled={busy}
          onClick={() => void refresh()}
        >
          <RefreshCwIcon className="size-3.5" />
          Refresh
        </Button>
      </header>

      {/* Status hero */}
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5 sm:p-6",
          meta.className
        )}
      >
        <div
          className="pointer-events-none absolute -top-20 -right-16 size-48 rounded-full bg-current opacity-[0.06] blur-3xl"
          aria-hidden
        />
        {!state ? (
          <p className="flex items-center gap-2 text-sm opacity-80">
            <Loader2Icon className="size-4 animate-spin" />
            Loading status…
          </p>
        ) : (
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-current/15 bg-background/50 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-sm">
                <span className="relative flex size-2">
                  <span
                    className={cn(
                      "absolute inline-flex size-full rounded-full opacity-60",
                      status !== "idle" && "animate-ping",
                      meta.dot
                    )}
                  />
                  <span
                    className={cn("relative inline-flex size-2 rounded-full", meta.dot)}
                  />
                </span>
                {meta.label}
              </span>
              {state.forceActive ? (
                <span className="text-[11px] font-medium tracking-wide uppercase opacity-70">
                  Env force active
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium opacity-90">{meta.hint}</p>
            {state.message ? (
              <p className="max-w-2xl text-sm leading-relaxed opacity-75">
                {state.message}
              </p>
            ) : null}
            <div className="grid gap-3 pt-1 text-xs sm:grid-cols-2">
              <MetaRow
                label="Starts"
                value={formatMaintenanceWhen(state.startsAt) ?? "—"}
              />
              <MetaRow
                label="Estimated end"
                value={formatMaintenanceWhen(state.endsAtEstimate) ?? "—"}
              />
            </div>
          </div>
        )}
      </section>

      {/* Steps */}
      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
        <StepHint n={1} title="Warn" active={status === "idle"} />
        <StepHint n={2} title="Lock" active={status === "upcoming"} />
        <StepHint n={3} title="Unlock" active={status === "active"} />
      </div>

      <section className="bg-card space-y-5 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="flex items-start gap-3">
          <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
            <MegaphoneIcon className="size-5 text-foreground/80" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              1. Schedule warning
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
              Shows a countdown on every admin device. Sessions lock
              automatically when time is up.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="maint-minutes">Minutes until start</Label>
            <Input
              id="maint-minutes"
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              disabled={busy}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maint-duration">Estimated duration (min)</Label>
            <Input
              id="maint-duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={busy}
              className="h-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maint-schedule-msg">Message to staff</Label>
          <Textarea
            id="maint-schedule-msg"
            rows={3}
            value={scheduleMessage}
            onChange={(e) => setScheduleMessage(e.target.value)}
            disabled={busy}
            className="resize-none"
          />
        </div>
        <Button
          type="button"
          disabled={busy}
          className="gap-1.5"
          onClick={() =>
            void run(
              {
                action: "schedule",
                minutesUntilStart: Number(minutes) || 30,
                message: scheduleMessage,
                estimatedDurationMinutes: Number(duration) || undefined,
              },
              "Maintenance warning scheduled"
            )
          }
        >
          <MegaphoneIcon className="size-3.5" />
          Schedule warning
        </Button>
      </section>

      <section className="bg-card space-y-5 rounded-2xl border p-5 shadow-xs sm:p-6">
        <div className="flex items-start gap-3">
          <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
            <ShieldAlertIcon className="text-foreground/80 size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              2–3. Lock & unlock
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
              Lock immediately for an emergency deploy, or end maintenance when
              the portal is ready again.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maint-active-msg">Lock screen message</Label>
          <Textarea
            id="maint-active-msg"
            rows={3}
            value={activeMessage}
            onChange={(e) => setActiveMessage(e.target.value)}
            disabled={busy}
            className="resize-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="destructive"
            className="gap-1.5"
            disabled={busy || status === "active"}
            onClick={() =>
              void run(
                {
                  action: "start",
                  message: activeMessage,
                  estimatedDurationMinutes: Number(duration) || undefined,
                },
                "Maintenance lock started"
              )
            }
          >
            <ConstructionIcon className="size-3.5" />
            Start maintenance now
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="gap-1.5"
            disabled={busy || status === "idle"}
            onClick={() => void run({ action: "end" }, "Maintenance ended")}
          >
            <CircleCheckIcon className="size-3.5" />
            End maintenance
          </Button>
        </div>
      </section>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-current/10 bg-background/40 px-3 py-2 backdrop-blur-sm">
      <p className="opacity-60">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  )
}

function StepHint({
  n,
  title,
  active,
}: {
  n: number
  title: string
  active: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
        active
          ? "border-foreground/20 bg-muted/60 text-foreground"
          : "border-transparent"
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
          active ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
        )}
      >
        {n}
      </span>
      <span className={cn(active && "font-medium")}>{title}</span>
    </div>
  )
}
