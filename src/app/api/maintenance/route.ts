import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { publishMaintenanceState } from "@/lib/maintenance/ably-server"
import {
  getMaintenanceState,
  setMaintenanceState,
} from "@/lib/maintenance/store"
import {
  DEFAULT_ACTIVE_MESSAGE,
  DEFAULT_MAINTENANCE_MESSAGE,
  type MaintenancePostBody,
} from "@/lib/maintenance/types"

export const dynamic = "force-dynamic"

async function requireSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) return null
  return session.user
}

/** GET — current maintenance status (any signed-in user). */
export async function GET() {
  const user = await requireSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const state = await getMaintenanceState()
  return NextResponse.json(state)
}

/** POST — schedule / start / end (any signed-in admin user). */
export async function POST(req: Request) {
  const user = await requireSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: MaintenancePostBody
  try {
    body = (await req.json()) as MaintenancePostBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const updatedBy = user.id

  if (body.action === "end") {
    const state = await setMaintenanceState({
      status: "idle",
      message: "",
      startsAt: null,
      endsAtEstimate: null,
      updatedBy,
    })
    await publishMaintenanceState(state)
    return NextResponse.json(state)
  }

  if (body.action === "start") {
    const now = new Date()
    const duration = body.estimatedDurationMinutes
    const endsAtEstimate =
      duration != null && Number.isFinite(duration) && duration > 0
        ? new Date(now.getTime() + duration * 60_000)
        : null
    const state = await setMaintenanceState({
      status: "active",
      message: (body.message || DEFAULT_ACTIVE_MESSAGE).trim(),
      startsAt: now,
      endsAtEstimate,
      updatedBy,
    })
    await publishMaintenanceState(state)
    return NextResponse.json(state)
  }

  if (body.action === "schedule") {
    const minutes = Number(body.minutesUntilStart)
    if (!Number.isFinite(minutes) || minutes < 1) {
      return NextResponse.json(
        { error: "minutesUntilStart must be >= 1" },
        { status: 400 }
      )
    }
    const now = Date.now()
    const startsAt = new Date(now + minutes * 60_000)
    const duration = body.estimatedDurationMinutes
    const endsAtEstimate =
      duration != null && Number.isFinite(duration) && duration > 0
        ? new Date(startsAt.getTime() + duration * 60_000)
        : null
    const state = await setMaintenanceState({
      status: "upcoming",
      message: (body.message || DEFAULT_MAINTENANCE_MESSAGE).trim(),
      startsAt,
      endsAtEstimate,
      updatedBy,
    })
    await publishMaintenanceState(state)
    return NextResponse.json(state)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
