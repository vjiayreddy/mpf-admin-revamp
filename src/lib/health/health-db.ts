import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "@/lib/health/health-schema"
import { resolveLocalSqliteUrl } from "@/lib/sqlite-url"

const client = createClient({
  url: resolveLocalSqliteUrl(
    process.env.HEALTH_DATABASE_URL ?? "file:data/health.db",
  ),
})

export const healthDb = drizzle(client, { schema })
