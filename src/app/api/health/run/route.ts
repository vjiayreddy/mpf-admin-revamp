import { NextResponse } from "next/server"

import { authorizeHealthRequest } from "@/lib/health/authorize"
import { HEALTH_CHECK_CATALOG, HEALTH_CHECK_IDS } from "@/lib/health/catalog"
import {
  listHealthCheckCatalog,
  mergeHealthRunResults,
  runHealthChecks,
} from "@/lib/health/runner"
import {
  getHealthRunById,
  getLastHealthRunFromDb,
  listHealthRunHistory,
  saveHealthRunToDb,
} from "@/lib/health/store"
import type { HealthModuleId } from "@/lib/health/types"
import { HEALTH_MODULES } from "@/lib/health/types"

export const dynamic = "force-dynamic"

const MODULE_IDS = new Set(HEALTH_MODULES.map((m) => m.id))

function parseModules(body: unknown): HealthModuleId[] | undefined {
  if (!body || typeof body !== "object") return undefined
  const modules = (body as { modules?: unknown }).modules
  if (!Array.isArray(modules) || modules.length === 0) return undefined
  const filtered = modules.filter(
    (m): m is HealthModuleId =>
      typeof m === "string" && MODULE_IDS.has(m as HealthModuleId)
  )
  return filtered.length ? filtered : undefined
}

function parseCheckIds(body: unknown): string[] | undefined {
  if (!body || typeof body !== "object") return undefined
  const checkIds = (body as { checkIds?: unknown }).checkIds
  if (!Array.isArray(checkIds) || checkIds.length === 0) return undefined
  const filtered = checkIds.filter(
    (id): id is string => typeof id === "string" && HEALTH_CHECK_IDS.has(id)
  )
  return filtered.length ? filtered : undefined
}

function scopeLabel(
  checkIds?: string[],
  modules?: HealthModuleId[]
): string {
  if (checkIds?.length) return `checks:${checkIds.join(",")}`
  if (modules?.length) return `modules:${modules.join(",")}`
  return "all"
}

/** GET — last run + history + catalog. ?runId=… for one detailed report. */
export async function GET(request: Request) {
  const authResult = await authorizeHealthRequest(request)
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  const runId = new URL(request.url).searchParams.get("runId")
  if (runId) {
    const detail = await getHealthRunById(runId)
    if (!detail) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 })
    }
    return NextResponse.json({ run: detail })
  }

  const [lastRun, history] = await Promise.all([
    getLastHealthRunFromDb(),
    listHealthRunHistory(50),
  ])

  return NextResponse.json({
    catalog: listHealthCheckCatalog(),
    checks: HEALTH_CHECK_CATALOG,
    modules: HEALTH_MODULES,
    lastRun,
    history,
  })
}

/**
 * POST — run health checks and persist a detailed report to health.db.
 * Body: `{ modules?: string[], checkIds?: string[] }`
 */
export async function POST(request: Request) {
  const authResult = await authorizeHealthRequest(request)
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const checkIds = parseCheckIds(body)
  const modules = checkIds ? undefined : parseModules(body)
  const isPartial = Boolean(checkIds?.length || modules?.length)

  const partial = await runHealthChecks({
    accessToken: authResult.accessToken,
    triggeredBy: authResult.triggeredBy,
    checkIds,
    modules,
  })

  const previous = await getLastHealthRunFromDb()
  const summary = isPartial
    ? mergeHealthRunResults(previous, partial)
    : partial

  // Persist the report that the UI shows (merged snapshot for partial runs).
  await saveHealthRunToDb({
    summary,
    scope: scopeLabel(checkIds, modules),
    ranBy: authResult.ranBy,
  })

  return NextResponse.json(summary, {
    status: summary.ok ? 200 : 503,
  })
}
