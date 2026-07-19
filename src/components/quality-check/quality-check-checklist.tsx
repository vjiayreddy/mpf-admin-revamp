"use client"

import {
  QC_CHECKLIST_FIELDS,
  type QcChecklistSource,
} from "@/lib/quality-check/checklist-fields"
import { cn } from "@/lib/utils"

export type QualityCheckChecklistProps = {
  source: QcChecklistSource
  className?: string
}

export function QualityCheckChecklist({
  source,
  className,
}: QualityCheckChecklistProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold tracking-tight">QC checklist</h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-semibold">Check</th>
              <th className="px-3 py-2 font-semibold">OK</th>
              <th className="px-3 py-2 font-semibold">Rating</th>
              <th className="px-3 py-2 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {QC_CHECKLIST_FIELDS.map((field) => {
              const section = source[field.key]
              return (
                <tr key={field.key} className="border-t">
                  <td className="px-3 py-2 font-medium">{field.title}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={Boolean(section?.check)}
                      readOnly
                      disabled
                      aria-label={`${field.title} checked`}
                    />
                  </td>
                  <td className="px-3 py-2">{section?.rating ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-pre-wrap">
                    {section?.note?.trim() || "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
