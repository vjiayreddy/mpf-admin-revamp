"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  asLeadDetailList,
  type LeadListRow,
} from "@/lib/apollo/queries/leads"
import {
  customerFullName,
  formatLeadDate,
  formatLeadDateTime,
  formatPhone,
  latestStatus,
} from "@/lib/leads/format"
import { cn } from "@/lib/utils"

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm break-words">{value ?? "—"}</div>
    </div>
  )
}

type QuickLeadViewProps = {
  open: boolean
  lead: LeadListRow | null
  onOpenChange: (open: boolean) => void
  onEdit?: (lead: LeadListRow) => void
}

export function QuickLeadView({
  open,
  lead,
  onOpenChange,
  onEdit,
}: QuickLeadViewProps) {
  const status = latestStatus(lead?.status)
  const name = customerFullName(lead?.firstName, lead?.lastName)
  const phone = formatPhone(lead?.countryCode, lead?.phone)
  const creditTo =
    lead?.creditedSalesTeam?.[0]?.name || lead?.creditToSalesTeamId || "—"
  const studio = lead?.studio?.[0]?.name || lead?.studioId || "—"
  const source = lead?.source?.[0]?.name || "—"

  const customerHref = lead?.userId
    ? `/customers?searchTerm=${encodeURIComponent(lead.userId)}`
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Lead details</SheetTitle>
          <SheetDescription>
            {lead?.leadId != null
              ? `Lead #${lead.leadId}`
              : lead
                ? "Lead overview"
                : "No lead selected"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {lead ? (
            <>
              <div className="bg-emerald-800 rounded-lg p-4 text-white">
                <p className="font-mono text-xl font-bold tracking-wide">
                  {lead.leadId ?? "—"}
                </p>
                <p className="mt-1 text-sm opacity-90">{name}</p>
                {status?.name || status?.label ? (
                  <p className="mt-2 text-xs uppercase tracking-wide opacity-80">
                    {status.label || status.name}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Detail label="Phone" value={phone} />
                <Detail label="Email" value={lead.email || "—"} />
                <Detail
                  label="Customer"
                  value={
                    customerHref ? (
                      <Link
                        href={customerHref}
                        className="text-primary font-medium hover:underline"
                      >
                        {lead.userId}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        No userId on lead
                      </span>
                    )
                  }
                />
                <Detail label="Rating" value={lead.rating ?? "—"} />
                <Detail label="Source" value={source} />
                <Detail label="Studio" value={studio} />
                <Detail label="Credit to" value={creditTo} />
                <Detail
                  label="Estimated value"
                  value={lead.estimatedValue ?? "—"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Detail
                  label="Lead date"
                  value={formatLeadDate(lead.leadDate?.timestamp)}
                />
                <Detail
                  label="Follow-up"
                  value={formatLeadDate(
                    lead.followUpDate?.timestamp ||
                      lead.currentStatusDate?.timestamp
                  )}
                />
                <Detail
                  label="Event date"
                  value={formatLeadDate(lead.eventDate?.timestamp)}
                />
                <Detail
                  label="Expected closure"
                  value={formatLeadDate(lead.expClosureDate?.timestamp)}
                />
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Status timeline
                </p>
                {(() => {
                  const statusHistory = asLeadDetailList(lead.status)
                  if (!statusHistory.length) {
                    return <p className="mt-1 text-sm">—</p>
                  }
                  return (
                    <ul className="mt-2 space-y-2">
                      {statusHistory.map((entry, index) => (
                        <li
                          key={entry._id || `${entry.name}-${index}`}
                          className="flex flex-col gap-0.5 border-b pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-sm font-medium">
                            {entry.label || entry.name || "—"}
                          </span>
                          {entry.note ? (
                            <span className="text-muted-foreground text-xs">
                              {entry.note}
                            </span>
                          ) : null}
                          <span className="text-muted-foreground text-xs">
                            {formatLeadDateTime(entry.dateRecorded?.timestamp)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                })()}
              </div>

              <Detail label="Remarks" value={lead.remarks || "—"} />

              <Detail
                label="CIF ids"
                value={
                  lead.customerInformationForms?.length
                    ? lead.customerInformationForms
                        .map((c) => c.cifSerialNumber || c._id)
                        .filter(Boolean)
                        .join(", ")
                    : "—"
                }
              />

              <Detail
                label="Orders"
                value={
                  lead.orders?.length
                    ? lead.orders
                        .map((o) => o.orderNo ?? o._id)
                        .filter(Boolean)
                        .join(", ")
                    : "—"
                }
              />

              <Detail
                label="Linked orders"
                value={
                  lead.linkedOrders?.length
                    ? lead.linkedOrders
                        .map((o) => o.orderSerialNo || o.orderId)
                        .filter(Boolean)
                        .join(", ")
                    : "—"
                }
              />

              <Detail
                label="Cross-sell"
                value={(() => {
                  const rows = asLeadDetailList(lead.crossSellingDetails)
                  const labels = rows.flatMap((row) =>
                    (row.brandPartnerSubCategories ?? []).map(
                      (c) => c.title || c.name
                    )
                  )
                  const remarks = rows
                    .map((row) => row.remarks)
                    .filter(Boolean)
                    .join("; ")
                  return labels.filter(Boolean).join(", ") || remarks || "—"
                })()}
              />

              {(() => {
                const occasions = asLeadDetailList(lead.occasionDetails)
                const first = occasions[0]
                if (!first?.occasion && first?.budget == null) return null
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <Detail
                      label="Occasion"
                      value={
                        occasions
                          .map((o) => o.occasion)
                          .filter(Boolean)
                          .join(", ") || "—"
                      }
                    />
                    <Detail
                      label="Budget"
                      value={
                        occasions
                          .map((o) => o.budget)
                          .filter((b) => b != null)
                          .join(", ") || "—"
                      }
                    />
                  </div>
                )
              })()}
            </>
          ) : (
            <p className={cn("text-muted-foreground text-sm")}>
              Select a lead to view details.
            </p>
          )}
        </div>

        <SheetFooter className="gap-2 sm:flex-row">
          {lead && onEdit ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(lead)}
            >
              <PencilIcon className="size-4" />
              Edit
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
