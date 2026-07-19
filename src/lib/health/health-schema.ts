import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

/** One health suite execution (full or partial). */
export const healthRuns = sqliteTable("health_runs", {
  id: text("id").primaryKey(),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at").notNull(),
  durationMs: integer("duration_ms").notNull(),
  ok: integer("ok", { mode: "boolean" }).notNull(),
  passed: integer("passed").notNull(),
  failed: integer("failed").notNull(),
  skipped: integer("skipped").notNull(),
  triggeredBy: text("triggered_by").notNull(),
  ranBy: text("ran_by"),
  scope: text("scope").notNull().default("all"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .defaultNow()
    .notNull(),
})

/** Per-endpoint result rows for a run. */
export const healthCheckResults = sqliteTable("health_check_results", {
  id: text("id").primaryKey(),
  runId: text("run_id")
    .notNull()
    .references(() => healthRuns.id, { onDelete: "cascade" }),
  checkId: text("check_id").notNull(),
  module: text("module").notNull(),
  name: text("name").notNull(),
  ok: integer("ok", { mode: "boolean" }).notNull(),
  skipped: integer("skipped", { mode: "boolean" }).notNull().default(false),
  durationMs: integer("duration_ms").notNull(),
  detail: text("detail"),
  error: text("error"),
})
