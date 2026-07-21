"use client"

import type { EmbroideryMonogram } from "@/lib/apollo/queries/embroidery"

import { DesignSection, MetaField, SpecChip } from "./section"

type DesignSummaryMonogramsProps = {
  monograms?: EmbroideryMonogram[] | null
  sectionIndex?: number
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
    ? monogram.positions.filter(Boolean)
    : monogram.positions
      ? [monogram.positions]
      : []

  return (
    <article className="bg-card overflow-hidden rounded-2xl border">
      <div className="border-b px-4 py-3">
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-muted/30 flex h-28 items-center justify-center overflow-hidden rounded-xl border"
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
        <div className="bg-muted/15 flex h-28 flex-col justify-center rounded-xl border px-3 py-2 text-xs">
          <span className="text-muted-foreground mb-1 text-[10px] font-medium tracking-[0.08em] uppercase">
            Note
          </span>
          <span className="line-clamp-4 leading-relaxed">
            {monogram.note || "—"}
          </span>
        </div>
      </div>

      <div className="bg-muted/20 space-y-3 border-t px-4 py-3.5">
        {positions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
              Position
            </p>
            <div className="flex flex-wrap gap-1.5">
              {positions.map((p) => (
                <SpecChip key={p}>{p}</SpecChip>
              ))}
            </div>
          </div>
        ) : null}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetaField label="Color" value={monogram.color || "—"} />
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
    </article>
  )
}

export function DesignSummaryMonograms({
  monograms,
  sectionIndex = 5,
}: DesignSummaryMonogramsProps) {
  const list = monograms ?? []
  if (list.length === 0) return null

  return (
    <DesignSection
      id="emb-summary-monograms"
      index={sectionIndex}
      title="Monograms"
      description={`${list.length} monogram ${list.length === 1 ? "entry" : "entries"} with placement and shade.`}
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
