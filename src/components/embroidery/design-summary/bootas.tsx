"use client"

import type { EmbroideryBoota } from "@/lib/apollo/queries/embroidery"
import { getFractionLabel } from "@/lib/embroidery/format"

import { DesignSection, MetaField } from "./section"

type DesignSummaryBootasProps = {
  bootas?: EmbroideryBoota[] | null
}

function hasBootaMetrics(boota: EmbroideryBoota) {
  return (
    Number(boota.size1H) > 0 ||
    Number(boota.size1V) > 0 ||
    Number(boota.backSizeH) > 0 ||
    Number(boota.backSizeV) > 0
  )
}

function BootaCard({ title, boota }: { title: string; boota: EmbroideryBoota }) {
  const imgs = boota.referenceImages ?? []
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        {boota.note ? (
          <p className="text-muted-foreground max-w-[60%] truncate text-xs">
            {boota.note}
          </p>
        ) : null}
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
          <span className="line-clamp-4">{boota.note || "—"}</span>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 border-t px-4 py-3 sm:grid-cols-3">
        <MetaField
          label="Boota size (in)"
          value={
            <>
              V: {boota.size1V ?? "—"} {getFractionLabel(boota.fractionSize1V)}
              <br />
              H: {boota.size1H ?? "—"} {getFractionLabel(boota.fractionSize1H)}
            </>
          }
        />
        <MetaField
          label="Boota distance (in)"
          value={
            <>
              V: {boota.distance1C2CV ?? "—"}{" "}
              {getFractionLabel(boota.fractionDistance1C2CV)}
              <br />
              H: {boota.distance1C2CH ?? "—"}{" "}
              {getFractionLabel(boota.fractionDistance1C2CH)}
            </>
          }
        />
        <MetaField
          label="Boota back size (in)"
          value={
            <>
              V: {boota.backSizeV ?? "—"}{" "}
              {getFractionLabel(boota.fractionBackSizeV)}
              <br />
              H: {boota.backSizeH ?? "—"}{" "}
              {getFractionLabel(boota.fractionBackSizeH)}
            </>
          }
        />
      </dl>
    </div>
  )
}

export function DesignSummaryBootas({ bootas }: DesignSummaryBootasProps) {
  const list = (bootas ?? []).filter(hasBootaMetrics)
  const front = list.filter((b) => b.bootaSide === "FRONT")
  const back = list.filter((b) => b.bootaSide !== "FRONT")

  if (list.length === 0) return null

  return (
    <DesignSection
      title="Bootas"
      description="Front and back boota references with size metrics."
    >
      <div className="flex flex-col gap-3">
        {front.map((boota, i) => (
          <BootaCard
            key={`front-${i}`}
            title={`Front Boota ${i + 1}`}
            boota={boota}
          />
        ))}
        {back.map((boota, i) => (
          <BootaCard
            key={`back-${i}`}
            title={`Back Boota ${i + 1}`}
            boota={boota}
          />
        ))}
      </div>
    </DesignSection>
  )
}
