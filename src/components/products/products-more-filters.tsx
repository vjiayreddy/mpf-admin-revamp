"use client"

import { useEffect, useId, useState } from "react"

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
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_FILTER_PARAMS,
} from "@/config/product-filters"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type DraftState = {
  catId: string
}

function draftFromParams(searchParams: URLSearchParams): DraftState {
  return {
    catId: searchParams.get(PRODUCT_FILTER_PARAMS.catId) ?? "",
  }
}

type ProductsMoreFiltersProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
  onApply: (updates: Record<string, string | null>) => void
  onClear: () => void
}

export function ProductsMoreFilters({
  open,
  onOpenChange,
  searchParams,
  onApply,
  onClear,
}: ProductsMoreFiltersProps) {
  const catId = useId()
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
    onApply({
      [PRODUCT_FILTER_PARAMS.catId]:
        draft.catId && draft.catId !== "all" ? draft.catId : null,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More filters</SheetTitle>
          <SheetDescription>
            Filter products by category.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={catId} className="text-sm font-medium">
              Category
            </label>
            <select
              id={catId}
              className={selectClass}
              value={draft.catId || "all"}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  catId: e.target.value === "all" ? "" : e.target.value,
                }))
              }
            >
              <option value="all">All categories</option>
              {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
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
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
