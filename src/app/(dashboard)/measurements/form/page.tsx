"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { PlaceholderPage } from "@/components/layout/placeholder-page"

function MeasurementFormPlaceholder() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")?.trim() || null
  const catId = searchParams.get("catId")?.trim() || null

  const details = [
    userId ? `Customer: ${userId}` : null,
    catId ? `Category: ${catId}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <PlaceholderPage
      title="Customer Measurements"
      description={
        details
          ? `${details}. Full measurement form migration comes next.`
          : "Open this page with a userId (and optional catId) to edit customer measurements. Form migration comes next."
      }
    />
  )
}

export default function MeasurementFormPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading measurement form…
        </div>
      }
    >
      <MeasurementFormPlaceholder />
    </Suspense>
  )
}
