"use client"

import { useEffect, useId, useState } from "react"

import {
  FilterDateField,
  FilterFieldset,
} from "@/components/customers/filter-fields"
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
  RECEIPT_BALANCE_OPTIONS,
  RECEIPT_FILTER_PARAMS,
} from "@/config/receipt-filters"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type DraftState = {
  paymentStartDate: string
  paymentEndDate: string
  hasBalance: string
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = RECEIPT_FILTER_PARAMS
  return {
    paymentStartDate: isoToDateInput(searchParams.get(p.paymentStartDate)),
    paymentEndDate: isoToDateInput(searchParams.get(p.paymentEndDate)),
    hasBalance: searchParams.get(p.hasBalance) ?? "",
  }
}

type ReceiptsMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function ReceiptsMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: ReceiptsMoreFiltersProps) {
  const balanceId = useId()
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  useEffect(() => {
    if (open) {
      setDraft(draftFromParams(searchParams))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: open gate only
  }, [open])

  const handleApply = () => {
    const p = RECEIPT_FILTER_PARAMS
    onApply({
      [p.paymentStartDate]: dateInputToIso(draft.paymentStartDate),
      [p.paymentEndDate]: dateInputToIso(draft.paymentEndDate),
      [p.hasBalance]:
        draft.hasBalance === "true" || draft.hasBalance === "false"
          ? draft.hasBalance
          : null,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter by payment date range and remaining balance.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <FilterFieldset legend="Payment date">
            <div className="grid grid-cols-2 gap-3">
              <FilterDateField
                label="From"
                value={draft.paymentStartDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, paymentStartDate: value }))
                }
              />
              <FilterDateField
                label="To"
                value={draft.paymentEndDate}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, paymentEndDate: value }))
                }
              />
            </div>
          </FilterFieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor={balanceId} className="text-sm font-medium">
              Remaining balance
            </label>
            <select
              id={balanceId}
              className={selectClass}
              value={draft.hasBalance || "all"}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hasBalance: e.target.value === "all" ? "" : e.target.value,
                }))
              }
            >
              <option value="all">All</option>
              {RECEIPT_BALANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClear()
              onOpenChange(false)
            }}
          >
            Clear
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
