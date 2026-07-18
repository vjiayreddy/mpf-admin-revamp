"use client"

import { WifiOffIcon } from "lucide-react"

import { useNetworkStatus } from "@/components/providers/network-status-provider"
import { cn } from "@/lib/utils"

export function NetworkStatusUi() {
  const {
    isOnline,
    quality,
    showGlobalProgress,
    inFlightCount,
    lastRequestMs,
    effectiveType,
    rtt,
  } = useNetworkStatus()

  const showOffline = !isOnline
  const showSlow = isOnline && quality === "slow"

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

      {showOffline ? (
        <div
          className="bg-destructive text-destructive-foreground fixed top-0 right-0 left-0 z-[90] flex items-center justify-center gap-2 px-3 py-2 text-center text-sm"
          role="status"
          aria-live="assertive"
        >
          <WifiOffIcon className="size-4 shrink-0" />
          <span>
            You’re offline. Saves and updates won’t work until you’re back
            online.
          </span>
        </div>
      ) : null}

      {showSlow ? (
        <div
          className={cn(
            "bg-amber-500 text-amber-950 fixed right-0 left-0 z-[90] flex items-center justify-center gap-2 px-3 py-1.5 text-center text-xs sm:text-sm",
            showOffline ? "top-10" : "top-0"
          )}
          role="status"
          aria-live="polite"
        >
          <span>
            Slow network detected
            {effectiveType ? ` (${effectiveType})` : ""}
            {rtt != null ? ` · RTT ~${Math.round(rtt)}ms` : ""}
            {lastRequestMs != null && lastRequestMs >= 1500
              ? ` · last API ${Math.round(lastRequestMs)}ms`
              : ""}
            {inFlightCount > 0 ? " · working…" : ""}
          </span>
        </div>
      ) : null}
    </>
  )
}
