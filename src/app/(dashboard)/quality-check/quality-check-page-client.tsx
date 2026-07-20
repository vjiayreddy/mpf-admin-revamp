"use client"

import { Suspense } from "react"

import { QualityCheckListPanel } from "@/components/quality-check/quality-check-list-panel"

export function QualityCheckPageClient() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Loading quality check…</p>
      }
    >
      <QualityCheckListPanel />
    </Suspense>
  )
}
