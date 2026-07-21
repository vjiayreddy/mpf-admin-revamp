"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  GET_STYLING_CONFIG,
  type GetStylingConfigData,
  type GetStylingConfigVars,
  type StylingConfigAttribute,
  type StylingConfigOption,
} from "@/lib/apollo/queries/styling-config"
import type { StoreOrderItem } from "@/lib/apollo/queries/store-orders"
import { formatProductLabel, type OrderFormItem } from "@/lib/orders/form"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

export type StyleDesignValue = NonNullable<StoreOrderItem["styleDesign"]>

export type StylingFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catId: string
  itemName: string
  styleDesign?: StyleDesignValue | null
  /** Other line items — used to prefill suit attrs from blazer/trouser siblings. */
  siblingItems?: OrderFormItem[]
  readOnly?: boolean
  onSubmit: (data: StyleDesignValue) => void
}

type StyleAttribute = NonNullable<
  NonNullable<StyleDesignValue["styleAttributes"]>[number]
>

function normalizeStyleDesign(
  raw: StyleDesignValue | string | null | undefined
): StyleDesignValue | null {
  if (!raw) return null
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as StyleDesignValue
    } catch {
      return null
    }
  }
  return raw
}

function siblingStyleDesign(item: OrderFormItem): StyleDesignValue | null {
  return normalizeStyleDesign(item.styleDesign as StyleDesignValue | string | null | undefined)
}

function findSavedValue(
  design: StyleDesignValue | null,
  masterName: string
): string {
  if (!design?.styleAttributes?.length) return ""
  const found = design.styleAttributes.find((a) => a?.master_name === masterName)
  return found?.value?.trim() || ""
}

function matchSiblingOptionId(
  attr: StylingConfigAttribute,
  siblingItems: OrderFormItem[]
): string {
  const options = attr.options ?? []
  if (!options.length || siblingItems.length === 0) return ""

  const isTrouserSectionAttr = (attr.label || "")
    .toLowerCase()
    .includes("trouser")

  for (const item of siblingItems) {
    const design = siblingStyleDesign(item)
    if (!design?.styleAttributes?.length) continue

    const isTrouserSibling = (item.itemName || "")
      .toLowerCase()
      .includes("trouser")
    const eligible = isTrouserSectionAttr ? isTrouserSibling : !isTrouserSibling
    if (!eligible) continue

    for (const saved of design.styleAttributes) {
      const match = options.find(
        (opt) =>
          (opt.name || "").trim().toLowerCase() ===
          (saved?.name || "").trim().toLowerCase()
      )
      if (match?._id) return match._id
    }
  }

  return ""
}

function filterOptionsForProduct(
  itemName: string,
  attr: StylingConfigAttribute
): StylingConfigOption[] {
  const options = attr.options ?? []
  const label = (attr.label || "").trim().toLowerCase()

  if (itemName !== "indowestern_top") return options

  if (label === "with / without side pockets") {
    return options.filter(
      (opt) => !(opt.name || "").toLowerCase().includes("chest")
    )
  }
  if (label === "with / without chest pockets") {
    return options.filter(
      (opt) => !(opt.name || "").toLowerCase().includes("side")
    )
  }
  return options
}

function StyleOptionRadioGroup({
  name,
  label,
  options,
  value,
  disabled,
  onChange,
}: {
  name: string
  label: string
  options: StylingConfigOption[]
  value: string
  disabled?: boolean
  onChange: (id: string) => void
}) {
  return (
    <div
      className="space-y-2"
      role="radiogroup"
      aria-label={label}
      data-name={name}
    >
      <p className="text-sm font-medium">{label}</p>
      {options.length === 0 ? (
        <p className="text-muted-foreground text-xs">No options available</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {options.map((opt) => {
            const id = opt._id?.trim() || ""
            if (!id) return null
            const selected = value === id
            const img = opt.image?.trim() || ""
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                // Prevent browser scroll-into-view jump inside the dialog
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(selected ? "" : id)}
                className={cn(
                  "bg-background flex flex-col items-center gap-1.5 rounded-lg border p-1.5 text-left transition-colors",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  selected
                    ? "border-primary ring-primary/30 ring-2"
                    : "border-border hover:border-muted-foreground/40",
                  disabled && "pointer-events-none opacity-60"
                )}
              >
                <span className="bg-muted/40 relative flex h-20 w-full items-center justify-center overflow-hidden rounded-md">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      className="pointer-events-none h-full w-full object-contain"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-muted-foreground px-1 text-center text-[10px]">
                      No image
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "w-full text-center text-xs font-medium leading-snug",
                    selected ? "text-primary" : "text-foreground"
                  )}
                >
                  {opt.name || "—"}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function StylingFormDialog({
  open,
  onOpenChange,
  catId,
  itemName,
  styleDesign,
  siblingItems = [],
  readOnly = false,
  onSubmit,
}: StylingFormDialogProps) {
  const [note, setNote] = useState("")
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [initializedFor, setInitializedFor] = useState<string | null>(null)

  const { data, loading, error } = useQuery<
    GetStylingConfigData,
    GetStylingConfigVars
  >(GET_STYLING_CONFIG, {
    variables: { catId },
    skip: !open || !catId,
    fetchPolicy: "cache-first",
  })

  const attributes = useMemo(() => {
    const attrs = data?.getStylingConfig?.attributes ?? []
    return [...attrs].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
  }, [data?.getStylingConfig?.attributes])

  // Reset init key when dialog closes so reopening re-applies defaults
  useEffect(() => {
    if (!open) setInitializedFor(null)
  }, [open])

  useEffect(() => {
    if (!open || !attributes.length) return
    const initKey = `${catId}:${itemName}:${attributes.length}`
    if (initializedFor === initKey) return

    const design = normalizeStyleDesign(styleDesign)
    const next: Record<string, string> = {}

    for (const attr of attributes) {
      const master = attr.masterName?.trim()
      if (!master) continue

      let matched = findSavedValue(design, master)
      // Only prefill from siblings when editing — view mode shows saved values only
      if (!matched && !readOnly) {
        matched = matchSiblingOptionId(attr, siblingItems)
      }
      if (matched) next[master] = matched
    }

    setNote(design?.note?.trim() || "")
    setSelections(next)
    setInitializedFor(initKey)
  }, [
    open,
    attributes,
    catId,
    itemName,
    styleDesign,
    siblingItems,
    readOnly,
    initializedFor,
  ])

  const handleSubmit = () => {
    if (readOnly) {
      onOpenChange(false)
      return
    }

    const chestPocketAttr = attributes.find(
      (attr) =>
        itemName === "indowestern_top" &&
        (attr.label || "").toLowerCase().includes("chest")
    )
    if (chestPocketAttr?.masterName) {
      const selected = selections[chestPocketAttr.masterName]?.trim()
      if (!selected) {
        notify.error("Please select a chest pocket option")
        return
      }
    }

    const styleAttributes: StyleAttribute[] = []
    for (const attr of attributes) {
      const master = attr.masterName?.trim()
      if (!master) continue
      const selectedId = selections[master]?.trim()
      if (!selectedId) continue

      const options = filterOptionsForProduct(itemName, attr)
      const option = options.find((o) => o._id === selectedId)
      if (!option?._id) continue

      styleAttributes.push({
        master_name: master,
        value: option._id,
        catId,
        name: option.name ?? null,
        image: option.image ?? null,
      })
    }

    onSubmit({
      note: note.trim() || "",
      monogramLetter: styleDesign?.monogramLetter ?? "",
      handDesign: styleDesign?.handDesign ?? "",
      styleAttributes,
    })
    notify.success("Styling details saved")
    onOpenChange(false)
  }

  const title = itemName
    ? `${formatProductLabel(itemName)} styling details`
    : "Styling details"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="border-border flex shrink-0 flex-row items-start justify-between gap-3 border-b px-4 py-3 text-left">
          <div className="min-w-0">
            <DialogTitle className="truncate text-base">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
              {readOnly
                ? "View style attributes for this product"
                : "Choose style options for this product"}
            </DialogDescription>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 shrink-0"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [overflow-anchor:none]">
          {!catId ? (
            <p className="text-destructive text-sm">
              Select a product before editing styling.
            </p>
          ) : null}

          {catId && loading ? (
            <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading styling config…
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm">{error.message}</p>
          ) : null}

          {catId && !loading && !error ? (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="styling-note" className="text-xs font-medium">
                  Note
                </Label>
                <Textarea
                  id="styling-note"
                  rows={2}
                  className="min-h-[4rem] resize-y"
                  placeholder="Enter a note"
                  value={note}
                  disabled={readOnly}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {attributes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No styling attributes configured for this product.
                </p>
              ) : (
                attributes.map((attr) => {
                  const master = attr.masterName?.trim()
                  if (!master) return null
                  const options = filterOptionsForProduct(itemName, attr)
                  return (
                    <StyleOptionRadioGroup
                      key={master}
                      name={master}
                      label={attr.label || master}
                      options={options}
                      value={selections[master] || ""}
                      disabled={readOnly}
                      onChange={(id) =>
                        setSelections((prev) => ({ ...prev, [master]: id }))
                      }
                    />
                  )
                })
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-border shrink-0 justify-end gap-2 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly ? (
            <Button
              type="button"
              disabled={!catId || loading || Boolean(error)}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
