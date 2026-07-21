"use client"

import type { ColDef, ICellRendererParams } from "ag-grid-community"

import { OrdersRowActions } from "@/components/orders/orders-row-actions"
import type { OrdersListRow } from "@/lib/apollo/queries/store-orders"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
} from "@/lib/track-orders/format"
import { firstName } from "@/lib/embroidery/format"

type BuildOrdersColumnDefsArgs = {
  onView: (row: OrdersListRow) => void
  onEdit: (row: OrdersListRow) => void
  onPrint: (row: OrdersListRow) => void
  onTrial: (row: OrdersListRow) => void
  onInvoice: (row: OrdersListRow) => void
  onPayments: (row: OrdersListRow) => void
  onStyleHistory: (row: OrdersListRow) => void
  invoiceBusy?: boolean
}

function occasionsLabel(row: OrdersListRow) {
  const values = (row.orderItems ?? [])
    .map((i) => i?.occasion?.trim())
    .filter(Boolean) as string[]
  const unique = Array.from(new Set(values))
  return unique.length ? unique.join(", ") : "—"
}

function hasEmbroidery(row: OrdersListRow) {
  return (row.orderItems ?? []).some((i) => Boolean(i?.hasEmbroidary))
}

function invoiceNo(row: OrdersListRow) {
  const first = row.invoices?.find((inv) => inv?.invoiceNo != null)
  return first?.invoiceNo != null ? String(first.invoiceNo) : "—"
}

export function buildOrdersColumnDefs({
  onView,
  onEdit,
  onPrint,
  onTrial,
  onInvoice,
  onPayments,
  onStyleHistory,
  invoiceBusy,
}: BuildOrdersColumnDefsArgs): ColDef<OrdersListRow>[] {
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
      cellRenderer: (params: ICellRendererParams<OrdersListRow>) => {
        const row = params.data
        if (!row) return null
        return (
          <OrdersRowActions
            row={row}
            onView={onView}
            onEdit={onEdit}
            onPrint={onPrint}
            onTrial={onTrial}
            onInvoice={onInvoice}
            onPayments={onPayments}
            onStyleHistory={onStyleHistory}
            invoiceBusy={invoiceBusy}
          />
        )
      },
    },
    {
      colId: "orderNo",
      field: "orderNo",
      headerName: "Order No",
      minWidth: 110,
      pinned: "left",
      valueFormatter: (p) =>
        p.value != null && String(p.value).trim() ? String(p.value) : "—",
    },
    {
      colId: "customerId",
      field: "customerId",
      headerName: "Cus. No",
      minWidth: 100,
      valueFormatter: (p) =>
        p.value != null && String(p.value).trim() ? String(p.value) : "—",
    },
    {
      colId: "customerName",
      headerName: "Name",
      minWidth: 160,
      valueGetter: (p) =>
        customerFullName(p.data?.customerFirstName, p.data?.customerLastName),
    },
    {
      colId: "customerPhone",
      headerName: "Mobile",
      minWidth: 140,
      valueGetter: (p) => {
        const phone = p.data?.customerPhone?.trim()
        if (!phone) return "—"
        const cc = p.data?.customerCountryCode?.trim()
        return cc ? `+${cc} ${phone}` : phone
      },
    },
    {
      colId: "orderDate",
      headerName: "Order Date",
      minWidth: 120,
      valueGetter: (p) => formatStoreOrderDate(p.data?.orderDate),
    },
    {
      colId: "netTotal",
      headerName: "Net Total",
      minWidth: 110,
      valueGetter: (p) => formatRupees(p.data?.afterDeductionsTotal),
    },
    {
      colId: "balance",
      headerName: "Balance",
      minWidth: 110,
      valueGetter: (p) => formatRupees(p.data?.balanceAmount),
    },
    {
      colId: "stylist",
      headerName: "Stylist",
      minWidth: 130,
      valueGetter: (p) => firstName(p.data?.stylist),
    },
    {
      colId: "studio",
      headerName: "Studio",
      minWidth: 130,
      valueGetter: (p) =>
        p.data?.studio
          ?.map((s) => s?.name)
          .filter(Boolean)
          .join(", ") || "—",
    },
    {
      colId: "orderStatus",
      field: "orderStatus",
      headerName: "Status",
      minWidth: 130,
      valueFormatter: (p) =>
        p.value != null && String(p.value).trim() ? String(p.value) : "—",
    },
    {
      colId: "sourceChannel",
      field: "sourceChannel",
      headerName: "Source",
      minWidth: 120,
      valueFormatter: (p) =>
        p.value != null && String(p.value).trim() ? String(p.value) : "—",
    },
    {
      colId: "embroidery",
      headerName: "Embroidery",
      minWidth: 110,
      valueGetter: (p) => (p.data && hasEmbroidery(p.data) ? "Yes" : "No"),
    },
    {
      colId: "occasion",
      headerName: "Occasion",
      minWidth: 140,
      valueGetter: (p) => (p.data ? occasionsLabel(p.data) : "—"),
    },
    {
      colId: "invoiceNo",
      headerName: "Invoice No",
      minWidth: 110,
      valueGetter: (p) => (p.data ? invoiceNo(p.data) : "—"),
    },
    {
      colId: "trial",
      headerName: "Trial",
      minWidth: 100,
      valueGetter: (p) => (p.data?.orderTrial?._id ? "Entered" : "Pending"),
    },
  ]
}
