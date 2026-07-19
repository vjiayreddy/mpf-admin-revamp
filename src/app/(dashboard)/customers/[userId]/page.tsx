import { Suspense } from "react"

import { CustomerProfilePageClient } from "./customer-profile-page-client"

export default function CustomerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading profile…</div>
      }
    >
      <CustomerProfilePageClient />
    </Suspense>
  )
}
