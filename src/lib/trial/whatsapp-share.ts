function appOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  return "https://admin2.myperfectfit.co.in"
}

export function trialShareUrl(trialId: string): string {
  return `${appOrigin()}/shared/trail-details/${trialId}`
}

export function openTrialWhatsAppShare(trialId: string) {
  const url = trialShareUrl(trialId)
  const message = `Please click the link below for your order trail details:\n${url}\n\n`
  window.open(
    `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  )
}
