"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function MeasurementFormRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")?.trim()
  const catId = searchParams.get("catId")?.trim()

  useEffect(() => {
    if (!userId) return
    const params = new URLSearchParams({ tab: "form" })
    if (catId) params.set("catId", catId)
    router.replace(`/customers/${userId}/measurements?${params.toString()}`)
  }, [userId, catId, router])

  if (!userId) {
    return (
      <div className="bg-card rounded-lg border p-6 text-sm">
        <p className="font-medium">Missing userId</p>
        <p className="text-muted-foreground mt-1">
          Open measurements from a customer profile or the measurements list.
        </p>
      </div>
    )
  }

  return (
    <div className="text-muted-foreground text-sm">
      Opening measurement form…
    </div>
  )
}

export default function MeasurementFormPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading form…</div>
      }
    >
      <MeasurementFormRedirect />
    </Suspense>
  )
}
