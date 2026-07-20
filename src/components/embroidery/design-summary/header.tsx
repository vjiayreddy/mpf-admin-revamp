"use client"

import type { EmbroideryDetail } from "@/lib/apollo/queries/embroidery"
import {
  firstName,
  formatEmbroideryDate,
} from "@/lib/embroidery/format"

import { DesignSection, MetaField } from "./section"

type DesignSummaryHeaderProps = {
  row: EmbroideryDetail
}

export function DesignSummaryHeader({ row }: DesignSummaryHeaderProps) {
  const productLabel = row.storeOrderProductName
    ? `${row.storeOrderProductName} (${row.storeOrderProductNumber || "—"})`
    : row.storeOrderProductNumber || "—"

  const trialDate =
    row.orderItemAttributes?.trialDate ?? row.trialDate ?? row.embTrialDate

  const fields = [
    { label: "Product", value: productLabel },
    { label: "Customer ID", value: row.customerId || "—" },
    { label: "Customer", value: row.customerName || "—" },
    { label: "Stylist", value: firstName(row.stylist) },
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
      title="Order details"
      description="Product, customer, and key dates for this embroidery job."
    >
      <dl className="bg-card grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border p-4 sm:grid-cols-4">
        {fields.map((field) => (
          <MetaField key={field.label} label={field.label} value={field.value} />
        ))}
      </dl>
    </DesignSection>
  )
}
