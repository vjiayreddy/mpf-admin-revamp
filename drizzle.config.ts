import { defineConfig } from "drizzle-kit"

import { resolveLocalSqliteUrl } from "./src/lib/sqlite-url"

export default defineConfig({
  schema: "./src/lib/auth-schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveLocalSqliteUrl(
      process.env.AUTH_DATABASE_URL ?? "file:data/auth.db",
    ),
  },
})
