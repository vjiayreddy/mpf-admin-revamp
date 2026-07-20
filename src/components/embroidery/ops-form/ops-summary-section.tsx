"use client"

import type { EmbroideryOpsDetail } from "@/lib/apollo/queries/embroidery"
import {
  firstImageUrl,
  firstName,
  formatEmbroideryDate,
} from "@/lib/embroidery/format"

type OpsSummarySectionProps = {
  detail: EmbroideryOpsDetail
}

export function OpsSummarySection({ detail }: OpsSummarySectionProps) {
  const fabric = firstImageUrl(
    detail.fabricImage,
    detail.orderItemAttributes?.fabricImage
  )
  const reference = firstImageUrl(
    detail.referenceImage,
    detail.orderItemAttributes?.referenceImage
  )

  return (
    <section className="bg-card rounded-lg border p-5">
      <h2 className="mb-4 text-sm font-semibold tracking-tight">Summary</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-muted-foreground text-xs">Product</dt>
          <dd className="font-medium">
            {detail.storeOrderProductNumber || "—"}
            {detail.storeOrderProductName
              ? ` · ${detail.storeOrderProductName}`
              : ""}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Customer</dt>
          <dd>{detail.customerName || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Stylist</dt>
          <dd>{firstName(detail.stylist)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Order date</dt>
          <dd>{formatEmbroideryDate(detail.orderDate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Trial date</dt>
          <dd>
            {formatEmbroideryDate(
              detail.orderItemAttributes?.trialDate ?? detail.trialDate
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Order status</dt>
          <dd>
            {detail.storeOrder?.orderStatus || detail.orderStatus || "—"}
          </dd>
        </div>
      </dl>

      {(fabric || reference) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {fabric ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fabric}
              alt="Fabric"
              className="border-border size-16 rounded-sm border object-cover"
            />
          ) : null}
          {reference ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reference}
              alt="Reference"
              className="border-border size-16 rounded-sm border object-cover"
            />
          ) : null}
        </div>
      )}
    </section>
  )
}
