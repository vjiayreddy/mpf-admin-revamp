"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * next-themes injects an inline <script> to prevent theme flicker (FOUC).
 * React 19 / Next.js 16 warn about script tags rendered inside components.
 * That warning is a false positive here — the script still runs correctly
 * during SSR. Filter only that message in development.
 * @see https://github.com/shadcn-ui/ui/issues/10104
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
