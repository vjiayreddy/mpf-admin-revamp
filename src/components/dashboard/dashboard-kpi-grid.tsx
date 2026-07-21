"use client"

import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  CalendarDaysIcon,
  ClipboardCheckIcon,
  PackageIcon,
  ScissorsIcon,
  ShirtIcon,
  UserRoundSearchIcon,
} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardKpi, DashboardKpiKey } from "@/hooks/use-dashboard-snapshot"
import { cn } from "@/lib/utils"

const KPI_META: Record<
  DashboardKpiKey,
  { icon: LucideIcon; well: string }
> = {
  orders: {
    icon: PackageIcon,
    well: "bg-sky-500/10 text-sky-800 dark:text-sky-200",
  },
  leads: {
    icon: UserRoundSearchIcon,
    well: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  },
  trials: {
    icon: ShirtIcon,
    well: "bg-orange-500/10 text-orange-800 dark:text-orange-200",
  },
  qc: {
    icon: ClipboardCheckIcon,
    well: "bg-teal-500/10 text-teal-800 dark:text-teal-200",
  },
  embroidery: {
    icon: ScissorsIcon,
    well: "bg-rose-500/10 text-rose-800 dark:text-rose-200",
  },
  appointments: {
    icon: CalendarDaysIcon,
    well: "bg-indigo-500/10 text-indigo-800 dark:text-indigo-200",
  },
}

type DashboardKpiGridProps = {
  kpis: DashboardKpi[]
  weekRangeLabel: string
}

export function DashboardStatTile({
  kpi,
  index,
}: {
  kpi: DashboardKpi
  index: number
}) {
  const router = useRouter()
  const meta = KPI_META[kpi.key]
  const Icon = meta.icon

  if (kpi.loading) {
    return (
      <div className="bg-card flex flex-col gap-4 rounded-xl border p-5">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => router.push(kpi.href)}
      className={cn(
        "bg-card group flex w-full flex-col gap-4 rounded-xl border p-5 text-left transition-colors",
        "hover:bg-muted/40 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-400"
      )}
      style={{ animationDelay: `${80 + index * 50}ms` }}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-lg",
          meta.well
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {kpi.label}
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          {kpi.value}
        </p>
      </div>
    </button>
  )
}

export function DashboardKpiGrid({
  kpis,
  weekRangeLabel,
}: DashboardKpiGridProps) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">This week</h2>
        <p className="text-muted-foreground text-sm">
          Volume in your stylist scope · {weekRangeLabel}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {kpis.map((kpi, index) => (
          <DashboardStatTile key={kpi.key} kpi={kpi} index={index} />
        ))}
      </div>
    </section>
  )
}
