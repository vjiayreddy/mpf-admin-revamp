import posthog from "posthog-js"

import { registerConnectionProperties } from "@/lib/posthog/client"
import { isPostHogEnabled } from "@/lib/posthog/config"

const SENSITIVE_HEADER_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization",
  "x-csrf-token",
  "x-csrftoken",
  "x-xsrf-token",
])

const SENSITIVE_BODY_KEYS =
  /"(password|passwd|secret|token|accessToken|access_token|refreshToken|refresh_token|api_key|apiKey|authorization|credentials|private_key|privatekey|mpfAccessToken)"\s*:\s*"[^"]*"/gi

function redactHeaders(
  headers: Record<string, string> | undefined
): Record<string, string> | undefined {
  if (!headers) return headers
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    next[key] = SENSITIVE_HEADER_KEYS.has(key.toLowerCase())
      ? "[redacted]"
      : value
  }
  return next
}

function redactBody(body: string | null | undefined): string | null | undefined {
  if (body == null || body === "") return body
  return body.replace(SENSITIVE_BODY_KEYS, '"$1":"[redacted]"')
}

/**
 * Next.js 15.3+ client instrumentation — initializes PostHog once per page load.
 * Soft navigations still need manual $pageview (see PostHogTracker).
 *
 * Error tracking + session replay with network request/response capture (redacted).
 * Note: PostHog does not capture network payloads on localhost — use a deployed host to verify.
 */
if (isPostHogEnabled()) {
  const sessionReplayDisabled =
    process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY === "false"

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    // App Router soft navigations — we capture pageviews in PostHogTracker.
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    disable_session_recording: sessionReplayDisabled,
    enable_recording_console_log: false,
    capture_performance: false,
    session_recording: {
      maskAllInputs: true,
      // 100% of sessions while verifying replay; lower later if UI feels heavy.
      sampleRate: 1,
      collectFonts: false,
      recordHeaders: true,
      recordBody: true,
      recordCrossOriginIframes: false,
      maskCapturedNetworkRequestFn: (request) => {
        const name = request.name ?? ""
        // Skip PostHog ingest noise.
        if (name.includes("i.posthog.com") || name.includes("/e/")) {
          return null
        }

        request.requestHeaders = redactHeaders(request.requestHeaders)
        request.responseHeaders = redactHeaders(request.responseHeaders)
        request.requestBody = redactBody(request.requestBody)
        request.responseBody = redactBody(request.responseBody)
        return request
      },
    },
    loaded: (client) => {
      if (process.env.NODE_ENV === "development") {
        client.debug(false)
      }
      // Attach connection type / estimated speed to subsequent events.
      registerConnectionProperties()
    },
  })
}
