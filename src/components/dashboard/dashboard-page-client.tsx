"use client"

import Link from "next/link"

import { DashboardBookmarksList } from "@/components/dashboard/dashboard-bookmarks-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot"

export function DashboardPageClient() {
  const { user, weekRangeLabel } = useDashboardSnapshot()

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        name={user?.name}
        email={user?.email}
        role={user?.role}
        weekRangeLabel={weekRangeLabel}
      />
      <DashboardQuickActions />
      <DashboardBookmarksList />
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
