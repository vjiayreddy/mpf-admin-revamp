"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"

const POLL_MS = 20_000

/**
 * Detects revoked sessions (e.g. admin force-logout) while the tab stays open.
 * When getSession returns null, clear cookie/local state and send user to login.
 */
export function SessionGuard() {
  const router = useRouter()
  const redirecting = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (cancelled || redirecting.current) return
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }

      try {
        const result = await authClient.getSession()
        if (cancelled || redirecting.current) return

        if (!result.data?.session) {
          redirecting.current = true
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("active_session_id")
          }
          await authClient.signOut().catch(() => undefined)
          router.replace("/login")
          router.refresh()
        }
      } catch {
        // network blips — ignore; next poll / navigation will retry
      }
    }

    void check()
    const id = window.setInterval(() => void check(), POLL_MS)

    const onVisible = () => {
      if (document.visibilityState === "visible") void check()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [router])

  return null
}
