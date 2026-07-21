"use client"

import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import {
  firstName,
  formatEmbroideryDate,
} from "@/lib/embroidery/format"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { DesignSection, MetaField } from "./section"

type DesignSummaryHeaderProps = {
  row: EmbroideryDetail
  isDraft?: boolean
}

export function DesignSummaryHeader({
  row,
  isDraft,
}: DesignSummaryHeaderProps) {
  const productName = row.storeOrderProductName?.trim() || "Product"
  const productNo = row.storeOrderProductNumber?.trim() || null

  const trialDate =
    row.orderItemAttributes?.trialDate ?? row.trialDate ?? row.embTrialDate

  const status = row.embStatus?.trim()
  const approval = row.approvalStatus?.trim()

  const identity = [
    row.embroideryReqNo && `Req ${row.embroideryReqNo}`,
    row.storeOrderNo && `Order ${row.storeOrderNo}`,
    productNo,
  ].filter(Boolean)

  const dateFields = [
    { label: "Order date", value: formatEmbroideryDate(row.orderDate) },
    { label: "Trial date", value: formatEmbroideryDate(trialDate) },
    {
      label: "Marking expected",
      value: formatEmbroideryDate(row.markingExpectedDate),
    },
    { label: "Completion", value: formatEmbroideryDate(row.embReadyDate) },
  ]

  return (
    <DesignSection
      id="emb-summary-order"
      index={1}
      title="Order details"
      description="Who this job is for, and the dates production is working to."
    >
      <div className="bg-card overflow-hidden rounded-2xl border shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
        <div className="from-muted/50 via-background to-background relative border-b bg-gradient-to-br px-5 py-5 sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 0.6px, transparent 0)",
              backgroundSize: "14px 14px",
              color: "var(--border)",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {isDraft ? (
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200">
                    Draft
                  </Badge>
                ) : (
                  <Badge variant="secondary">Saved</Badge>
                )}
                {status ? (
                  <Badge variant="outline">{status}</Badge>
                ) : null}
                {approval ? (
                  <Badge variant="outline" className="text-muted-foreground">
                    {approval}
                  </Badge>
                ) : null}
              </div>
              <h4 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {productName}
                {productNo ? (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    · {productNo}
                  </span>
                ) : null}
              </h4>
              {identity.length > 0 ? (
                <p className="text-muted-foreground text-xs tracking-wide">
                  {identity.join("  ·  ")}
                </p>
              ) : null}
            </div>

            <dl className="grid min-w-[12rem] grid-cols-2 gap-x-6 gap-y-3 sm:text-right">
              <MetaField
                label="Customer"
                value={row.customerName || "—"}
                className="sm:items-end sm:text-right"
              />
              <MetaField
                label="Customer ID"
                value={row.customerId || "—"}
                className="sm:items-end sm:text-right"
              />
              <MetaField
                label="Stylist"
                value={firstName(row.stylist)}
                className="sm:items-end sm:text-right"
              />
              <MetaField
                label="Fabric"
                value={
                  [row.fabricName, row.fabricColor].filter(Boolean).join(" · ") ||
                  "—"
                }
                className="sm:items-end sm:text-right"
              />
            </dl>
          </div>
        </div>

        <dl
          className={cn(
            "grid gap-4 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4"
          )}
        >
          {dateFields.map((field) => (
            <MetaField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </dl>
      </div>
    </DesignSection>
  )
}
