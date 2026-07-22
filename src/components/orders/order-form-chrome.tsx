"use client"

import type { ReactNode } from "react"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const orderFormSelectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

export function OrderFormSection({
  title,
  description,
  step,
  children,
  className,
  action,
}: {
  title: string
  description?: string
  step?: number
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn(
        "bg-card flex flex-col gap-4 rounded-xl border p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {step != null ? (
            <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
              {step}
            </span>
          ) : null}
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-muted-foreground text-xs leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function OrderFormField({
  id,
  label,
  children,
  className,
  error,
  required,
  hint,
}: {
  id: string
  label: string
  children: ReactNode
  className?: string
  error?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive ml-0.5" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-muted-foreground text-[11px]">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function OrderStatusChip({ status }: { status?: string }) {
  const value = status?.trim() || "DRAFT"
  const tone =
    value === "DELIVERED" || value === "CLOSED"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : value === "HOLD" || value === "ALTERATIONS"
        ? "bg-amber-500/10 text-amber-800 dark:text-amber-400"
        : value === "RUNNING" || value === "READY_FOR_DELIVERY"
          ? "bg-sky-500/10 text-sky-800 dark:text-sky-400"
          : "bg-muted text-muted-foreground"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tone
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  )
}

export function OrderFormHeader({
  title,
  subtitle,
  status,
  saving,
  canSave,
  onCancelHref = "/orders",
  onLeave,
  formId = "orders-form",
  saveLabel = "Save order",
  backAriaLabel = "Back to orders",
  showActions = true,
}: {
  title: string
  subtitle?: string
  status?: string
  saving?: boolean
  canSave?: boolean
  onCancelHref?: string
  /** When set, Back/Cancel call this instead of navigating immediately. */
  onLeave?: () => void
  formId?: string
  saveLabel?: string
  backAriaLabel?: string
  showActions?: boolean
}) {
  const leaveButtonProps = onLeave
    ? {
        type: "button" as const,
        onClick: onLeave,
        disabled: saving,
      }
    : {
        type: "button" as const,
        nativeButton: false as const,
        render: <Link href={onCancelHref} />,
        disabled: saving,
      }

  return (
    <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="mt-0.5 size-8 shrink-0"
            aria-label={backAriaLabel}
            {...leaveButtonProps}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {title}
              </h1>
              {status ? <OrderStatusChip status={status} /> : null}
            </div>
            {subtitle ? (
              <p className="text-muted-foreground truncate text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-2 sm:justify-end">
            <Button variant="outline" {...leaveButtonProps}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={!canSave || saving}
            >
              {saving ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {saving ? "Saving…" : saveLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
