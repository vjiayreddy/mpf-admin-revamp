import { createElement } from "react"
import { pdf } from "@react-pdf/renderer"

import {
  OrderPrintPdfDocument,
  orderPrintPdfFilename,
} from "@/components/orders/order-print-pdf"
import type { StoreOrderDetail } from "@/lib/apollo/queries/store-orders"
import { resolveOrderImagesForPdf } from "@/lib/orders/resolve-order-print-images"

export type OrderPdfAction = "download" | "open"

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

function openInNewTab(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, "_blank", "noopener,noreferrer")
  if (!opened) {
    triggerDownload(blob, filename)
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
}

export async function exportOrderPdf(
  order: StoreOrderDetail,
  action: OrderPdfAction = "download"
) {
  const imageMap = await resolveOrderImagesForPdf(order)
  const instance = pdf(
    createElement(OrderPrintPdfDocument, { order, imageMap })
  )
  const blob = await instance.toBlob()
  const filename = orderPrintPdfFilename(order)

  if (action === "open") {
    openInNewTab(blob, filename)
  } else {
    triggerDownload(blob, filename)
  }

  return { blob, filename, imageCount: Object.keys(imageMap).length }
}
