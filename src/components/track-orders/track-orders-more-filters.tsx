"use client"

import { useEffect, useId, useState } from "react"

import {
  FilterDateField,
  FilterFieldset,
} from "@/components/customers/filter-fields"
import { StudioMultiSelect } from "@/components/customers/studio-multi-select"
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
  HAS_EMBROIDARY_OPTIONS,
  OUTFIT_STATUS_OPTIONS,
  TRACK_ORDERS_LIST_PARAMS,
} from "@/config/track-orders-list-filters"
import {
  dateInputToIso,
  isoToDateInput,
} from "@/lib/customers/date-filter"
import type { StudioOption } from "@/lib/apollo/queries/studios"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

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
  studioIds: string[]
  hasEmbroidary: string
  outfitStatus: string[]
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  const p = TRACK_ORDERS_LIST_PARAMS
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
    studioIds: (searchParams.get(p.studioIds) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    hasEmbroidary: searchParams.get(p.hasEmbroidary) ?? "",
    outfitStatus: (searchParams.get(p.outfitStatus) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  }
}

type TrackOrdersMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  studios: StudioOption[]
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function TrackOrdersMoreFilters({
  open,
  onOpenChange,
  searchParams,
  studios,
  onApply,
  onClear,
}: TrackOrdersMoreFiltersProps) {
  const embId = useId()
  const outfitId = useId()
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromParams(searchParams)
  )

  useEffect(() => {
    if (open) setDraft(draftFromParams(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: open gate
  }, [open])

  const handleApply = () => {
    const p = TRACK_ORDERS_LIST_PARAMS
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
      [p.studioIds]:
        draft.studioIds.length > 0 ? draft.studioIds.join(",") : null,
      [p.hasEmbroidary]: draft.hasEmbroidary || null,
      [p.outfitStatus]:
        draft.outfitStatus.length > 0 ? draft.outfitStatus.join(",") : null,
    })
    onOpenChange(false)
  }

  const toggleOutfit = (value: string) => {
    setDraft((prev) => {
      const set = new Set(prev.outfitStatus)
      if (set.has(value)) set.delete(value)
      else set.add(value)
      return { ...prev, outfitStatus: Array.from(set) }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Date ranges, studios, embroidery, and outfit status.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <FilterFieldset legend="Order dates">
            <FilterDateField
              label="From"
              value={draft.startOrderDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, startOrderDate: v }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endOrderDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, endOrderDate: v }))
              }
            />
          </FilterFieldset>

          <FilterFieldset legend="Trial dates">
            <FilterDateField
              label="From"
              value={draft.startTrialDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, startTrialDate: v }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endTrialDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, endTrialDate: v }))
              }
            />
          </FilterFieldset>

          <FilterFieldset legend="Event dates">
            <FilterDateField
              label="From"
              value={draft.startEventDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, startEventDate: v }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endEventDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, endEventDate: v }))
              }
            />
          </FilterFieldset>

          <FilterFieldset legend="Ready dates">
            <FilterDateField
              label="From"
              value={draft.startReadyDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, startReadyDate: v }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endReadyDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, endReadyDate: v }))
              }
            />
          </FilterFieldset>

          <FilterFieldset legend="Delivery dates">
            <FilterDateField
              label="From"
              value={draft.startDeliveryDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, startDeliveryDate: v }))
              }
            />
            <FilterDateField
              label="To"
              value={draft.endDeliveryDate}
              onChange={(v) =>
                setDraft((prev) => ({ ...prev, endDeliveryDate: v }))
              }
            />
          </FilterFieldset>

          <StudioMultiSelect
            label="Studios"
            studios={studios}
            selectedIds={draft.studioIds}
            onChange={(ids) =>
              setDraft((prev) => ({ ...prev, studioIds: ids }))
            }
          />

          <div className="grid gap-2">
            <label htmlFor={embId} className="text-sm font-medium">
              Has embroidery
            </label>
            <select
              id={embId}
              className={selectClass}
              value={draft.hasEmbroidary}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hasEmbroidary: e.target.value,
                }))
              }
            >
              {HAS_EMBROIDARY_OPTIONS.map((opt) => (
                <option key={opt.value || "any"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <p id={outfitId} className="text-sm font-medium">
              Outfit status
            </p>
            <div
              className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border p-2"
              role="group"
              aria-labelledby={outfitId}
            >
              {OUTFIT_STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="hover:bg-muted flex items-center gap-2 rounded px-1 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-3.5 accent-primary"
                    checked={draft.outfitStatus.includes(opt.value)}
                    onChange={() => toggleOutfit(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t">
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
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
