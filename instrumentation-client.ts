import { initPostHogClient } from "@/lib/posthog/instrumentation"

/**
 * Next.js 15.3+ client instrumentation — initializes PostHog once per page load.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */
initPostHogClient()
