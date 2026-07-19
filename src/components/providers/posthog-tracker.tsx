"use client"

import { Suspense, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import {
  capturePageview,
  identifyUser,
  resetPostHog,
} from "@/lib/posthog/client"
import { isPostHogEnabled } from "@/lib/posthog/config"

function PostHogPageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastUrl = useRef<string | null>(null)

  useEffect(() => {
    if (!isPostHogEnabled()) return
    const qs = searchParams?.toString()
    const url = qs ? `${window.origin}${pathname}?${qs}` : `${window.origin}${pathname}`
    if (lastUrl.current === url) return
    lastUrl.current = url
    capturePageview(url)
  }, [pathname, searchParams])

  return null
}

function PostHogIdentify() {
  const { data: session, isPending } = authClient.useSession()
  const identifiedId = useRef<string | null>(null)

  useEffect(() => {
    if (!isPostHogEnabled() || isPending) return

    const user = session?.user
    if (user?.id) {
      if (identifiedId.current === user.id) return
      identifiedId.current = user.id
      identifyUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? null,
      })
      return
    }

    if (identifiedId.current) {
      identifiedId.current = null
      resetPostHog()
    }
  }, [session, isPending])

  return null
}

/**
 * Pageviews + identify for App Router. Safe no-op when PostHog env is unset.
 */
export function PostHogTracker() {
  if (!isPostHogEnabled()) return null

  return (
    <>
      <PostHogIdentify />
      <Suspense fallback={null}>
        <PostHogPageViews />
      </Suspense>
    </>
  )
}
