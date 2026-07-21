"use client"

import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import {
  formatDistanceAttr,
  formatWorkType,
  parseWorkAreaGroups,
} from "@/lib/embroidery/format"

import { DesignSection, MetaField, SpecChip } from "./section"

type DesignSummaryWorkDetailsProps = {
  row: EmbroideryDetail
}

export function DesignSummaryWorkDetails({
  row,
}: DesignSummaryWorkDetailsProps) {
  const workTypes = Array.isArray(row.workType)
    ? row.workType.filter(Boolean)
    : row.workType
      ? [row.workType]
      : []
  const groupedAreas = parseWorkAreaGroups(row.workAreas)
  const complexGroups = groupedAreas.filter(
    (g) =>
      !(
        g.names.length === 1 &&
        g.names[0]!.toLowerCase() === g.group.toLowerCase()
      )
  )
  const simpleGroups = groupedAreas.filter(
    (g) =>
      g.names.length === 1 && g.names[0]!.toLowerCase() === g.group.toLowerCase()
  )

  return (
    <DesignSection
      id="emb-summary-work"
      index={3}
      title="Work details"
      description="Placement, distances, and embroidery specs for production."
    >
      <div className="bg-card overflow-hidden rounded-2xl border">
        <div className="grid gap-5 border-b p-5 sm:grid-cols-2">
          <div className="space-y-2.5">
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
              Work type
            </p>
            {workTypes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {workTypes.map((w) => (
                  <SpecChip key={w}>{formatWorkType(w)}</SpecChip>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">—</p>
            )}
          </div>

          <div className="space-y-2.5">
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
              Work area
            </p>
            {groupedAreas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {complexGroups.map((g) => (
                  <SpecChip key={g.group}>
                    <span className="font-medium">{g.group}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {g.names.join(", ")}
                    </span>
                  </SpecChip>
                ))}
                {simpleGroups.map((g) => (
                  <SpecChip key={g.group}>{g.names[0]}</SpecChip>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">—</p>
            )}
          </div>
        </div>

        <dl className="grid gap-4 border-b p-5 sm:grid-cols-3">
          <MetaField
            label="Cuff distance"
            value={formatDistanceAttr(row.otherAttributes, "cuff_distance")}
          />
          <MetaField
            label="Placket distance"
            value={formatDistanceAttr(row.otherAttributes, "placket_distance")}
          />
          <MetaField
            label="Daman distance"
            value={formatDistanceAttr(row.otherAttributes, "daman_distance")}
          />
        </dl>

        <dl className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetaField label="Length" value={row.length ?? "—"} />
          <MetaField label="BBS" value={row.bbs ?? "—"} />
          <MetaField label="Embroidery type" value={row.embType ?? "—"} />
          <MetaField label="Artwork" value={row.artworkType ?? "—"} />
        </dl>
      </div>
    </DesignSection>
  )
}
