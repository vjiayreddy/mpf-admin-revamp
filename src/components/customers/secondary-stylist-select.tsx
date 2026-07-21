"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import { cn } from "@/lib/utils"

type SecondaryStylistSelectProps = {
  label?: string
  stylists: StylistOption[]
  value: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  /** Exclude these stylist ids from the picker (e.g. personal stylist). */
  excludeIds?: string[]
}

export function SecondaryStylistSelect({
  label = "Secondary stylists",
  stylists,
  value,
  onChange,
  loading,
  disabled,
  excludeIds,
}: SecondaryStylistSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const excludeSet = useMemo(
    () => new Set((excludeIds ?? []).filter(Boolean)),
    [excludeIds]
  )

  const available = useMemo(
    () => stylists.filter((s) => !excludeSet.has(s._id)),
    [stylists, excludeSet]
  )

  const selectedStylists = useMemo(() => {
    const set = new Set(value)
    return available.filter((s) => set.has(s._id))
  }, [available, value])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return available
    return available.filter((s) => {
      const haystack = [s.name, s.email, s.phone, s._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [available, search])

  const toggle = (stylistId: string) => {
    if (value.includes(stylistId)) {
      onChange(value.filter((id) => id !== stylistId))
    } else {
      onChange([...value, stylistId])
    }
  }

  const remove = (stylistId: string) => {
    onChange(value.filter((id) => id !== stylistId))
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label ? (
        <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
          {label}
          {selectedStylists.length > 0 ? (
            <span className="text-foreground ml-1 font-medium">
              ({selectedStylists.length})
            </span>
          ) : null}
        </Label>
      ) : null}

      {selectedStylists.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedStylists.map((stylist) => (
            <button
              key={stylist._id}
              type="button"
              disabled={disabled}
              onClick={() => remove(stylist._id)}
              className="bg-muted hover:bg-muted/80 inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
              title="Remove stylist"
            >
              <span className="truncate">
                {stylist.name || stylist.email || stylist._id}
              </span>
              <XIcon className="size-3 shrink-0 opacity-70" />
            </button>
          ))}
        </div>
      ) : null}

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setSearch("")
        }}
      >
        <PopoverTrigger
          id={id}
          disabled={disabled || loading}
          className={cn(
            "border-input flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="text-muted-foreground truncate text-left">
            {loading
              ? "Loading stylists…"
              : selectedStylists.length
                ? "Add or remove secondary stylists"
                : "Select secondary stylists"}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--anchor-width)] min-w-[260px] p-0"
          align="start"
        >
          <div className="border-b p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stylist…"
              className="h-8"
              autoFocus
            />
          </div>
          <ScrollArea className="h-52">
            <div className="p-1">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-sm">
                  No stylist found.
                </p>
              ) : (
                filtered.map((stylist) => {
                  const selected = value.includes(stylist._id)
                  return (
                    <button
                      key={stylist._id}
                      type="button"
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                        selected && "bg-accent"
                      )}
                      onClick={() => toggle(stylist._id)}
                    >
                      <span
                        className={cn(
                          "border-input flex size-4 shrink-0 items-center justify-center rounded border",
                          selected &&
                            "border-primary bg-primary text-primary-foreground"
                        )}
                      >
                        {selected ? <CheckIcon className="size-3" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left">
                        {stylist.name || stylist.email || stylist._id}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
