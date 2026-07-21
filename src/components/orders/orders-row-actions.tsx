"use client"

import {
  ClipboardListIcon,
  EyeIcon,
  FilePenIcon,
  HistoryIcon,
  IndianRupeeIcon,
  MoreHorizontalIcon,
  PrinterIcon,
  RulerIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { OrdersListRow } from "@/lib/apollo/queries/store-orders"

export type OrdersRowActionsProps = {
  row: OrdersListRow
  onView: (row: OrdersListRow) => void
  onEdit: (row: OrdersListRow) => void
  onPrint: (row: OrdersListRow) => void
  onTrial: (row: OrdersListRow) => void
  onInvoice: (row: OrdersListRow) => void
  onPayments: (row: OrdersListRow) => void
  onStyleHistory: (row: OrdersListRow) => void
  invoiceBusy?: boolean
}

export function OrdersRowActions({
  row,
  onView,
  onEdit,
  onPrint,
  onTrial,
  onInvoice,
  onPayments,
  onStyleHistory,
  invoiceBusy,
}: OrdersRowActionsProps) {
  const hasInvoice = Boolean(
    row.invoices?.some((inv) => inv?._id || inv?.invoiceNo != null)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-1 size-7"
            aria-label="More actions"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-52"
        onClick={(e) => e.stopPropagation()}
      >
        {row.customerId ? (
          <>
            <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              Cus. No: {row.customerId}
            </div>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onView(row)}
        >
          <EyeIcon className="size-4 shrink-0" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onEdit(row)}
        >
          <FilePenIcon className="size-4 shrink-0" />
          Edit order
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onPrint(row)}
        >
          <PrinterIcon className="size-4 shrink-0" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onPayments(row)}
        >
          <IndianRupeeIcon className="size-4 shrink-0" />
          Payments
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onTrial(row)}
        >
          <RulerIcon className="size-4 shrink-0" />
          {row.orderTrial?._id ? "View trial" : "Enter trial"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          disabled={invoiceBusy}
          onClick={() => onInvoice(row)}
        >
          <ClipboardListIcon className="size-4 shrink-0" />
          {hasInvoice ? "View invoice" : "Generate invoice"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onStyleHistory(row)}
        >
          <HistoryIcon className="size-4 shrink-0" />
          Style history
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
