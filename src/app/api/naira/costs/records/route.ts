import { type NextRequest } from "next/server"

import { proxyNairaJson } from "@/lib/naira/server-proxy"

export async function GET(request: NextRequest) {
  return proxyNairaJson("/records", request.nextUrl.searchParams, [
    "provider",
    "model",
    "service",
    "limit",
    "skip",
    "start_date",
    "end_date",
    "user_id",
    "session_id",
  ])
}
