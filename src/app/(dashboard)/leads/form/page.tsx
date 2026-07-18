import { Suspense } from "react"

import { LeadFormClient } from "./lead-form-client"

export default function LeadFormPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground p-4 text-sm md:p-6">
          Loading form…
        </div>
      }
    >
      <LeadFormClient />
    </Suspense>
  )
}
