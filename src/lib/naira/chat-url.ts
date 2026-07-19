/** Browser-visible Nyra chat embed URL (includes auto-login query params). */
export function getNairaChatUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_NAIRA_CHAT_URL?.trim()
  return url || null
}
