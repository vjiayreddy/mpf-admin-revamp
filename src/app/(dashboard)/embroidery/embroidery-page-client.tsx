"use client"

import { Suspense } from "react"

import { EmbroideryListPanel } from "@/components/embroidery/embroidery-list-panel"

export function EmbroideryPageClient() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Loading embroidery…</p>
      }
    >
      <EmbroideryListPanel />
    </Suspense>
  )
}
