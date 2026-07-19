import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

export function getNairaApiBase(): string {
  const base = process.env.NAIRA_API_URL?.trim()
  if (!base) {
    throw new Error("NAIRA_API_URL is not configured")
  }
  return base.replace(/\/$/, "")
}

export function costApiUrl(path: string) {
  return `${getNairaApiBase()}/api/v1/admin/costs${path}`
}

export async function requireNairaSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    return null
  }
  return session
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function buildQuery(params: URLSearchParams, allowed: string[]) {
  const out = new URLSearchParams()
  for (const key of allowed) {
    const value = params.get(key)
    if (value != null && value !== "") out.set(key, value)
  }
  return out
}

export async function proxyNairaJson(
  upstreamPath: string,
  searchParams: URLSearchParams,
  allowedKeys: string[]
) {
  const session = await requireNairaSession()
  if (!session) return unauthorizedJson()

  let url: string
  try {
    const qs = buildQuery(searchParams, allowedKeys)
    const base = costApiUrl(upstreamPath)
    url = qs.toString() ? `${base}?${qs}` : base
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "NAIRA_API_URL is not configured",
      },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const text = await response.text()
    let body: unknown = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = { raw: text }
    }
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Nyra cost API error (${response.status})`,
          detail: body,
        },
        { status: response.status }
      )
    }
    return NextResponse.json(body)
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to reach Nyra cost API",
      },
      { status: 502 }
    )
  }
}
