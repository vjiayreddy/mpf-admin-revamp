"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  getNetworkActivitySnapshot,
  getServerNetworkActivitySnapshot,
  subscribeNetworkActivity,
} from "@/lib/network/activity-store"
import {
  deriveNetworkQuality,
  getNavigatorConnection,
  isBrowserOnline,
  type ConnectionEffectiveType,
  type NetworkQuality,
} from "@/lib/network/connection"

export type NetworkStatusValue = {
  isOnline: boolean
  quality: NetworkQuality
  effectiveType: ConnectionEffectiveType | null
  rtt: number | null
  downlink: number | null
  inFlightCount: number
  lastRequestMs: number | null
  /** True when a request is in flight long enough (or on slow net) to show global chrome. */
  showGlobalProgress: boolean
}

const NetworkStatusContext = createContext<NetworkStatusValue | null>(null)

const PROGRESS_DELAY_MS = 300

function useConnectionInfo() {
  const [online, setOnline] = useState(true)
  const [effectiveType, setEffectiveType] =
    useState<ConnectionEffectiveType | null>(null)
  const [rtt, setRtt] = useState<number | null>(null)
  const [downlink, setDownlink] = useState<number | null>(null)

  useEffect(() => {
    const sync = () => {
      setOnline(isBrowserOnline())
      const connection = getNavigatorConnection()
      setEffectiveType(connection?.effectiveType ?? null)
      setRtt(connection?.rtt ?? null)
      setDownlink(connection?.downlink ?? null)
    }

    sync()

    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)

    const connection = getNavigatorConnection()
    connection?.addEventListener?.("change", sync)

    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
      connection?.removeEventListener?.("change", sync)
    }
  }, [])

  return { online, effectiveType, rtt, downlink }
}

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const { online, effectiveType, rtt, downlink } = useConnectionInfo()
  const activity = useSyncExternalStore(
    subscribeNetworkActivity,
    getNetworkActivitySnapshot,
    getServerNetworkActivitySnapshot
  )

  const quality = useMemo(
    () =>
      deriveNetworkQuality({
        online,
        effectiveType,
        rtt,
        lastRequestMs: activity.lastRequestMs,
      }),
    [online, effectiveType, rtt, activity.lastRequestMs]
  )

  const [showGlobalProgress, setShowGlobalProgress] = useState(false)

  useEffect(() => {
    if (activity.inFlightCount <= 0) {
      setShowGlobalProgress(false)
      return
    }

    // Slow / offline / unknown-but-in-flight: show immediately when slow
    if (quality === "slow" || quality === "offline") {
      setShowGlobalProgress(true)
      return
    }

    // Fast path: only show global bar if request lasts past delay
    const timer = window.setTimeout(() => {
      setShowGlobalProgress(true)
    }, PROGRESS_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [activity.inFlightCount, quality, activity.updatedAt])

  const value = useMemo<NetworkStatusValue>(
    () => ({
      isOnline: online,
      quality,
      effectiveType,
      rtt,
      downlink,
      inFlightCount: activity.inFlightCount,
      lastRequestMs: activity.lastRequestMs,
      showGlobalProgress:
        activity.inFlightCount > 0 && showGlobalProgress,
    }),
    [
      online,
      quality,
      effectiveType,
      rtt,
      downlink,
      activity.inFlightCount,
      activity.lastRequestMs,
      showGlobalProgress,
    ]
  )

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  )
}

export function useNetworkStatus() {
  const value = useContext(NetworkStatusContext)
  if (!value) {
    throw new Error("useNetworkStatus must be used within NetworkStatusProvider")
  }
  return value
}
