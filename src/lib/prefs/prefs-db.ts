import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "@/lib/prefs/prefs-schema"
import { resolveLocalSqliteUrl } from "@/lib/sqlite-url"

const client = createClient({
  url: resolveLocalSqliteUrl(
    process.env.PREFS_DATABASE_URL ?? "file:data/prefs.db",
  ),
})

export const prefsDb = drizzle(client, { schema })
