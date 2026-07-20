"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DesignSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function DesignSection({
  title,
  description,
  children,
  className,
}: DesignSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

type MetaFieldProps = {
  label: string
  value?: ReactNode
}

export function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-sm leading-snug break-words">
        {value || "—"}
      </dd>
    </div>
  )
}
