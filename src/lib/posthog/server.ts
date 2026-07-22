import { PostHog } from "posthog-node"

import {
  getPostHogHost,
  getPostHogKey,
  isPostHogEnabled,
} from "@/lib/posthog/config"

/**
 * Short-lived Node client for server routes / RSC.
 * Always call `await client.shutdown()` when done.
 */
export function createPostHogServerClient(): PostHog | null {
  if (!isPostHogEnabled()) return null
  const key = getPostHogKey()
  if (!key) return null

  return new PostHog(key, {
    host: getPostHogHost(),
    flushAt: 1,
    flushInterval: 0,
  })
}

export async function captureServerEvent(input: {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}) {
  const client = createPostHogServerClient()
  if (!client) return

  try {
    client.capture({
      distinctId: input.distinctId,
      event: input.event,
      properties: input.properties,
    })
  } finally {
    await client.shutdown()
  }
}

/** Report a server exception to PostHog Error Tracking. */
export async function captureServerException(
  error: unknown,
  distinctId?: string,
  properties?: Record<string, unknown>
) {
  const client = createPostHogServerClient()
  if (!client) return

  try {
    client.captureException(error, distinctId, properties)
  } finally {
    await client.shutdown()
  }
}
