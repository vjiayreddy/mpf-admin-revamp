import { Suspense } from "react"

import { RolesPageClient } from "./roles-page-client"

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading roles…</div>
      }
    >
      <RolesPageClient />
    </Suspense>
  )
}
