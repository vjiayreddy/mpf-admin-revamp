export function formatMaintenanceCountdown(ms: number) {
  if (ms <= 0) {
    return {
      hours: "0",
      minutes: "00",
      seconds: "00",
      label: "0:00",
      totalHours: 0,
    }
  }
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const hours = String(h)
  const minutes = String(m).padStart(2, "0")
  const seconds = String(s).padStart(2, "0")
  const label = h > 0 ? `${hours}:${minutes}:${seconds}` : `${m}:${seconds}`
  return { hours, minutes, seconds, label, totalHours: h }
}

export function formatMaintenanceWhen(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
