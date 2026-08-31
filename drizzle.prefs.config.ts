import { defineConfig } from "drizzle-kit"

import { resolveLocalSqliteUrl } from "./src/lib/sqlite-url"

export default defineConfig({
  schema: "./src/lib/prefs/prefs-schema.ts",
  out: "./drizzle-prefs",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveLocalSqliteUrl(
      process.env.PREFS_DATABASE_URL ?? "file:data/prefs.db",
    ),
  },
})
