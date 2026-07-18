import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "@/lib/auth-schema"

const client = createClient({
  url: process.env.AUTH_DATABASE_URL ?? "file:data/auth.db",
})

export const authDb = drizzle(client, { schema })
