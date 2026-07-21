import { eq } from "drizzle-orm"

import {
  DEFAULT_ACTIVE_MESSAGE,
  DEFAULT_MAINTENANCE_MESSAGE,
  MAINTENANCE_ROW_ID,
  type MaintenancePhase,
  type MaintenanceState,
} from "@/lib/maintenance/types"
import { prefsDb } from "@/lib/prefs/prefs-db"
import { maintenanceStatus } from "@/lib/prefs/prefs-schema"

function isForceActive() {
  return process.env.MAINTENANCE_FORCE_ACTIVE?.trim().toLowerCase() === "true"
}

function toIso(d: Date | null | undefined): string | null {
  if (!d) return null
  return d.toISOString()
}

function rowToState(row: {
  status: string
  message: string
  startsAt: Date | null
  endsAtEstimate: Date | null
  updatedAt: Date
  updatedBy: string | null
}): MaintenanceState {
  const forceActive = isForceActive()
  const status = (forceActive ? "active" : row.status) as MaintenancePhase
  return {
    status,
    message:
      row.message ||
      (status === "active"
        ? DEFAULT_ACTIVE_MESSAGE
        : DEFAULT_MAINTENANCE_MESSAGE),
    startsAt: toIso(row.startsAt),
    endsAtEstimate: toIso(row.endsAtEstimate),
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    forceActive,
  }
}

const idleDefaults = () => ({
  status: "idle" as const,
  message: "",
  startsAt: null as Date | null,
  endsAtEstimate: null as Date | null,
  updatedAt: new Date(),
  updatedBy: null as string | null,
})

export async function getMaintenanceState(): Promise<MaintenanceState> {
  const rows = await prefsDb
    .select()
    .from(maintenanceStatus)
    .where(eq(maintenanceStatus.id, MAINTENANCE_ROW_ID))
    .limit(1)

  if (!rows[0]) {
    return rowToState(idleDefaults())
  }

  const row = rows[0]
  // Auto-promote upcoming → active when startsAt has passed.
  if (
    !isForceActive() &&
    row.status === "upcoming" &&
    row.startsAt &&
    row.startsAt.getTime() <= Date.now()
  ) {
    return setMaintenanceState({
      status: "active",
      message: row.message || DEFAULT_ACTIVE_MESSAGE,
      startsAt: row.startsAt,
      endsAtEstimate: row.endsAtEstimate,
      updatedBy: row.updatedBy,
    })
  }

  return rowToState(row)
}

export async function setMaintenanceState(input: {
  status: MaintenancePhase
  message: string
  startsAt: Date | null
  endsAtEstimate: Date | null
  updatedBy: string | null
}): Promise<MaintenanceState> {
  const now = new Date()
  await prefsDb
    .insert(maintenanceStatus)
    .values({
      id: MAINTENANCE_ROW_ID,
      status: input.status,
      message: input.message,
      startsAt: input.startsAt,
      endsAtEstimate: input.endsAtEstimate,
      updatedAt: now,
      updatedBy: input.updatedBy,
    })
    .onConflictDoUpdate({
      target: maintenanceStatus.id,
      set: {
        status: input.status,
        message: input.message,
        startsAt: input.startsAt,
        endsAtEstimate: input.endsAtEstimate,
        updatedAt: now,
        updatedBy: input.updatedBy,
      },
    })

  return getMaintenanceState()
}
