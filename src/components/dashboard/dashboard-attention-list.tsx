"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  ChevronRightIcon,
  ClipboardListIcon,
  HeadphonesIcon,
  PackageSearchIcon,
  WrenchIcon,
} from "lucide-react"

import { useMaintenance } from "@/components/maintenance/maintenance-provider"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AttentionRow = {
  id: string
  label: string
  hint: string
  href: string
  icon: ReactNode
  count?: string | number | null
  loading?: boolean
  highlight?: boolean
  badge?: string | null
}

type DashboardAttentionListProps = {
  openTickets: number | null
  openTicketsLoading: boolean
  clientConnectCount: number | null
  clientConnectLoading: boolean
  trackOrdersCount: string | number | null
  trackOrdersLoading: boolean
}

export function DashboardAttentionList({
  openTickets,
  openTicketsLoading,
  clientConnectCount,
  clientConnectLoading,
  trackOrdersCount,
  trackOrdersLoading,
}: DashboardAttentionListProps) {
  const { state: maintenance } = useMaintenance()
  const maintenanceLive =
    maintenance?.status === "upcoming" || maintenance?.status === "active"

  const rows: AttentionRow[] = [
    {
      id: "tickets",
      label: "Open tickets",
      hint: "Support queue",
      href: "/ticket-tracker?status=Open",
      icon: <HeadphonesIcon className="size-4" />,
      count: openTickets,
      loading: openTicketsLoading,
    },
    {
      id: "client-connect",
      label: "Client Connect",
      hint: "Due today & missed",
      href: "/client-connect",
      icon: <ClipboardListIcon className="size-4" />,
      count: clientConnectCount,
      loading: clientConnectLoading,
    },
    {
      id: "track-orders",
      label: "Track orders",
      hint: "In production",
      href: "/track-orders",
      icon: <PackageSearchIcon className="size-4" />,
      count: trackOrdersCount,
      loading: trackOrdersLoading,
    },
  ]

  if (maintenanceLive) {
    rows.push({
      id: "maintenance",
      label: "Maintenance",
      hint: "Portal status",
      href: "/system/maintenance",
      icon: <WrenchIcon className="size-4" />,
      highlight: true,
      badge: maintenance?.status === "active" ? "Active" : "Upcoming",
    })
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">Queues</h2>
        <p className="text-muted-foreground text-sm">
          Jump into work that’s waiting on you.
        </p>
      </div>
      <ul className="divide-border bg-card overflow-hidden rounded-xl border">
        {rows.map((row) => (
          <li key={row.id} className="border-b last:border-b-0">
            <Link
              href={row.href}
              className={cn(
                "hover:bg-muted/40 flex items-center gap-3 px-4 py-3.5 transition-colors",
                row.highlight && "bg-amber-500/5"
              )}
            >
              <span
                className={cn(
                  "text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border",
                  row.highlight &&
                    "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                )}
              >
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {row.label}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {row.hint}
                </span>
              </span>
              {row.badge ? (
                <Badge
                  variant={
                    maintenance?.status === "active"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {row.badge}
                </Badge>
              ) : null}
              {row.loading ? (
                <Skeleton className="h-5 w-8" />
              ) : row.count !== undefined && row.count !== null ? (
                <span className="text-foreground text-base font-semibold tabular-nums">
                  {row.count}
                </span>
              ) : row.badge ? null : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
              <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
