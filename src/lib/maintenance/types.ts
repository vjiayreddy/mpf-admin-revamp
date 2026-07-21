export const MAINTENANCE_ROW_ID = "current"

/**
 * Ably channel for maintenance broadcasts.
 * Avoid `:` namespaces unless the API key capability explicitly allows them
 * (e.g. `{"mpf-admin:*":["*"]}`). Override with NEXT_PUBLIC_ABLY_MAINTENANCE_CHANNEL.
 */
export const MAINTENANCE_ABLY_CHANNEL =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ABLY_MAINTENANCE_CHANNEL?.trim()) ||
  "mpfadmin-maintenance"


export type MaintenancePhase = "idle" | "upcoming" | "active"

export type MaintenanceState = {
  status: MaintenancePhase
  message: string
  startsAt: string | null
  endsAtEstimate: string | null
  updatedAt: string
  updatedBy: string | null
  /** Env kill-switch forced active regardless of DB. */
  forceActive: boolean
}

export type MaintenancePostBody =
  | {
      action: "schedule"
      /** Minutes from now until maintenance starts. */
      minutesUntilStart: number
      message?: string
      /** Optional estimated duration in minutes after start. */
      estimatedDurationMinutes?: number
    }
  | {
      action: "start"
      message?: string
      estimatedDurationMinutes?: number
    }
  | { action: "end" }

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Service maintenance is scheduled. Please save all your changes and log out of the portal."

export const DEFAULT_ACTIVE_MESSAGE =
  "The portal is under service maintenance. Please wait until maintenance is complete."
