"use client"

import type { ColDef, ICellRendererParams } from "ag-grid-community"

import { QualityCheckRowActions } from "@/components/quality-check/quality-check-row-actions"
import type { QualityCheckOrderRow } from "@/lib/apollo/queries/store-orders"
import { formatEmbroideryDate, firstName } from "@/lib/embroidery/format"

type BuildQualityCheckColumnDefsArgs = {
  onViewProducts: (row: QualityCheckOrderRow) => void
}

function customerName(row: QualityCheckOrderRow) {
  const first = row.customerFirstName?.trim() || ""
  const last = row.customerLastName?.trim() || ""
  const name = `${first} ${last}`.trim()
  return name || "—"
}

export function buildQualityCheckColumnDefs({
  onViewProducts,
}: BuildQualityCheckColumnDefsArgs): ColDef<QualityCheckOrderRow>[] {
  return [
    {
      colId: "more",
      headerName: "More",
      minWidth: 70,
      maxWidth: 80,
      pinned: "left",
      lockPosition: "left",
      sortable: false,
      filter: false,
      suppressMovable: true,
      cellRenderer: (params: ICellRendererParams<QualityCheckOrderRow>) => {
        const row = params.data
        if (!row) return null
        return (
          <QualityCheckRowActions
            row={row}
            onViewProducts={onViewProducts}
          />
        )
      },
    },
    {
      colId: "orderNo",
      field: "orderNo",
      headerName: "Order No",
      minWidth: 110,
      flex: 0.8,
      valueFormatter: (p) =>
        p.value != null && String(p.value).trim() ? String(p.value) : "—",
    },
    {
      colId: "customerId",
      field: "customerId",
      headerName: "Cust. Id",
      minWidth: 100,
      flex: 0.8,
      valueFormatter: (p) =>
        p.value != null && String(p.value).trim() ? String(p.value) : "—",
    },
    {
      colId: "customerName",
      headerName: "Customer Name",
      minWidth: 160,
      flex: 1.2,
      valueGetter: (p) => (p.data ? customerName(p.data) : "—"),
    },
    {
      colId: "stylist",
      headerName: "Stylist",
      minWidth: 130,
      flex: 1,
      valueGetter: (p) => firstName(p.data?.stylist),
    },
    {
      colId: "trialDate",
      headerName: "Trial Date",
      minWidth: 120,
      flex: 0.9,
      valueGetter: (p) => formatEmbroideryDate(p.data?.trialDate),
    },
    {
      colId: "deliveryDate",
      headerName: "Delivery Date",
      minWidth: 120,
      flex: 0.9,
      valueGetter: (p) => formatEmbroideryDate(p.data?.deliveryDate),
    },
    {
      colId: "orderDate",
      headerName: "Order Date",
      minWidth: 120,
      flex: 0.9,
      valueGetter: (p) => formatEmbroideryDate(p.data?.orderDate),
    },
  ]
}
