/** Module singleton so Apollo Link can report activity outside React. */

export type NetworkActivitySnapshot = {
  inFlightCount: number
  lastRequestMs: number | null
  updatedAt: number
}

type Listener = () => void

let inFlightCount = 0
let lastRequestMs: number | null = null
let updatedAt = 0
const listeners = new Set<Listener>()

/** Stable snapshot refs — required by useSyncExternalStore (Object.is). */
let clientSnapshot: NetworkActivitySnapshot = {
  inFlightCount: 0,
  lastRequestMs: null,
  updatedAt: 0,
}

const SERVER_SNAPSHOT: NetworkActivitySnapshot = {
  inFlightCount: 0,
  lastRequestMs: null,
  updatedAt: 0,
}

let notifyScheduled = false

function refreshClientSnapshot() {
  clientSnapshot = {
    inFlightCount,
    lastRequestMs,
    updatedAt,
  }
}

/**
 * Update snapshot immediately, but notify React subscribers asynchronously.
 * Apollo can start requests during render; sync listeners would call setState
 * on NetworkStatusProvider while another component is rendering.
 */
function emit() {
  updatedAt = Date.now()
  refreshClientSnapshot()

  if (notifyScheduled) return
  notifyScheduled = true

  queueMicrotask(() => {
    notifyScheduled = false
    for (const listener of listeners) {
      listener()
    }
  })
}

export function trackRequestStart() {
  inFlightCount += 1
  emit()
}

export function trackRequestEnd(durationMs: number) {
  inFlightCount = Math.max(0, inFlightCount - 1)
  lastRequestMs = durationMs
  emit()
}

export function getNetworkActivitySnapshot(): NetworkActivitySnapshot {
  return clientSnapshot
}

export function subscribeNetworkActivity(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getServerNetworkActivitySnapshot(): NetworkActivitySnapshot {
  return SERVER_SNAPSHOT
}
