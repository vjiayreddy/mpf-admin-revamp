"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { captureException } from "@/lib/posthog/client"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error, {
      digest: error.digest,
      boundary: "app/error",
    })
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          This error was reported automatically. You can try again, or go back
          and continue from another page.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
