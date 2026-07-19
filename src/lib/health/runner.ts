import { healthChecks } from "@/lib/health/checks"
import type {
  HealthCheckResult,
  HealthModuleId,
  HealthRunSummary,
} from "@/lib/health/types"

export type RunHealthOptions = {
  accessToken: string
  /** Run only these modules (all endpoints in each). */
  modules?: HealthModuleId[]
  /** Run only these specific check/endpoint ids. */
  checkIds?: string[]
  triggeredBy: "session" | "secret"
  testCustomerId?: string | null
}

function makeRunId() {
  return `hr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function runOneCheck(
  check: (typeof healthChecks)[number],
  accessToken: string,
  testCustomerId: string | null
): Promise<HealthCheckResult> {
  const started = performance.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), check.timeoutMs)

  try {
    const outcome = await check.run({
      accessToken,
      testCustomerId,
      signal: controller.signal,
    })

    const detail = outcome.detail ?? ""
    const skipped = detail.toLowerCase().startsWith("skipped")

    return {
      checkId: check.id,
      module: check.module,
      name: check.name,
      ok: outcome.ok,
      skipped,
      durationMs: Math.round(performance.now() - started),
      detail: outcome.detail,
      error: outcome.ok ? undefined : outcome.detail,
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? `timed out after ${check.timeoutMs}ms`
          : err.message
        : "check failed"
    return {
      checkId: check.id,
      module: check.module,
      name: check.name,
      ok: false,
      durationMs: Math.round(performance.now() - started),
      error: message,
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Run health checks sequentially.
 * Filter by checkIds (endpoint) and/or modules. Read-only — no writes.
 */
export async function runHealthChecks(
  options: RunHealthOptions
): Promise<HealthRunSummary> {
  const startedAt = new Date()
  const runId = makeRunId()
  const testCustomerId =
    options.testCustomerId ??
    process.env.HEALTH_TEST_CUSTOMER_ID?.trim() ??
    null

  let selected = healthChecks

  if (options.checkIds?.length) {
    const idSet = new Set(options.checkIds)
    selected = selected.filter((c) => idSet.has(c.id))
  } else if (options.modules?.length) {
    const modSet = new Set(options.modules)
    selected = selected.filter((c) => modSet.has(c.module))
  }

  const results: HealthCheckResult[] = []

  for (const check of selected) {
    results.push(await runOneCheck(check, options.accessToken, testCustomerId))
  }

  const finishedAt = new Date()
  const passed = results.filter((r) => r.ok && !r.skipped).length
  const skipped = results.filter((r) => r.skipped).length
  const failed = results.filter((r) => !r.ok).length

  return {
    runId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    ok: failed === 0,
    passed,
    failed,
    skipped,
    results,
    triggeredBy: options.triggeredBy,
  }
}

/** Merge a partial run into the previous summary (keep other endpoint results). */
export function mergeHealthRunResults(
  previous: HealthRunSummary | null,
  partial: HealthRunSummary
): HealthRunSummary {
  if (!previous) return partial

  const byId = new Map<string, HealthCheckResult>()
  for (const r of previous.results) byId.set(r.checkId, r)
  for (const r of partial.results) byId.set(r.checkId, r)

  const results = Array.from(byId.values())
  const passed = results.filter((r) => r.ok && !r.skipped).length
  const skipped = results.filter((r) => r.skipped).length
  const failed = results.filter((r) => !r.ok).length

  return {
    ...partial,
    results,
    passed,
    failed,
    skipped,
    ok: failed === 0,
  }
}

export function listHealthCheckCatalog() {
  return healthChecks.map((c) => ({
    id: c.id,
    module: c.module,
    name: c.name,
    optional: Boolean(c.optional),
    timeoutMs: c.timeoutMs,
  }))
}
