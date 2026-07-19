"use client"

import { authClient } from "@/lib/auth-client"
import { LOGOUT_STYLIST } from "@/lib/graphql/queries/user"

/**
 * Full logout: GraphQL stylist session (best-effort), clear local id,
 * then Better Auth signOut which deletes the auth.db session + cookie.
 */
export async function signOutFully() {
  try {
    const session = await authClient.getSession()
    const sessionId =
      session.data?.user?.activeStylistSessionId ||
      (typeof window !== "undefined"
        ? window.localStorage.getItem("active_session_id")
        : null)
    const token = session.data?.user?.mpfAccessToken
    const apiUrl = process.env.NEXT_PUBLIC_MPF_API_URL

    if (sessionId && token && apiUrl) {
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: LOGOUT_STYLIST,
          variables: { sessionId },
        }),
      }).catch(() => undefined)
    }
  } catch {
    // continue with local sign-out
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("active_session_id")
  }

  await authClient.signOut()
}
