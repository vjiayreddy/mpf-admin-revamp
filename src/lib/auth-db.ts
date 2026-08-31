import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "@/lib/auth-schema"
import { resolveLocalSqliteUrl } from "@/lib/sqlite-url"

const client = createClient({
  url: resolveLocalSqliteUrl(
    process.env.AUTH_DATABASE_URL ?? "file:data/auth.db",
  ),
})

export const authDb = drizzle(client, { schema })
