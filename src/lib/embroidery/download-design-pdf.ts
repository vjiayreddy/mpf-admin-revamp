import { createElement } from "react"
import { pdf } from "@react-pdf/renderer"

import {
  EmbroideryDesignPdfDocument,
  embroideryDesignPdfFilename,
} from "@/components/embroidery/design-summary/embroidery-design-pdf"
import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import { resolveEmbroideryImagesForPdf } from "@/lib/embroidery/resolve-pdf-images"

export type DesignPdfAction = "download" | "open"

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function openInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, "_blank", "noopener,noreferrer")
  if (!opened) {
    triggerDownload(blob, "embroidery-design.pdf")
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
}

export async function exportEmbroideryDesignPdf(
  row: EmbroideryDetail,
  action: DesignPdfAction = "download"
) {
  const imageMap = await resolveEmbroideryImagesForPdf(row)
  const instance = pdf(
    createElement(EmbroideryDesignPdfDocument, { row, imageMap })
  )
  const blob = await instance.toBlob()
  const filename = embroideryDesignPdfFilename(row)

  if (action === "open") {
    openInNewTab(blob)
  } else {
    triggerDownload(blob, filename)
  }

  return { blob, filename, imageCount: Object.keys(imageMap).length }
}
