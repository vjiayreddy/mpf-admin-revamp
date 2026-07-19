/** Shared PostHog env checks (safe for client + server). */

export function isPostHogEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_POSTHOG_DISABLED === "true") return false
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  return Boolean(key)
}

export function getPostHogHost(): string {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
  )
}

export function getPostHogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || undefined
}
