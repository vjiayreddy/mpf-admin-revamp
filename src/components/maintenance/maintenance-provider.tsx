"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname } from "next/navigation"
import * as Ably from "ably"

import { MaintenanceLockModal } from "@/components/maintenance/maintenance-lock-modal"
import { MaintenanceWarningDialog } from "@/components/maintenance/maintenance-warning-dialog"
import {
  MAINTENANCE_ABLY_CHANNEL,
  type MaintenanceState,
} from "@/lib/maintenance/types"

const POLL_IDLE_MS = 20_000
const POLL_ACTIVE_MS = 3_000
/** Ops can still open the control page while the rest of the app is locked. */
const LOCK_BYPASS_PREFIX = "/system/maintenance"

type MaintenanceContextValue = {
  state: MaintenanceState | null
  refresh: () => Promise<void>
  /** Apply status from a mutation response so UI closes immediately. */
  applyState: (next: MaintenanceState) => void
}

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null)

export function useMaintenance() {
  const ctx = useContext(MaintenanceContext)
  if (!ctx) {
    throw new Error("useMaintenance must be used within MaintenanceProvider")
  }
  return ctx
}

function idleState(): MaintenanceState {
  return {
    status: "idle",
    message: "",
    startsAt: null,
    endsAtEstimate: null,
    updatedAt: new Date().toISOString(),
    updatedBy: null,
    forceActive: false,
  }
}

async function fetchMaintenance(): Promise<MaintenanceState> {
  const res = await fetch("/api/maintenance", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load maintenance status")
  return (await res.json()) as MaintenanceState
}

export function MaintenanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [state, setState] = useState<MaintenanceState | null>(null)
  const [warningDismissedFor, setWarningDismissedFor] = useState<string | null>(
    null
  )
  const ablyRef = useRef<Ably.Realtime | null>(null)

  const applyState = useCallback((next: MaintenanceState) => {
    setState(next)
    // Closing maintenance must dismiss warning + lock immediately.
    if (next.status === "idle" || next.status === "active") {
      setWarningDismissedFor(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const next = await fetchMaintenance()
      applyState(next)
    } catch {
      // Keep last known state on transient errors.
    }
  }, [applyState])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Poll faster while a notice/lock is live so End clears UI quickly without Ably.
  useEffect(() => {
    const live = state?.status === "upcoming" || state?.status === "active"
    const ms = live ? POLL_ACTIVE_MS : POLL_IDLE_MS
    const id = window.setInterval(() => {
      void refresh()
    }, ms)
    return () => window.clearInterval(id)
  }, [refresh, state?.status])

  useEffect(() => {
    if (state?.status !== "upcoming" || !state.startsAt) return
    const startsAt = Date.parse(state.startsAt)
    if (!Number.isFinite(startsAt)) return
    const delay = Math.max(0, startsAt - Date.now() + 500)
    const id = window.setTimeout(() => {
      void refresh()
    }, delay)
    return () => window.clearTimeout(id)
  }, [state?.status, state?.startsAt, refresh])

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_ABLY_KEY?.trim()
    if (!key) return

    let cancelled = false
    let realtime: Ably.Realtime | null = null

    try {
      realtime = new Ably.Realtime({
        key,
        autoConnect: true,
      })
      ablyRef.current = realtime

      realtime.connection.on("failed", (stateChange) => {
        console.warn(
          "[maintenance] Ably connection failed; using poll only",
          stateChange.reason?.message ?? stateChange.reason
        )
      })

      const channel = realtime.channels.get(MAINTENANCE_ABLY_CHANNEL)

      channel.on("failed", (stateChange) => {
        console.warn(
          "[maintenance] Ably channel denied or failed; using poll only",
          stateChange.reason?.message ?? stateChange.reason
        )
      })

      const onMessage = (message: Ably.Message) => {
        if (cancelled) return
        if (message.name !== "status" || !message.data) return
        applyState(message.data as MaintenanceState)
      }

      void channel.subscribe("status", onMessage).catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : err
        console.warn(
          "[maintenance] Ably subscribe failed; using poll only",
          message
        )
      })
    } catch (err) {
      console.warn("[maintenance] Ably init failed; using poll only", err)
    }

    return () => {
      cancelled = true
      try {
        realtime?.channels.get(MAINTENANCE_ABLY_CHANNEL).unsubscribe()
        realtime?.close()
      } catch {
        // ignore cleanup errors
      }
      ablyRef.current = null
    }
  }, [applyState])

  const value = useMemo(
    () => ({
      state,
      refresh,
      applyState,
    }),
    [state, refresh, applyState]
  )

  const effective = state ?? idleState()
  const bypassLock = pathname.startsWith(LOCK_BYPASS_PREFIX)
  const showLock = effective.status === "active" && !bypassLock
  const warningKey = effective.startsAt || effective.updatedAt
  const showWarning =
    effective.status === "upcoming" && warningDismissedFor !== warningKey

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
      {showLock ? <MaintenanceLockModal state={effective} /> : null}
      <MaintenanceWarningDialog
        state={effective}
        open={showWarning}
        onDismiss={() => setWarningDismissedFor(warningKey)}
      />
    </MaintenanceContext.Provider>
  )
}
