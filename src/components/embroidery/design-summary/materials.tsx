"use client"

import type { EmbroideryMaterialSample } from "@/lib/apollo/queries/embroidery"

import { DesignSection } from "./section"

type DesignSummaryMaterialsProps = {
  samples?: EmbroideryMaterialSample[] | null
}

export function DesignSummaryMaterials({
  samples,
}: DesignSummaryMaterialsProps) {
  const list = samples ?? []
  if (list.length === 0) return null

  return (
    <DesignSection
      title="Material samples"
      description="Sample materials, colors, and notes."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((material, index) => (
          <div
            key={index}
            className="bg-card overflow-hidden rounded-xl border"
          >
            <div className="border-b px-4 py-2.5">
              <h4 className="text-sm font-semibold">Sample {index + 1}</h4>
            </div>
            <div className="divide-y">
              {(material.attributes ?? []).length > 0 ? (
                (material.attributes ?? []).map((attribute, attrIndex) => (
                  <div key={attrIndex} className="space-y-1 px-4 py-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">Material: </span>
                      {attribute?.name || "—"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Color: </span>
                      {attribute?.color || "—"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Custom color:{" "}
                      </span>
                      {attribute?.customColor || "—"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Note: </span>
                      {attribute?.note || "—"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground px-4 py-3 text-sm">
                  No attributes
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </DesignSection>
  )
}
