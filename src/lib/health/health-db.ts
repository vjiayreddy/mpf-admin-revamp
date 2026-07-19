import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "@/lib/health/health-schema"

const client = createClient({
  url: process.env.HEALTH_DATABASE_URL ?? "file:data/health.db",
})

export const healthDb = drizzle(client, { schema })
