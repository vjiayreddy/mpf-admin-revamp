import posthog from "posthog-js"

import { isPostHogEnabled } from "@/lib/posthog/config"

/**
 * Next.js 15.3+ client instrumentation — initializes PostHog once per page load.
 * Soft navigations still need manual $pageview (see PostHogTracker).
 */
if (isPostHogEnabled()) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    // App Router soft navigations — we capture pageviews in PostHogTracker.
    capture_pageview: false,
    capture_pageleave: true,
    loaded: (client) => {
      if (process.env.NODE_ENV === "development") {
        client.debug(false)
      }
    },
  })
}
