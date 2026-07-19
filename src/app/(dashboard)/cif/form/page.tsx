import { Suspense } from "react"

import { CifFormClient } from "./cif-form-client"

export default function CifFormPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground p-4 text-sm md:p-6">
          Loading form…
        </div>
      }
    >
      <CifFormClient />
    </Suspense>
  )
}
