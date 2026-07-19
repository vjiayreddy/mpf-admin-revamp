import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/health/health-schema.ts",
  out: "./drizzle-health",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.HEALTH_DATABASE_URL ?? "file:data/health.db",
  },
})
