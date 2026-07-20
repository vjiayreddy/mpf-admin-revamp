const DEFAULT_LOOKBOOK_URL =
  "https://mystyleclub-admin.vercel.app/admin2-lookbook-view"

/** Browser-visible Style Club admin Look Book embed URL. */
export function getLookbookUrl(): string {
  const url = process.env.NEXT_PUBLIC_LOOKBOOK_URL?.trim()
  return url || DEFAULT_LOOKBOOK_URL
}
