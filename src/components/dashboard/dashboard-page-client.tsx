"use client"

import Link from "next/link"

import { DashboardAttentionList } from "@/components/dashboard/dashboard-attention-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid"
import { DashboardPulseStrip } from "@/components/dashboard/dashboard-pulse-strip"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { useDashboardAttention } from "@/hooks/use-dashboard-attention"
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot"

export function DashboardPageClient() {
  const {
    kpis,
    user,
    weekRangeLabel,
    followUpCount,
    followUpLoading,
    clientConnectCount,
    clientConnectLoading,
  } = useDashboardSnapshot()
  const {
    openTickets,
    openTicketsLoading,
    trackOrdersCount,
    trackOrdersLoading,
  } = useDashboardAttention()

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={user?.name}
        email={user?.email}
        role={user?.role}
        weekRangeLabel={weekRangeLabel}
      />
      <DashboardPulseStrip
        openTickets={openTickets}
        openTicketsLoading={openTicketsLoading}
        followUpCount={followUpCount}
        followUpLoading={followUpLoading}
      />
      <DashboardKpiGrid kpis={kpis} weekRangeLabel={weekRangeLabel} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <DashboardAttentionList
          openTickets={openTickets}
          openTicketsLoading={openTicketsLoading}
          clientConnectCount={clientConnectCount}
          clientConnectLoading={clientConnectLoading}
          trackOrdersCount={trackOrdersCount}
          trackOrdersLoading={trackOrdersLoading}
        />
        <DashboardQuickActions />
      </div>
      <p className="text-muted-foreground text-sm">
        Need deeper breakdowns?{" "}
        <Link
          href="/analytics"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Open Analytics
        </Link>
      </p>
    </div>
  )
}
