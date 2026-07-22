"use client"

import { useEffect } from "react"

import { captureException } from "@/lib/posthog/client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error, {
      digest: error.digest,
      boundary: "app/global-error",
    })
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h2>
          <p
            style={{
              maxWidth: "28rem",
              margin: 0,
              fontSize: "0.875rem",
              color: "#737373",
            }}
          >
            This error was reported automatically. Try again to continue.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: 0,
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "#a3a3a3",
              }}
            >
              Ref: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "0.5rem",
              border: "1px solid #e5e5e5",
              background: "#171717",
              color: "#fafafa",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
