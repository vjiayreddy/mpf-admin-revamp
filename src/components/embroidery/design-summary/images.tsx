"use client"

import { useMemo, useState } from "react"
import { ImageIcon, ZoomInIcon } from "lucide-react"

import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import { firstImageUrl } from "@/lib/embroidery/format"
import { cn } from "@/lib/utils"

import { DesignSection } from "./section"

type DesignSummaryImagesProps = {
  row: EmbroideryDetail
}

function ImageTile({
  src,
  label,
  tall,
  onPreview,
}: {
  src: string | null
  label: string
  tall?: boolean
  onPreview?: () => void
}) {
  const clickable = Boolean(src && onPreview)

  return (
    <figure
      className={cn(
        "bg-muted/20 group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border transition-shadow",
        clickable && "hover:ring-foreground/10 cursor-zoom-in hover:ring-1"
      )}
    >
      <button
        type="button"
        disabled={!clickable}
        onClick={onPreview}
        className={cn(
          "relative flex w-full items-center justify-center p-3 text-left",
          tall
            ? "min-h-[14rem] flex-1 sm:min-h-[18rem]"
            : "min-h-[8.5rem] sm:min-h-[9.5rem]"
        )}
        aria-label={clickable ? `Preview ${label}` : undefined}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="max-h-[16rem] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:max-h-[20rem]"
          />
        ) : (
          <span className="text-muted-foreground flex flex-col items-center gap-2 text-xs">
            <ImageIcon className="size-5 opacity-40" />
            No image
          </span>
        )}
        {clickable ? (
          <span className="bg-background/90 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            <ZoomInIcon className="size-3" />
            Preview
          </span>
        ) : null}
      </button>
      <figcaption className="text-muted-foreground border-t px-3 py-2.5 text-center text-[11px] font-medium tracking-[0.06em] uppercase">
        {label}
      </figcaption>
    </figure>
  )
}

export function DesignSummaryImages({ row }: DesignSummaryImagesProps) {
  const [preview, setPreview] = useState<{
    images: string[]
    index: number
  } | null>(null)

  const tiles = useMemo(() => {
    const designUrls =
      row.designReferencesImageUrls?.filter(Boolean) ??
      row.designReferenceImages?.filter(Boolean) ??
      []
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

    return [
      { src: designUrls[0] ?? null, label: "Primary design reference", tall: true },
      {
        src: styleSketch,
        label: row.storeOrderProductName || "Style sketch",
        tall: true,
      },
      { src: designUrls[1] ?? null, label: "Design reference", tall: false },
      { src: fabric, label: "Fabric", tall: false },
      { src: reference, label: "Reference", tall: false },
    ] as const
  }, [row])

  const previewable = tiles
    .map((t) => t.src)
    .filter((src): src is string => Boolean(src))

  const openPreview = (src: string | null) => {
    if (!src) return
    const index = previewable.indexOf(src)
    setPreview({ images: previewable, index: Math.max(0, index) })
  }

  const embNote = row.designReferenceImageNote?.trim()
  const fabricNote =
    row.orderItemAttributes?.fabricImageNote?.trim() ||
    row.fabricImageNote?.trim()

  return (
    <>
      <DesignSection
        id="emb-summary-images"
        index={2}
        title="Design images"
        description="Tap any image to open a full preview."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-[1.35fr_1fr]">
            <ImageTile
              src={tiles[0].src}
              label={tiles[0].label}
              tall
              onPreview={() => openPreview(tiles[0].src)}
            />
            <ImageTile
              src={tiles[1].src}
              label={tiles[1].label}
              tall
              onPreview={() => openPreview(tiles[1].src)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ImageTile
              src={tiles[2].src}
              label={tiles[2].label}
              onPreview={() => openPreview(tiles[2].src)}
            />
            <ImageTile
              src={tiles[3].src}
              label={tiles[3].label}
              onPreview={() => openPreview(tiles[3].src)}
            />
            <ImageTile
              src={tiles[4].src}
              label={tiles[4].label}
              onPreview={() => openPreview(tiles[4].src)}
            />
          </div>

          {(embNote || fabricNote) && (
            <div className="bg-card grid gap-3 rounded-2xl border px-4 py-3.5 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                  Embroidery note
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {embNote || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                  Fabric note
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {fabricNote || "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DesignSection>

      <ReceiptImagePreview
        open={Boolean(preview)}
        images={preview?.images ?? []}
        initialIndex={preview?.index ?? 0}
        onOpenChange={(open) => {
          if (!open) setPreview(null)
        }}
        ariaLabel="Embroidery design image preview"
      />
    </>
  )
}
