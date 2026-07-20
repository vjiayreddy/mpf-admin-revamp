"use client"

import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import { firstImageUrl } from "@/lib/embroidery/format"

import { DesignSection } from "./section"

type DesignSummaryImagesProps = {
  row: EmbroideryDetail
}

function ImageTile({
  src,
  label,
  tall,
}: {
  src: string | null
  label: string
  tall?: boolean
}) {
  return (
    <figure className="bg-muted/30 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border">
      <div
        className={
          tall
            ? "flex min-h-[14rem] flex-1 items-center justify-center p-3 sm:min-h-[18rem]"
            : "flex min-h-[8.5rem] items-center justify-center p-3"
        }
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="max-h-[16rem] max-w-full object-contain sm:max-h-[20rem]"
          />
        ) : (
          <span className="text-muted-foreground text-xs">No image</span>
        )}
      </div>
      <figcaption className="text-muted-foreground border-t px-3 py-2 text-center text-[11px] font-medium tracking-wide uppercase">
        {label}
      </figcaption>
    </figure>
  )
}

export function DesignSummaryImages({ row }: DesignSummaryImagesProps) {
  const designUrls =
    row.designReferencesImageUrls?.filter(Boolean) ??
    row.designReferenceImages?.filter(Boolean) ??
    []
  const hero = designUrls[0] ?? null
  const designRef2 = designUrls[1] ?? null
  const fabric = firstImageUrl(
    row.orderItemAttributes?.fabricImage,
    row.fabricImage
  )
  const reference = firstImageUrl(
    row.orderItemAttributes?.referenceImage,
    row.referenceImage
  )
  const styleSketch = firstImageUrl(
    row.orderItemAttributes?.styleDesignImage,
    row.styleDesignImage
  )

  return (
    <DesignSection
      title="Design images"
      description="Primary references, fabric, and style sketch."
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <ImageTile src={hero} label="Primary design reference" tall />
          <ImageTile
            src={styleSketch}
            label={row.storeOrderProductName || "Style sketch"}
            tall
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ImageTile src={designRef2} label="Design reference" />
          <ImageTile src={fabric} label="Fabric" />
          <ImageTile src={reference} label="Reference" />
        </div>

        <div className="bg-muted/40 space-y-2 rounded-xl border px-4 py-3 text-sm">
          <p>
            <span className="text-muted-foreground font-medium">
              Emb ref note:{" "}
            </span>
            {row.designReferenceImageNote || "—"}
          </p>
          <p>
            <span className="text-muted-foreground font-medium">
              Fabric note:{" "}
            </span>
            {row.orderItemAttributes?.fabricImageNote ||
              row.fabricImageNote ||
              "—"}
          </p>
        </div>
      </div>
    </DesignSection>
  )
}
