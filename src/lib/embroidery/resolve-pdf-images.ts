/** Collect remote image URLs from embroidery detail and resolve to data URLs for react-pdf. */

import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import { firstImageUrl } from "@/lib/embroidery/format"

function pushUrl(set: Set<string>, url?: string | null) {
  const trimmed = url?.trim()
  if (!trimmed) return
  if (trimmed.startsWith("data:")) return
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    set.add(trimmed)
  }
}

export function collectEmbroideryImageUrls(row: EmbroideryDetail): string[] {
  const urls = new Set<string>()

  for (const u of row.designReferencesImageUrls ?? []) pushUrl(urls, u)
  for (const u of row.designReferenceImages ?? []) pushUrl(urls, u)
  pushUrl(urls, row.fabricImage)
  pushUrl(urls, row.referenceImage)
  pushUrl(urls, row.styleDesignImage)
  pushUrl(urls, row.orderItemAttributes?.fabricImage)
  pushUrl(urls, row.orderItemAttributes?.referenceImage)
  pushUrl(urls, row.orderItemAttributes?.styleDesignImage)
  // Touch firstImageUrl so helpers stay consistent if fields are arrays later
  pushUrl(urls, firstImageUrl(row.fabricImage, row.orderItemAttributes?.fabricImage))

  for (const boota of row.bootas ?? []) {
    for (const u of boota.referenceImages ?? []) pushUrl(urls, u)
  }
  for (const mono of row.monograms ?? []) {
    for (const u of mono.referenceImages ?? []) pushUrl(urls, u)
  }

  return Array.from(urls)
}

async function urlToDataUrl(remoteUrl: string): Promise<string | null> {
  try {
    const proxy = `/api/proxy-image?url=${encodeURIComponent(remoteUrl)}`
    const res = await fetch(proxy, { cache: "no-store" })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.type.startsWith("image/") && blob.type !== "application/octet-stream") {
      // Still try — some servers omit content-type
    }
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : null
        resolve(result)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Map original remote URL → data URL (failed fetches omitted). */
export async function resolveEmbroideryImagesForPdf(
  row: EmbroideryDetail
): Promise<Record<string, string>> {
  const urls = collectEmbroideryImageUrls(row)
  const entries = await Promise.all(
    urls.map(async (url) => {
      const dataUrl = await urlToDataUrl(url)
      return dataUrl ? ([url, dataUrl] as const) : null
    })
  )
  const map: Record<string, string> = {}
  for (const entry of entries) {
    if (entry) map[entry[0]] = entry[1]
  }
  return map
}

export function mapImageSrc(
  imageMap: Record<string, string>,
  url?: string | null
): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("data:")) return trimmed
  return imageMap[trimmed] ?? null
}
