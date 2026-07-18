import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/auth-schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL ?? "file:data/auth.db",
  },
})
