"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DesignSectionProps = {
  id?: string
  index?: number
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function DesignSection({
  id,
  index,
  title,
  description,
  children,
  className,
  action,
}: DesignSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 animate-in fade-in slide-in-from-bottom-1 fill-mode-both flex flex-col gap-4 duration-500",
        className
      )}
      style={
        index != null
          ? { animationDelay: `${Math.min(index, 6) * 60}ms` }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {index != null ? (
            <span
              aria-hidden
              className="bg-foreground/5 text-foreground/70 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums"
            >
              {String(index).padStart(2, "0")}
            </span>
          ) : null}
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
              {title}
            </h3>
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

type MetaFieldProps = {
  label: string
  value?: ReactNode
  className?: string
}

export function MetaField({ label, value, className }: MetaFieldProps) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <dt className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-sm leading-snug break-words">
        {value || "—"}
      </dd>
    </div>
  )
}

export function SpecChip({ children }: { children: ReactNode }) {
  return (
    <span className="bg-muted/80 text-foreground inline-flex max-w-full items-center rounded-md border px-2 py-1 text-xs leading-none">
      {children}
    </span>
  )
}
