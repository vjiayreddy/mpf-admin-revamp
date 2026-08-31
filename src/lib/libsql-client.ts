import { createClient, type Client } from "@libsql/client"

type LibsqlClientOptions = {
  urlEnv: string
  tokenEnv: string
}

export function createLibsqlClient({ urlEnv, tokenEnv }: LibsqlClientOptions): Client {
  const url = process.env[urlEnv]
  if (!url) {
    throw new Error(`${urlEnv} is not set`)
  }

  const authToken = process.env[tokenEnv]
  const isRemote = url.startsWith("libsql://") || url.startsWith("https://")
  if (isRemote && !authToken) {
    throw new Error(`${tokenEnv} is required for Turso (${urlEnv})`)
  }

  return createClient({
    url,
    ...(authToken ? { authToken } : {}),
  })
}

export function libsqlCredentials(urlEnv: string, tokenEnv: string) {
  const url = process.env[urlEnv]
  if (!url) {
    throw new Error(`${urlEnv} is not set`)
  }

  const authToken = process.env[tokenEnv]
  const isRemote = url.startsWith("libsql://") || url.startsWith("https://")
  if (isRemote && !authToken) {
    throw new Error(`${tokenEnv} is required for Turso (${urlEnv})`)
  }

  return {
    url,
    ...(authToken ? { authToken } : {}),
  }
}

export function drizzleLibsqlConfig(urlEnv: string, tokenEnv: string) {
  const url = process.env[urlEnv]
  if (!url) {
    throw new Error(`${urlEnv} is not set`)
  }

  const isRemote = url.startsWith("libsql://") || url.startsWith("https://")
  if (isRemote) {
    return {
      dialect: "turso" as const,
      dbCredentials: libsqlCredentials(urlEnv, tokenEnv),
    }
  }

  return {
    dialect: "sqlite" as const,
    dbCredentials: { url },
  }
}
