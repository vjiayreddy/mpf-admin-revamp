"use client"

import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MeasurementLoadStep } from "@/lib/measurements/load-status"
import { cn } from "@/lib/utils"

type MeasurementLoadStatusDialogProps = {
  open: boolean
  loading: boolean
  steps: MeasurementLoadStep[]
  onClose: () => void
}

function StepIcon({ status }: { status: MeasurementLoadStep["status"] }) {
  if (status === "done") {
    return (
      <CheckCircle2Icon className="size-4 scale-100 text-emerald-600 transition-transform duration-300" />
    )
  }
  if (status === "error") {
    return <XCircleIcon className="text-destructive size-4" />
  }
  if (status === "none") {
    return <CircleIcon className="text-muted-foreground/50 size-4" />
  }
  return (
    <span className="relative flex size-4 items-center justify-center">
      <span className="bg-primary/30 absolute inline-flex size-3 animate-ping rounded-full" />
      <CircleIcon className="text-primary relative size-4" />
    </span>
  )
}

export function MeasurementLoadStatusDialog({
  open,
  loading,
  steps,
  onClose,
}: MeasurementLoadStatusDialogProps) {
  const doneCount = steps.filter((s) => s.status === "done").length
  const progress = steps.length ? (doneCount / steps.length) * 100 : 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose()
      }}
    >
      <DialogContent
        className="sm:max-w-md overflow-hidden"
        showCloseButton={!loading}
      >
        <DialogHeader className="border-b-0 pb-2">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            {loading ? (
              <Loader2Icon className="text-primary size-5 animate-spin" />
            ) : (
              <CheckCircle2Icon className="size-5 text-emerald-600" />
            )}
            {loading
              ? "Initializing measurement form…"
              : "Form ready"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {loading
              ? "Fetching saved values and running formula calculations."
              : "All initialization steps finished. You can close and continue."}
          </p>
        </DialogHeader>

        <div className="bg-muted mx-5 h-1.5 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              loading ? "bg-primary" : "bg-emerald-500"
            )}
            style={{ width: `${Math.max(progress, loading ? 8 : 100)}%` }}
          />
        </div>

        <ul className="flex flex-col gap-1 px-5 py-3">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-1 fill-mode-both flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm duration-300",
                step.status === "pending" && "bg-muted/60",
                step.status === "done" && "bg-emerald-50/80"
              )}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <StepIcon status={step.status} />
              <span
                className={cn(
                  "flex-1 leading-snug",
                  step.status === "done" && "text-emerald-800",
                  step.status === "error" && "text-destructive",
                  step.status === "none" && "text-muted-foreground",
                  step.status === "pending" && "text-foreground font-medium"
                )}
              >
                {step.label}
              </span>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {index + 1}/{steps.length}
              </span>
            </li>
          ))}
        </ul>

        <DialogFooter className="border-t-0">
          <Button
            type="button"
            className="min-w-28"
            disabled={loading}
            onClick={onClose}
          >
            {loading ? "Working…" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
