"use client"

import { useEffect, useState } from "react"
import { WifiOffIcon, XIcon } from "lucide-react"

import { useNetworkStatus } from "@/components/providers/network-status-provider"
import { cn } from "@/lib/utils"

const SLOW_AUTO_DISMISS_MS = 6000

export function NetworkStatusUi() {
  const {
    isOnline,
    quality,
    showGlobalProgress,
    lastRequestMs,
    effectiveType,
    rtt,
  } = useNetworkStatus()

  const showOffline = !isOnline

  const slowEpisodeKey = `${lastRequestMs ?? "none"}:${effectiveType ?? "none"}:${rtt ?? "none"}`
  const slowActive = isOnline && quality === "slow"

  const [dismissedSlowKey, setDismissedSlowKey] = useState<string | null>(null)
  const [offlineDismissed, setOfflineDismissed] = useState(false)

  // Reset offline dismiss when back online
  useEffect(() => {
    if (isOnline) setOfflineDismissed(false)
  }, [isOnline])

  // Auto-dismiss slow banner; new slow episode (new key) shows again
  useEffect(() => {
    if (!slowActive) return
    if (dismissedSlowKey === slowEpisodeKey) return

    const timer = window.setTimeout(() => {
      setDismissedSlowKey(slowEpisodeKey)
    }, SLOW_AUTO_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [slowActive, slowEpisodeKey, dismissedSlowKey])

  const showSlow =
    slowActive && dismissedSlowKey !== slowEpisodeKey && !showOffline
  const showOfflineBanner = showOffline && !offlineDismissed

  return (
    <>
      <div
        className={cn(
          "bg-primary pointer-events-none fixed top-0 right-0 left-0 z-[100] h-0.5 origin-left transition-[transform,opacity] duration-200",
          showGlobalProgress
            ? "animate-network-progress opacity-100"
            : "scale-x-0 opacity-0"
        )}
        role="progressbar"
        aria-hidden={!showGlobalProgress}
        aria-valuetext={
          showGlobalProgress ? "Network request in progress" : undefined
        }
      />

      {showOfflineBanner ? (
        <div
          className="bg-destructive text-destructive-foreground fixed top-0 right-0 left-0 z-[90] flex items-center justify-center gap-2 px-3 py-2 text-sm"
          role="status"
          aria-live="assertive"
        >
          <WifiOffIcon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 text-center sm:flex-none">
            You’re offline. Saves and updates won’t work until you’re back
            online.
          </span>
          <button
            type="button"
            className="hover:bg-destructive-foreground/15 inline-flex size-7 shrink-0 items-center justify-center rounded-md"
            aria-label="Dismiss offline warning"
            onClick={() => setOfflineDismissed(true)}
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : null}

      {showSlow ? (
        <div
          className={cn(
            "bg-amber-500 text-amber-950 fixed right-3 z-[90] flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] leading-tight shadow-sm sm:text-[11px]",
            showOfflineBanner ? "top-12" : "top-2"
          )}
          role="status"
          aria-live="polite"
        >
          <span>
            {[
              effectiveType?.toUpperCase(),
              rtt != null ? `${Math.round(rtt)}ms` : null,
              lastRequestMs != null && lastRequestMs >= 1500
                ? `API ${(lastRequestMs / 1000).toFixed(1)}s`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <button
            type="button"
            className="hover:bg-amber-950/10 inline-flex size-4 shrink-0 items-center justify-center rounded"
            aria-label="Dismiss slow network warning"
            onClick={() => setDismissedSlowKey(slowEpisodeKey)}
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ) : null}
    </>
  )
}
