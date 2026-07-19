import posthog from "posthog-js"

import { isPostHogEnabled } from "@/lib/posthog/config"

export type PostHogPerson = {
  id: string
  email?: string | null
  name?: string | null
  role?: string | null
}

/** Capture a custom event when PostHog is configured. */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!isPostHogEnabled() || typeof window === "undefined") return
  posthog.capture(event, properties)
}

/** Identify the signed-in admin (distinct id = Better Auth user id). */
export function identifyUser(person: PostHogPerson) {
  if (!isPostHogEnabled() || typeof window === "undefined") return
  posthog.identify(person.id, {
    email: person.email ?? undefined,
    name: person.name ?? undefined,
    role: person.role ?? undefined,
  })
}

/** Clear identity on logout so the next login is not merged incorrectly. */
export function resetPostHog() {
  if (!isPostHogEnabled() || typeof window === "undefined") return
  posthog.reset()
}

export function capturePageview(url: string) {
  if (!isPostHogEnabled() || typeof window === "undefined") return
  posthog.capture("$pageview", { $current_url: url })
}
