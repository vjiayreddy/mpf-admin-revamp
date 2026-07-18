export type ConnectionEffectiveType = "slow-2g" | "2g" | "3g" | "4g"

export type NetworkQuality = "offline" | "slow" | "fast" | "unknown"

type NetworkInformationLike = {
  effectiveType?: ConnectionEffectiveType
  rtt?: number
  downlink?: number
  saveData?: boolean
  addEventListener?: (type: "change", listener: () => void) => void
  removeEventListener?: (type: "change", listener: () => void) => void
}

declare global {
  interface Navigator {
    connection?: NetworkInformationLike
    mozConnection?: NetworkInformationLike
    webkitConnection?: NetworkInformationLike
  }
}

export function getNavigatorConnection(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") return null
  return (
    navigator.connection ??
    navigator.mozConnection ??
    navigator.webkitConnection ??
    null
  )
}

export function isBrowserOnline() {
  if (typeof navigator === "undefined") return true
  return navigator.onLine
}

/**
 * Derive quality from browser Network Information API + measured request RTT.
 * Measured latency wins when available (API can be slow even on "4g").
 */
export function deriveNetworkQuality(input: {
  online: boolean
  effectiveType?: ConnectionEffectiveType | null
  rtt?: number | null
  lastRequestMs?: number | null
}): NetworkQuality {
  if (!input.online) return "offline"

  if (
    input.lastRequestMs != null &&
    Number.isFinite(input.lastRequestMs) &&
    input.lastRequestMs >= 1500
  ) {
    return "slow"
  }

  const type = input.effectiveType
  if (type === "slow-2g" || type === "2g") return "slow"
  if (input.rtt != null && input.rtt >= 500) return "slow"

  if (
    input.lastRequestMs != null &&
    Number.isFinite(input.lastRequestMs) &&
    input.lastRequestMs < 1500
  ) {
    return "fast"
  }

  if (type === "4g" || type === "3g") return "fast"
  if (type || input.rtt != null) return "fast"

  return "unknown"
}
