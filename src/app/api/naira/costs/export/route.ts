import { type NextRequest, NextResponse } from "next/server"

import {
  buildQuery,
  costApiUrl,
  requireNairaSession,
  unauthorizedJson,
} from "@/lib/naira/server-proxy"

export async function GET(request: NextRequest) {
  const session = await requireNairaSession()
  if (!session) return unauthorizedJson()

  const format = request.nextUrl.searchParams.get("format") || "json"
  const qs = buildQuery(request.nextUrl.searchParams, [
    "days",
    "format",
    "start_date",
    "end_date",
  ])
  if (!qs.has("format")) qs.set("format", format)

  let url: string
  try {
    url = `${costApiUrl("/export")}?${qs.toString()}`
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
      body = { data: text, format }
    }
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Nyra export error (${response.status})`,
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
          err instanceof Error ? err.message : "Failed to export cost data",
      },
      { status: 502 }
    )
  }
}
