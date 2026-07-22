import posthog from "posthog-js"

import { isPostHogEnabled } from "@/lib/posthog/config"

export type PostHogPerson = {
  id: string
  email?: string | null
  name?: string | null
  role?: string | null
}

type NetworkConnection = {
  effectiveType?: string
  type?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener?: (type: "change", listener: () => void) => void
}

function getNetworkConnection(): NetworkConnection | undefined {
  if (typeof navigator === "undefined") return undefined
  const nav = navigator as Navigator & {
    connection?: NetworkConnection
    mozConnection?: NetworkConnection
    webkitConnection?: NetworkConnection
  }
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection
}

/** Super properties: connection type / estimated speed (when browser supports it). */
export function registerConnectionProperties() {
  if (!isPostHogEnabled() || typeof window === "undefined") return

  const connection = getNetworkConnection()
  if (!connection) return

  const apply = () => {
    posthog.register({
      connection_effective_type: connection.effectiveType ?? null,
      connection_type: connection.type ?? null,
      connection_downlink_mbps:
        typeof connection.downlink === "number" ? connection.downlink : null,
      connection_rtt_ms:
        typeof connection.rtt === "number" ? connection.rtt : null,
      connection_save_data:
        typeof connection.saveData === "boolean" ? connection.saveData : null,
    })
  }

  apply()
  connection.addEventListener?.("change", apply)
}

/** Capture a custom event when PostHog is configured. */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!isPostHogEnabled() || typeof window === "undefined") return
  posthog.capture(event, properties)
}

/** Report an exception to PostHog Error Tracking. */
export function captureException(
  error: unknown,
  properties?: Record<string, unknown>
) {
  if (!isPostHogEnabled() || typeof window === "undefined") return
  posthog.captureException(error, properties)
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
