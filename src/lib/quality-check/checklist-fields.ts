import type { QcChecklistSection } from "@/lib/quality-check/types"

export const QC_CHECKLIST_FIELDS = [
  { key: "fabricAndColor", title: "Fabric & color" },
  { key: "design", title: "Design" },
  { key: "measurements", title: "Measurements" },
  { key: "ironAndPackaging", title: "Iron & packaging" },
  { key: "finishing", title: "Finishing" },
  { key: "cleanliness", title: "Cleanliness" },
] as const

export type QcChecklistFieldKey = (typeof QC_CHECKLIST_FIELDS)[number]["key"]

export type QcChecklistSource = Partial<
  Record<QcChecklistFieldKey, QcChecklistSection | null | undefined>
>
