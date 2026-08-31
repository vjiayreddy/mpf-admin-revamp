import { defineConfig } from "drizzle-kit"

import { drizzleLibsqlConfig } from "./src/lib/libsql-client"

const { dialect, dbCredentials } = drizzleLibsqlConfig(
  "TURSO_DATABASE_URL",
  "TURSO_DATABASE_TOKEN",
)

export default defineConfig({
  schema: [
    "./src/lib/auth-schema.ts",
    "./src/lib/prefs/prefs-schema.ts",
    "./src/lib/health/health-schema.ts",
  ],
  out: "./drizzle",
  dialect,
  dbCredentials,
})
