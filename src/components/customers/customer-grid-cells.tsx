"use client"

import type { ReactNode } from "react"
import type { ICellRendererParams } from "ag-grid-community"

import type { CustomerListRow } from "@/lib/apollo/queries/users"
import { cn } from "@/lib/utils"

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
  PASSIVE: "bg-amber-500/12 text-amber-800 dark:text-amber-300",
  INACTIVE: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300",
  UNASSIGNED: "bg-slate-500/12 text-slate-700 dark:text-slate-300",
  ISSUE: "bg-red-500/12 text-red-800 dark:text-red-300",
  MPF_GROUP: "bg-sky-500/12 text-sky-800 dark:text-sky-300",
}

const TYPE_BADGE: Record<string, string> = {
  DAILY_WEAR: "bg-teal-500/12 text-teal-800 dark:text-teal-300",
  OCCASIONAL: "bg-orange-500/12 text-orange-800 dark:text-orange-300",
  STAR_CLIENT: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
}

const TYPE_LABEL: Record<string, string> = {
  DAILY_WEAR: "Daily Wear",
  OCCASIONAL: "Occasional",
  STAR_CLIENT: "Star Client",
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function isOverdue(iso?: string | null) {
  if (!iso) return false
  const due = new Date(iso)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function EmptyCell() {
  return <span className="text-muted-foreground">—</span>
}

function SoftBadge({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        className
      )}
    >
      {children}
    </span>
  )
}

export function CustomerNameCell({
  data,
}: ICellRendererParams<CustomerListRow>) {
  if (!data) return null
  const name =
    `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
    data.fullName ||
    "—"
  return (
    <div className="flex min-w-0 flex-col justify-center leading-tight">
      <span className="text-foreground truncate text-sm font-semibold">
        {name}
      </span>
      {data.email ? (
        <span className="text-muted-foreground truncate text-xs">
          {data.email}
        </span>
      ) : null}
    </div>
  )
}

export function CustomerSrNoCell({
  value,
}: ICellRendererParams<CustomerListRow, number | null | undefined>) {
  if (value === null || value === undefined) return <EmptyCell />
  return (
    <span className="text-foreground font-mono text-sm font-medium tabular-nums">
      {value}
    </span>
  )
}

export function StatusBadgeCell({
  value,
}: ICellRendererParams<CustomerListRow, string | null | undefined>) {
  if (!value) return <EmptyCell />
  const tone = STATUS_BADGE[value] ?? "bg-muted text-muted-foreground"
  return (
    <SoftBadge className={tone}>{value.replaceAll("_", " ").toLowerCase()}</SoftBadge>
  )
}

export function CustomerTypeBadgeCell({
  value,
}: ICellRendererParams<CustomerListRow, string | null | undefined>) {
  if (!value) return <EmptyCell />
  const tone = TYPE_BADGE[value] ?? "bg-muted text-muted-foreground"
  const label = TYPE_LABEL[value] ?? value.replaceAll("_", " ")
  return <SoftBadge className={tone}>{label}</SoftBadge>
}

export function CcDueDateCell({
  data,
}: ICellRendererParams<CustomerListRow>) {
  const iso = data?.ccDueDate?.timestamp
  const label = formatDate(iso)
  if (!label) return <EmptyCell />
  const overdue = isOverdue(iso)
  return (
    <div className="flex min-w-0 flex-col justify-center leading-tight">
      <span
        className={cn(
          "text-sm tabular-nums",
          overdue
            ? "font-semibold text-red-700 dark:text-red-300"
            : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      {overdue ? (
        <span className="text-[11px] font-medium tracking-wide text-red-600 uppercase dark:text-red-400">
          Overdue
        </span>
      ) : null}
    </div>
  )
}

export function SecondaryTextCell({
  value,
}: ICellRendererParams<CustomerListRow, string | null | undefined>) {
  if (!value || value === "—") return <EmptyCell />
  return <span className="text-muted-foreground truncate text-sm">{value}</span>
}

export { formatDate as formatCustomerGridDate }
