import { desc, eq } from "drizzle-orm"

import { healthDb } from "@/lib/health/health-db"
import {
  healthCheckResults,
  healthRuns,
} from "@/lib/health/health-schema"
import type {
  HealthCheckResult,
  HealthModuleId,
  HealthRunHistoryItem,
  HealthRunSummary,
} from "@/lib/health/types"

export type { HealthRunHistoryItem }

function newResultRowId() {
  return `hcr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export type SaveHealthRunOptions = {
  summary: HealthRunSummary
  /** What was requested this time: all | modules:… | checks:… */
  scope?: string
  ranBy?: string | null
}

/** Persist a full detailed report to health.db */
export async function saveHealthRunToDb(
  options: SaveHealthRunOptions
): Promise<void> {
  const { summary, scope = "all", ranBy = null } = options

  await healthDb.insert(healthRuns).values({
    id: summary.runId,
    startedAt: summary.startedAt,
    finishedAt: summary.finishedAt,
    durationMs: summary.durationMs,
    ok: summary.ok,
    passed: summary.passed,
    failed: summary.failed,
    skipped: summary.skipped,
    triggeredBy: summary.triggeredBy,
    ranBy,
    scope,
  })

  if (summary.results.length) {
    await healthDb.insert(healthCheckResults).values(
      summary.results.map((r) => ({
        id: newResultRowId(),
        runId: summary.runId,
        checkId: r.checkId,
        module: r.module,
        name: r.name,
        ok: r.ok,
        skipped: Boolean(r.skipped),
        durationMs: r.durationMs,
        detail: r.detail ?? null,
        error: r.error ?? null,
      }))
    )
  }
}

function rowToSummary(
  run: typeof healthRuns.$inferSelect,
  results: (typeof healthCheckResults.$inferSelect)[]
): HealthRunSummary {
  return {
    runId: run.id,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    durationMs: run.durationMs,
    ok: run.ok,
    passed: run.passed,
    failed: run.failed,
    skipped: run.skipped,
    triggeredBy: run.triggeredBy as HealthRunSummary["triggeredBy"],
    scope: run.scope,
    ranBy: run.ranBy,
    results: results.map(
      (r): HealthCheckResult => ({
        checkId: r.checkId,
        module: r.module as HealthModuleId,
        name: r.name,
        ok: r.ok,
        skipped: r.skipped,
        durationMs: r.durationMs,
        detail: r.detail ?? undefined,
        error: r.error ?? undefined,
      })
    ),
  }
}

/** Latest saved report (full detail). */
export async function getLastHealthRunFromDb(): Promise<HealthRunSummary | null> {
  const [run] = await healthDb
    .select()
    .from(healthRuns)
    .orderBy(desc(healthRuns.createdAt))
    .limit(1)

  if (!run) return null

  const results = await healthDb
    .select()
    .from(healthCheckResults)
    .where(eq(healthCheckResults.runId, run.id))

  return rowToSummary(run, results)
}

/** Recent runs without per-check rows (for history list). */
export async function listHealthRunHistory(
  limit = 20
): Promise<HealthRunHistoryItem[]> {
  const rows = await healthDb
    .select()
    .from(healthRuns)
    .orderBy(desc(healthRuns.createdAt))
    .limit(limit)

  return rows.map((run) => ({
    runId: run.id,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    durationMs: run.durationMs,
    ok: run.ok,
    passed: run.passed,
    failed: run.failed,
    skipped: run.skipped,
    triggeredBy: run.triggeredBy,
    ranBy: run.ranBy,
    scope: run.scope,
  }))
}

export async function getHealthRunById(
  runId: string
): Promise<HealthRunSummary | null> {
  const [run] = await healthDb
    .select()
    .from(healthRuns)
    .where(eq(healthRuns.id, runId))
    .limit(1)

  if (!run) return null

  const results = await healthDb
    .select()
    .from(healthCheckResults)
    .where(eq(healthCheckResults.runId, run.id))

  return rowToSummary(run, results)
}
