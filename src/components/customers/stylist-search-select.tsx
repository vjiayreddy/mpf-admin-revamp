"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

type StylistSearchSelectProps = {
  label: string
  stylists: StylistOption[]
  value: string
  onChange: (stylistId: string) => void
  loading?: boolean
  disabled?: boolean
}

export function StylistSearchSelect({
  label,
  stylists,
  value,
  onChange,
  loading,
  disabled,
}: StylistSearchSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selected = useMemo(
    () => stylists.find((s) => s._id === value) ?? null,
    [stylists, value]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stylists
    return stylists.filter((s) => {
      const haystack = [s.name, s.email, s.phone, s._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [stylists, search])

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {label}
      </Label>
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
            "border-input flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="truncate text-left">
            {loading
              ? "Loading stylists…"
              : selected?.name || selected?.email || "Select stylist"}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--anchor-width)] min-w-[240px] p-0" align="start">
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
                filtered.map((stylist) => (
                  <button
                    key={stylist._id}
                    type="button"
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      stylist._id === value && "bg-accent"
                    )}
                    onClick={() => {
                      onChange(stylist._id)
                      setOpen(false)
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate text-left">
                      {stylist.name || stylist.email || stylist._id}
                    </span>
                    <CheckIcon
                      className={cn(
                        "size-4 shrink-0",
                        stylist._id === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          {value ? (
            <div className="border-t p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                Clear stylist
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
