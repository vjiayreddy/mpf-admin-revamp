import { defineConfig } from "drizzle-kit"

import { resolveLocalSqliteUrl } from "./src/lib/sqlite-url"

export default defineConfig({
  schema: "./src/lib/health/health-schema.ts",
  out: "./drizzle-health",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveLocalSqliteUrl(
      process.env.HEALTH_DATABASE_URL ?? "file:data/health.db",
    ),
  },
})
