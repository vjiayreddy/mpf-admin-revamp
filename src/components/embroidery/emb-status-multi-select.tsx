"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EMB_STATUS_OPTIONS } from "@/config/embroidery-status"
import { cn } from "@/lib/utils"

type EmbStatusMultiSelectProps = {
  value: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  className?: string
}

export function EmbStatusMultiSelect({
  value,
  onChange,
  disabled,
  className,
}: EmbStatusMultiSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const selectedSet = useMemo(() => new Set(value), [value])

  const triggerLabel = useMemo(() => {
    if (value.length === 0) return "Emb status"
    if (value.length === 1) {
      return (
        EMB_STATUS_OPTIONS.find((o) => o.value === value[0])?.label ??
        value[0]
      )
    }
    return `Emb status (${value.length})`
  }, [value])

  const toggle = (status: string) => {
    if (selectedSet.has(status)) {
      onChange(value.filter((v) => v !== status))
      return
    }
    onChange([...value, status])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        aria-label="Emb status"
        aria-haspopup="listbox"
        disabled={disabled}
        className={cn(
          "border-input flex h-8 min-w-[9rem] max-w-[14rem] items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            value.length === 0 && "text-muted-foreground"
          )}
        >
          {triggerLabel}
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--anchor-width)] min-w-[220px] p-0"
        align="start"
      >
        <div className="flex items-center justify-between gap-2 border-b px-2.5 py-1.5">
          <span className="text-muted-foreground text-xs">
            {value.length > 0 ? `${value.length} selected` : "Select statuses"}
          </span>
          {value.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onChange([])}
            >
              <XIcon className="size-3" />
              Clear
            </Button>
          ) : null}
        </div>
        <ScrollArea className="h-56">
          <ul
            className="py-1"
            role="listbox"
            aria-multiselectable
            aria-label="Emb status"
          >
            {EMB_STATUS_OPTIONS.map((opt) => {
              const checked = selectedSet.has(opt.value)
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    disabled={disabled}
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "hover:bg-muted flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm",
                      checked && "bg-muted/60"
                    )}
                  >
                    <span
                      className={cn(
                        "border-input flex size-4 shrink-0 items-center justify-center rounded border",
                        checked &&
                          "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {checked ? <CheckIcon className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 truncate">{opt.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

/** Parse comma-separated embStatus URL param into unique values. */
export function parseEmbStatusParam(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(",")) {
    const v = part.trim()
    if (!v || seen.has(v)) continue
    seen.add(v)
    out.push(v)
  }
  return out
}

export function serializeEmbStatusParam(values: string[]): string | null {
  return values.length > 0 ? values.join(",") : null
}
