"use client"

import {
  IndianRupeeIcon,
  MinusCircleIcon,
  PackageIcon,
  PlusCircleIcon,
  WalletIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  calculateOrderTotals,
  type OrderFormItem,
  type OrderMoneyLine,
  type OrderPaymentLine,
} from "@/lib/orders/form"
import { formatRupees } from "@/lib/track-orders/format"
import { cn } from "@/lib/utils"

export type OrderFormSummaryRailProps = {
  items: OrderFormItem[]
  otherCharges: OrderMoneyLine[]
  deductions: OrderMoneyLine[]
  payments: OrderPaymentLine[]
  orderStatus: string
  statusOptions: Array<{ label: string; value: string }>
  onOrderStatusChange: (status: string) => void
  onEditOtherCharges: () => void
  onEditDeductions: () => void
  onEditPayments: () => void
  className?: string
}

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

function SummaryRow({
  icon: Icon,
  label,
  value,
  onClick,
  muted,
}: {
  icon: typeof PackageIcon
  label: string
  value: string
  onClick?: () => void
  muted?: boolean
}) {
  const content = (
    <>
      <span className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
        <Icon className="size-3.5 shrink-0 opacity-70" />
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "tabular-nums text-sm font-medium",
          muted && "text-muted-foreground"
        )}
      >
        {value}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="hover:bg-muted/60 flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2">
      {content}
    </div>
  )
}

export function OrderFormSummaryRail({
  items,
  otherCharges,
  deductions,
  payments,
  orderStatus,
  statusOptions,
  onOrderStatusChange,
  onEditOtherCharges,
  onEditDeductions,
  onEditPayments,
  className,
}: OrderFormSummaryRailProps) {
  const totals = calculateOrderTotals(
    items,
    otherCharges,
    deductions,
    payments
  )

  return (
    <aside
      className={cn(
        "bg-card flex flex-col gap-4 rounded-xl border p-4 sm:p-5",
        className
      )}
    >
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold tracking-tight">Order summary</h2>
        <p className="text-muted-foreground text-xs">
          Totals update as you add products and money lines.
        </p>
      </div>

      <div className="divide-y rounded-lg border">
        <SummaryRow
          icon={PackageIcon}
          label={`Products (${items.length})`}
          value={formatRupees(totals.orderTotal)}
        />
        <SummaryRow
          icon={PlusCircleIcon}
          label={`Other charges (${otherCharges.length})`}
          value={formatRupees(totals.otherCharges)}
          onClick={onEditOtherCharges}
        />
        <SummaryRow
          icon={MinusCircleIcon}
          label={`Deductions (${deductions.length})`}
          value={formatRupees(totals.deductions)}
          onClick={onEditDeductions}
        />
        <SummaryRow
          icon={WalletIcon}
          label={`Payments (${payments.length})`}
          value={formatRupees(totals.payment)}
          onClick={onEditPayments}
        />
      </div>

      <div className="bg-muted/40 space-y-2 rounded-lg border px-3 py-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Net total</span>
          <span className="font-semibold tabular-nums">
            {formatRupees(totals.afterDeductionsTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <IndianRupeeIcon className="size-3.5 opacity-70" />
            Balance due
          </span>
          <span className="text-base font-semibold tabular-nums tracking-tight">
            {formatRupees(totals.balanceAmount)}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="order-summary-status" className="text-xs font-medium">
          Order status
        </label>
        <select
          id="order-summary-status"
          className={selectClass}
          value={orderStatus}
          onChange={(e) => onOrderStatusChange(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={onEditPayments}
        >
          <WalletIcon className="size-4" />
          Manage payments
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={onEditOtherCharges}
        >
          <PlusCircleIcon className="size-4" />
          Other charges
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={onEditDeductions}
        >
          <MinusCircleIcon className="size-4" />
          Deductions
        </Button>
      </div>
    </aside>
  )
}
