import { GraphQLClient } from "graphql-request"

import type { HealthCheckContext, HealthCheckOutcome } from "@/lib/health/types"

export function createHealthGraphqlClient(
  ctx: HealthCheckContext
): GraphQLClient {
  const apiUrl = process.env.MPF_API_URL ?? process.env.NEXT_PUBLIC_MPF_API_URL
  if (!apiUrl) {
    throw new Error("MPF_API_URL is not configured")
  }

  return new GraphQLClient(apiUrl, {
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
    },
  })
}

export async function graphqlHealthQuery<T>(
  ctx: HealthCheckContext,
  document: string,
  variables?: Record<string, unknown>
): Promise<{ ok: true; data: T } | { ok: false; detail: string }> {
  const client = createHealthGraphqlClient(ctx)
  try {
    const data = await client.request<T>({
      document,
      variables,
      signal: ctx.signal,
    })
    return { ok: true, data }
  } catch (err) {
    return { ok: false, detail: healthErrorMessage(err) }
  }
}

export function toOutcome(
  result: { ok: true; data: unknown } | { ok: false; detail: string },
  detailOnOk?: string
): HealthCheckOutcome {
  if (!result.ok) return { ok: false, detail: result.detail }
  return { ok: true, detail: detailOnOk ?? "ok" }
}

export function healthErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.replace(/\s+/g, " ").trim()
    return msg.length > 240 ? `${msg.slice(0, 237)}…` : msg
  }
  return "Unknown error"
}
