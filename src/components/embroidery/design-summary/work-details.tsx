"use client"

import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import {
  formatDistanceAttr,
  formatWorkType,
  parseWorkAreaGroups,
} from "@/lib/embroidery/format"

import { DesignSection, MetaField } from "./section"

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
      !(g.names.length === 1 && g.names[0]!.toLowerCase() === g.group.toLowerCase())
  )
  const simpleGroups = groupedAreas.filter(
    (g) =>
      g.names.length === 1 && g.names[0]!.toLowerCase() === g.group.toLowerCase()
  )

  const workTypeValue =
    workTypes.length > 0 ? (
      <ul className="list-disc space-y-0.5 pl-4">
        {workTypes.map((w) => (
          <li key={w}>{formatWorkType(w)}</li>
        ))}
      </ul>
    ) : (
      "—"
    )

  const workAreaValue =
    groupedAreas.length > 0 ? (
      <div className="grid gap-2 sm:grid-cols-2">
        {complexGroups.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-4">
            {complexGroups.map((g) => (
              <li key={g.group}>
                <span className="font-medium">{g.group}: </span>
                {g.names.join(", ")}
              </li>
            ))}
          </ul>
        ) : null}
        {simpleGroups.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-4">
            {simpleGroups.map((g) => (
              <li key={g.group}>{g.names[0]}</li>
            ))}
          </ul>
        ) : null}
      </div>
    ) : (
      "—"
    )

  return (
    <DesignSection
      title="Work details"
      description="Work type, placement areas, distances, and embroidery specs."
    >
      <div className="bg-card overflow-hidden rounded-xl border">
        <dl className="grid gap-4 border-b p-4 sm:grid-cols-2">
          <MetaField label="Work type" value={workTypeValue} />
          <MetaField label="Work area" value={workAreaValue} />
        </dl>

        <dl className="grid gap-4 border-b p-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <dl className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaField label="Length" value={row.length ?? "—"} />
          <MetaField label="BBS" value={row.bbs ?? "—"} />
          <MetaField label="Embroidery type" value={row.embType ?? "—"} />
          <MetaField label="Artwork" value={row.artworkType ?? "—"} />
        </dl>
      </div>
    </DesignSection>
  )
}
