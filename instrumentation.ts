import type { Instrumentation } from "next"

import { isPostHogEnabled } from "@/lib/posthog/config"

/**
 * Next.js server instrumentation — PostHog Error Tracking via onRequestError.
 * @see https://posthog.com/docs/error-tracking/installation/nextjs
 */
export function register() {
  // No-op: PostHog server client is created per capture call.
}

function distinctIdFromCookieHeader(
  cookieHeader: string | string[] | undefined
): string | undefined {
  if (!cookieHeader) return undefined

  const cookieString = Array.isArray(cookieHeader)
    ? cookieHeader.join("; ")
    : cookieHeader

  const match = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/)
  if (!match?.[1]) return undefined

  try {
    const decoded = decodeURIComponent(match[1])
    const data = JSON.parse(decoded) as { distinct_id?: unknown }
    return typeof data.distinct_id === "string" ? data.distinct_id : undefined
  } catch {
    return undefined
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  if (!isPostHogEnabled()) return

  const { captureServerException } = await import("@/lib/posthog/server")

  const distinctId = distinctIdFromCookieHeader(request.headers.cookie)

  await captureServerException(err, distinctId, {
    next_path: request.path,
    next_method: request.method,
    next_router_kind: context.routerKind,
    next_route_path: context.routePath,
    next_route_type: context.routeType,
  })
}
