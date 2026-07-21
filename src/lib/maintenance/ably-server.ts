import Ably from "ably"

import {
  MAINTENANCE_ABLY_CHANNEL,
  type MaintenanceState,
} from "@/lib/maintenance/types"

let restClient: Ably.Rest | null = null

function getRest(): Ably.Rest | null {
  const key = process.env.ABLY_API_KEY?.trim()
  if (!key) return null
  if (!restClient) {
    restClient = new Ably.Rest({ key })
  }
  return restClient
}

/** Best-effort publish; no-op when ABLY_API_KEY is unset. */
export async function publishMaintenanceState(
  state: MaintenanceState
): Promise<void> {
  const client = getRest()
  if (!client) return
  try {
    const channel = client.channels.get(MAINTENANCE_ABLY_CHANNEL)
    await channel.publish("status", state)
  } catch (err) {
    console.error("[maintenance] Ably publish failed", err)
  }
}
