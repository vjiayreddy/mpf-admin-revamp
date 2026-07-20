"use client"

import type { EmbroideryMonogram } from "@/lib/apollo/queries/embroidery"

import { DesignSection, MetaField } from "./section"

type DesignSummaryMonogramsProps = {
  monograms?: EmbroideryMonogram[] | null
}

function MonogramCard({
  title,
  monogram,
}: {
  title: string
  monogram: EmbroideryMonogram
}) {
  const imgs = monogram.referenceImages ?? []
  const positions = Array.isArray(monogram.positions)
    ? monogram.positions.join(", ")
    : monogram.positions || "—"

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="border-b px-4 py-2.5">
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-muted/40 flex h-28 items-center justify-center overflow-hidden rounded-lg border"
          >
            {imgs[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgs[i]!}
                alt={`${title} ref ${i + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground text-[10px]">No image</span>
            )}
          </div>
        ))}
        <div className="bg-muted/20 flex h-28 flex-col justify-center rounded-lg border px-3 py-2 text-xs">
          <span className="text-muted-foreground mb-1 text-[10px] font-medium tracking-wide uppercase">
            Note
          </span>
          <span className="line-clamp-4">{monogram.note || "—"}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t px-4 py-3 sm:grid-cols-4">
        <MetaField label="Color" value={monogram.color || "—"} />
        <MetaField label="Position" value={positions} />
        <MetaField
          label="Size H / V"
          value={`${monogram.hsize ? `${monogram.hsize}"` : "—"} / ${
            monogram.vsize ? `${monogram.vsize}"` : "—"
          }`}
        />
        <MetaField
          label="Shade / card"
          value={`${monogram.shadeCard || "—"} / ${monogram.shadeNumber || "—"}`}
        />
      </dl>
    </div>
  )
}

export function DesignSummaryMonograms({
  monograms,
}: DesignSummaryMonogramsProps) {
  const list = monograms ?? []
  if (list.length === 0) return null

  return (
    <DesignSection
      title="Monograms"
      description="Monogram references, placement, and shade details."
    >
      <div className="flex flex-col gap-3">
        {list.map((monogram, i) => (
          <MonogramCard
            key={i}
            title={`Monogram ${i + 1}`}
            monogram={monogram}
          />
        ))}
      </div>
    </DesignSection>
  )
}
