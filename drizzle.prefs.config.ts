import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/prefs/prefs-schema.ts",
  out: "./drizzle-prefs",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.PREFS_DATABASE_URL ?? "file:data/prefs.db",
  },
})
