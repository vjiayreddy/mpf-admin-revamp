"use client"

import type { EmbroideryMaterialSample } from "@/lib/apollo/queries/embroidery"
import { cn } from "@/lib/utils"

import { DesignSection } from "./section"

type DesignSummaryMaterialsProps = {
  samples?: EmbroideryMaterialSample[] | null
  sectionIndex?: number
}

function looksLikeColor(value?: string | null) {
  const v = value?.trim()
  if (!v) return false
  return (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
    /^rgb(a)?\(/i.test(v) ||
    /^hsl(a)?\(/i.test(v)
  )
}

export function DesignSummaryMaterials({
  samples,
  sectionIndex = 6,
}: DesignSummaryMaterialsProps) {
  const list = samples ?? []
  if (list.length === 0) return null

  return (
    <DesignSection
      id="emb-summary-materials"
      index={sectionIndex}
      title="Material samples"
      description="Sample materials, colors, and notes for matching on the floor."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((material, index) => (
          <article
            key={index}
            className="bg-card overflow-hidden rounded-2xl border"
          >
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <h4 className="text-sm font-semibold tracking-tight">
                Sample {index + 1}
              </h4>
              {(material.attributes?.length ?? 0) > 0 ? (
                <span className="text-muted-foreground text-[10px] tabular-nums">
                  {material.attributes!.length} attr
                  {material.attributes!.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <div className="divide-y">
              {(material.attributes ?? []).length > 0 ? (
                (material.attributes ?? []).map((attribute, attrIndex) => {
                  const color = attribute?.color?.trim()
                  const custom = attribute?.customColor?.trim()
                  const swatch = looksLikeColor(custom)
                    ? custom
                    : looksLikeColor(color)
                      ? color
                      : null
                  return (
                    <div
                      key={attrIndex}
                      className="space-y-2.5 px-4 py-3.5 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                            Material
                          </p>
                          <p className="font-medium">
                            {attribute?.name || attribute?.label || "—"}
                          </p>
                        </div>
                        {swatch ? (
                          <span
                            title={swatch}
                            className="mt-0.5 size-7 shrink-0 rounded-md border shadow-inner"
                            style={{ backgroundColor: swatch }}
                          />
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p>
                          <span className="text-muted-foreground">Color: </span>
                          {color || "—"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Custom:{" "}
                          </span>
                          {custom || "—"}
                        </p>
                      </div>
                      {attribute?.note?.trim() ? (
                        <p
                          className={cn(
                            "text-muted-foreground text-xs leading-relaxed"
                          )}
                        >
                          {attribute.note}
                        </p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground px-4 py-3 text-sm">
                  No attributes
                </p>
              )}
              {material.note?.trim() ? (
                <p className="text-muted-foreground px-4 py-3 text-xs leading-relaxed">
                  {material.note}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </DesignSection>
  )
}
