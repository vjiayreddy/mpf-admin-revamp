/** Resolve order print images (item thumbs + studio logo) to data URLs for react-pdf. */

import { getOrderPrintStudio } from "@/config/order-print-studios"
import type { StoreOrderDetail } from "@/lib/apollo/queries/store-orders"

function pushUrl(set: Set<string>, url?: string | null) {
  const trimmed = url?.trim()
  if (!trimmed) return
  if (trimmed.startsWith("data:")) return
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    set.add(trimmed)
  }
}

export function collectOrderPrintImageUrls(order: StoreOrderDetail): string[] {
  const urls = new Set<string>()
  const studio = getOrderPrintStudio(order.studioId)
  pushUrl(urls, studio.logoPath)

  for (const item of order.orderItems ?? []) {
    if (!item) continue
    pushUrl(urls, item.fabricImage)
    pushUrl(urls, item.referenceImage)
    pushUrl(urls, item.fitImage)
  }

  return Array.from(urls)
}

async function blobToDataUrl(blob: Blob): Promise<string | null> {
  return await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : null)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(blob)
  })
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const fetchUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? `/api/proxy-image?url=${encodeURIComponent(url)}`
        : url

    const res = await fetch(fetchUrl, { cache: "no-store" })
    if (!res.ok) return null
    const blob = await res.blob()
    return blobToDataUrl(blob)
  } catch {
    return null
  }
}

/** Map original URL/path → data URL (failed fetches omitted). */
export async function resolveOrderImagesForPdf(
  order: StoreOrderDetail
): Promise<Record<string, string>> {
  const urls = collectOrderPrintImageUrls(order)
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

export function mapOrderImageSrc(
  imageMap: Record<string, string>,
  url?: string | null
): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("data:")) return trimmed
  return imageMap[trimmed] ?? null
}
