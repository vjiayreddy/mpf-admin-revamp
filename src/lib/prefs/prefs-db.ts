import { drizzle } from "drizzle-orm/libsql"

import { createLibsqlClient } from "@/lib/libsql-client"
import * as schema from "@/lib/prefs/prefs-schema"

const client = createLibsqlClient({
  urlEnv: "TURSO_DATABASE_URL",
  tokenEnv: "TURSO_DATABASE_TOKEN",
})

export const prefsDb = drizzle(client, { schema })
