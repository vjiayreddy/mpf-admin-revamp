export type HealthModuleId =
  | "core"
  | "customers"
  | "measurements"
  | "appointments"
  | "cif"
  | "orders"
  | "products"
  | "companion"

export type HealthCheckContext = {
  /** Bearer token for MPF GraphQL. */
  accessToken: string
  /** Optional known-good customer id for get-by-id checks. */
  testCustomerId: string | null
  /** AbortSignal for per-check timeout. */
  signal: AbortSignal
}

export type HealthCheckOutcome = {
  ok: boolean
  detail?: string
}

export type HealthCheckDefinition = {
  id: string
  module: HealthModuleId
  name: string
  timeoutMs: number
  /** Skip when required env (e.g. test customer) is missing. */
  optional?: boolean
  run: (ctx: HealthCheckContext) => Promise<HealthCheckOutcome>
}

export type HealthCheckResult = {
  checkId: string
  module: HealthModuleId
  name: string
  ok: boolean
  skipped?: boolean
  durationMs: number
  detail?: string
  error?: string
}

export type HealthRunSummary = {
  runId: string
  startedAt: string
  finishedAt: string
  durationMs: number
  ok: boolean
  passed: number
  failed: number
  skipped: number
  results: HealthCheckResult[]
  triggeredBy: "session" | "secret"
  scope?: string
  ranBy?: string | null
}

export type HealthRunHistoryItem = {
  runId: string
  startedAt: string
  finishedAt: string
  durationMs: number
  ok: boolean
  passed: number
  failed: number
  skipped: number
  triggeredBy: string
  ranBy: string | null
  scope: string
}

export const HEALTH_MODULES: {
  id: HealthModuleId
  label: string
}[] = [
  { id: "core", label: "Core API" },
  { id: "customers", label: "Customers" },
  { id: "measurements", label: "Measurements" },
  { id: "appointments", label: "Appointments" },
  { id: "cif", label: "CIF" },
  { id: "orders", label: "Track Orders" },
  { id: "products", label: "Products" },
  { id: "companion", label: "Companion / Uploads" },
]
