"use client"

import { useEffect, useState } from "react"

import {
  FilterDateField,
  FilterFieldset,
  FilterSelect,
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
  EMBROIDERY_FILTER_OPTIONS,
  ORDERS_PARAMS,
} from "@/config/orders-filters"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"

type DraftState = {
  startOrderDate: string
  endOrderDate: string
  startTrialDate: string
  endTrialDate: string
  startEventDate: string
  endEventDate: string
  startReadyDate: string
  endReadyDate: string
  startDeliveryDate: string
  endDeliveryDate: string
  hasEmbroidary: string
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = ORDERS_PARAMS
  return {
    startOrderDate: isoToDateInput(searchParams.get(p.startOrderDate)),
    endOrderDate: isoToDateInput(searchParams.get(p.endOrderDate)),
    startTrialDate: isoToDateInput(searchParams.get(p.startTrialDate)),
    endTrialDate: isoToDateInput(searchParams.get(p.endTrialDate)),
    startEventDate: isoToDateInput(searchParams.get(p.startEventDate)),
    endEventDate: isoToDateInput(searchParams.get(p.endEventDate)),
    startReadyDate: isoToDateInput(searchParams.get(p.startReadyDate)),
    endReadyDate: isoToDateInput(searchParams.get(p.endReadyDate)),
    startDeliveryDate: isoToDateInput(searchParams.get(p.startDeliveryDate)),
    endDeliveryDate: isoToDateInput(searchParams.get(p.endDeliveryDate)),
    hasEmbroidary: searchParams.get(p.hasEmbroidary) ?? "",
  }
}

type OrdersMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function OrdersMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: OrdersMoreFiltersProps) {
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  useEffect(() => {
    if (open) setDraft(draftFromParams(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open gate
  }, [open])

  const handleApply = () => {
    const p = ORDERS_PARAMS
    onApply({
      [p.startOrderDate]: dateInputToIso(draft.startOrderDate),
      [p.endOrderDate]: dateInputToIso(draft.endOrderDate),
      [p.startTrialDate]: dateInputToIso(draft.startTrialDate),
      [p.endTrialDate]: dateInputToIso(draft.endTrialDate),
      [p.startEventDate]: dateInputToIso(draft.startEventDate),
      [p.endEventDate]: dateInputToIso(draft.endEventDate),
      [p.startReadyDate]: dateInputToIso(draft.startReadyDate),
      [p.endReadyDate]: dateInputToIso(draft.endReadyDate),
      [p.startDeliveryDate]: dateInputToIso(draft.startDeliveryDate),
      [p.endDeliveryDate]: dateInputToIso(draft.endDeliveryDate),
      [p.hasEmbroidary]: draft.hasEmbroidary || null,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter orders by date ranges and embroidery.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-4">
          <FilterSelect
            label="Embroidery"
            value={draft.hasEmbroidary}
            allowEmpty
            emptyLabel="Any"
            options={EMBROIDERY_FILTER_OPTIONS}
            onChange={(value) =>
              setDraft((d) => ({ ...d, hasEmbroidary: value }))
            }
          />
          <FilterFieldset legend="Order date">
            <FilterDateField
              label="From"
              value={draft.startOrderDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startOrderDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endOrderDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endOrderDate: value }))
              }
            />
          </FilterFieldset>
          <FilterFieldset legend="Trial date">
            <FilterDateField
              label="From"
              value={draft.startTrialDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startTrialDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endTrialDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endTrialDate: value }))
              }
            />
          </FilterFieldset>
          <FilterFieldset legend="Event date">
            <FilterDateField
              label="From"
              value={draft.startEventDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startEventDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endEventDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endEventDate: value }))
              }
            />
          </FilterFieldset>
          <FilterFieldset legend="Ready date">
            <FilterDateField
              label="From"
              value={draft.startReadyDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startReadyDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endReadyDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endReadyDate: value }))
              }
            />
          </FilterFieldset>
          <FilterFieldset legend="Delivery date">
            <FilterDateField
              label="From"
              value={draft.startDeliveryDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, startDeliveryDate: value }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endDeliveryDate}
              onChange={(value) =>
                setDraft((d) => ({ ...d, endDeliveryDate: value }))
              }
            />
          </FilterFieldset>
        </div>
        <SheetFooter className="gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              onClear()
              onOpenChange(false)
            }}
          >
            Clear
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
