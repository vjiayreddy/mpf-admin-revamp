import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export type HealthAuthOk = {
  accessToken: string
  triggeredBy: "session" | "secret"
  ranBy: string | null
}

export type HealthAuthFail = {
  error: string
  status: number
}

/**
 * Authorize health runner:
 * - Bearer HEALTH_RUN_SECRET + HEALTH_MPF_ACCESS_TOKEN (cron)
 * - or logged-in session with mpfAccessToken (Run now)
 */
export async function authorizeHealthRequest(
  request: Request
): Promise<HealthAuthOk | HealthAuthFail> {
  const authHeader = request.headers.get("authorization")
  const secret = process.env.HEALTH_RUN_SECRET?.trim()

  if (secret && authHeader === `Bearer ${secret}`) {
    const token = process.env.HEALTH_MPF_ACCESS_TOKEN?.trim()
    if (!token) {
      return {
        error:
          "HEALTH_MPF_ACCESS_TOKEN is required when using HEALTH_RUN_SECRET",
        status: 500,
      }
    }
    return { accessToken: token, triggeredBy: "secret", ranBy: "cron" }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const token = session?.user?.mpfAccessToken
  if (!token) {
    return {
      error: "Unauthorized — sign in or pass HEALTH_RUN_SECRET",
      status: 401,
    }
  }

  return {
    accessToken: token,
    triggeredBy: "session",
    ranBy: session.user.email ?? session.user.name ?? session.user.id ?? null,
  }
}
