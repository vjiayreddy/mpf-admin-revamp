"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  HeadphonesIcon,
  UserRoundSearchIcon,
  WrenchIcon,
} from "lucide-react"

import { useMaintenance } from "@/components/maintenance/maintenance-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PulseChip = {
  id: string
  label: string
  href: string
  icon: ReactNode
  value: string | number | null
  loading?: boolean
  tone?: "default" | "warn" | "danger"
}

type DashboardPulseStripProps = {
  openTickets: number | null
  openTicketsLoading: boolean
  followUpCount: number | null
  followUpLoading: boolean
}

export function DashboardPulseStrip({
  openTickets,
  openTicketsLoading,
  followUpCount,
  followUpLoading,
}: DashboardPulseStripProps) {
  const { state: maintenance } = useMaintenance()
  const maintenanceLive =
    maintenance?.status === "upcoming" || maintenance?.status === "active"

  const chips: PulseChip[] = [
    {
      id: "tickets",
      label: "Open tickets",
      href: "/ticket-tracker?status=Open",
      icon: <HeadphonesIcon className="size-4" />,
      value: openTickets,
      loading: openTicketsLoading,
      tone:
        openTickets != null && openTickets > 0 ? "warn" : "default",
    },
    {
      id: "followups",
      label: "Lead follow-ups",
      href: "/leads",
      icon: <UserRoundSearchIcon className="size-4" />,
      value: followUpCount,
      loading: followUpLoading,
      tone:
        followUpCount != null && followUpCount > 0 ? "warn" : "default",
    },
  ]

  if (maintenanceLive) {
    chips.push({
      id: "maintenance",
      label: "Maintenance",
      href: "/system/maintenance",
      icon: <WrenchIcon className="size-4" />,
      value: maintenance?.status === "active" ? "Live" : "Soon",
      tone: maintenance?.status === "active" ? "danger" : "warn",
    })
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">Needs a look</h2>
        <p className="text-muted-foreground text-sm">
          Urgent queues — tap through when the number isn’t zero.
        </p>
      </div>
      <div
        className={cn(
          "grid gap-3",
          chips.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        )}
      >
        {chips.map((chip, index) => (
          <Link
            key={chip.id}
            href={chip.href}
            className={cn(
              "group bg-card relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-colors",
              "hover:bg-muted/40 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-400",
              chip.tone === "warn" && "border-amber-500/25",
              chip.tone === "danger" && "border-destructive/30 bg-destructive/5"
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg border",
                chip.tone === "danger"
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : chip.tone === "warn"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {chip.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {chip.label}
              </p>
              {chip.loading ? (
                <Skeleton className="mt-1.5 h-8 w-12" />
              ) : (
                <p className="mt-0.5 text-3xl font-semibold tracking-tight tabular-nums">
                  {chip.value ?? "—"}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
