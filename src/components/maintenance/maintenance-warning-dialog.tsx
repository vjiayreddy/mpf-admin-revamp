"use client"

import { useEffect, useState } from "react"
import { ClockIcon, SaveIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  formatMaintenanceCountdown,
  formatMaintenanceWhen,
} from "@/lib/maintenance/format"
import type { MaintenanceState } from "@/lib/maintenance/types"

type MaintenanceWarningDialogProps = {
  state: MaintenanceState
  open: boolean
  onDismiss: () => void
}

export function MaintenanceWarningDialog({
  state,
  open,
  onDismiss,
}: MaintenanceWarningDialogProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [open])

  const startsAtMs = state.startsAt ? Date.parse(state.startsAt) : NaN
  const remaining = Number.isFinite(startsAtMs)
    ? Math.max(0, startsAtMs - now)
    : 0
  const countdown = formatMaintenanceCountdown(remaining)
  const startLabel = formatMaintenanceWhen(state.startsAt)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-md"
        showCloseButton
      >
        <div className="from-amber-500/15 via-background to-background relative border-b bg-gradient-to-b px-5 pt-6 pb-5">
          <div
            className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <div className="border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200 flex size-11 shrink-0 items-center justify-center rounded-xl border">
              <ClockIcon className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <DialogHeader className="border-0 p-0 pr-8 text-left">
              <p className="text-amber-700/80 dark:text-amber-200/70 mb-1 text-[11px] font-medium tracking-[0.14em] uppercase">
                Scheduled notice
              </p>
              <DialogTitle className="text-lg leading-snug">
                Service maintenance starting soon
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-[13px] leading-relaxed">
                {state.message ||
                  "Please save all your changes and log out of the portal."}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="bg-muted/50 flex flex-col items-center rounded-xl border px-4 py-5">
            <p className="text-muted-foreground mb-3 text-[10px] font-medium tracking-[0.16em] uppercase">
              Starts in
            </p>
            <div className="flex items-end gap-1.5 sm:gap-2">
              {countdown.totalHours > 0 ? (
                <>
                  <TimeBlock value={countdown.hours} label="hrs" />
                  <span className="text-muted-foreground/50 pb-5 text-xl font-light">
                    :
                  </span>
                </>
              ) : null}
              <TimeBlock value={countdown.minutes} label="min" />
              <span className="text-muted-foreground/50 pb-5 text-xl font-light">
                :
              </span>
              <TimeBlock value={countdown.seconds} label="sec" />
            </div>
            {startLabel ? (
              <p className="text-muted-foreground mt-4 text-xs">
                Around <span className="text-foreground/80">{startLabel}</span>
              </p>
            ) : null}
          </div>

          <div className="bg-muted/30 text-muted-foreground flex items-start gap-2.5 rounded-lg border border-dashed px-3 py-2.5 text-xs leading-relaxed">
            <SaveIcon className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
            <span>
              Finish any open edits, then sign out so nothing is lost when the
              portal locks.
            </span>
          </div>
        </div>

        <DialogFooter className="bg-muted/20 justify-end gap-2 border-t px-5 py-3">
          <Button type="button" className="min-w-28" onClick={onDismiss}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[3.75rem] flex-col items-center">
      <span className="bg-background border-border w-full rounded-lg border px-2.5 py-2.5 text-center font-mono text-2xl font-semibold tracking-tight tabular-nums shadow-xs">
        {value}
      </span>
      <span className="text-muted-foreground mt-1.5 text-[10px] tracking-wider uppercase">
        {label}
      </span>
    </div>
  )
}
