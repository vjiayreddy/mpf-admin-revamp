import { type NextRequest } from "next/server"

import { proxyNairaJson } from "@/lib/naira/server-proxy"

export async function GET(request: NextRequest) {
  return proxyNairaJson("/gcp/costs", request.nextUrl.searchParams, [
    "days",
    "group_by",
    "start_date",
    "end_date",
  ])
}
