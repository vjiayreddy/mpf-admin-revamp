"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  COUNTRY_CALLING_CODE_OPTIONS,
  labelForCallingCode,
} from "@/lib/customers/country-calling-codes"
import { cn } from "@/lib/utils"

type CountryCallingCodeSelectProps = {
  label?: string
  value: string
  onChange: (callingCode: string) => void
  disabled?: boolean
  placeholder?: string
}

export function CountryCallingCodeSelect({
  label = "Country",
  value,
  onChange,
  disabled,
  placeholder = "Search country…",
}: CountryCallingCodeSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedLabel = value ? labelForCallingCode(value) : ""

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COUNTRY_CALLING_CODE_OPTIONS
    return COUNTRY_CALLING_CODE_OPTIONS.filter((opt) => {
      const haystack = `${opt.label} ${opt.value} ${opt.iso2}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [search])

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label ? (
        <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
          {label}
        </Label>
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
          type="button"
          aria-label={label || "Select country"}
          disabled={disabled}
          className={cn(
            "border-input flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedLabel && "text-muted-foreground"
            )}
          >
            {selectedLabel || "Any country"}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent
          className="z-[80] w-[var(--anchor-width)] min-w-[280px] p-0"
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <div className="border-b p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="h-8"
              autoFocus
            />
          </div>
          <ScrollArea className="h-64">
            <div className="p-1">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-sm">
                  No country found.
                </p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={`${opt.iso2}-${opt.value}`}
                    type="button"
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      opt.value === value && "bg-accent"
                    )}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate text-left">
                      {opt.label}
                    </span>
                    <CheckIcon
                      className={cn(
                        "size-4 shrink-0",
                        opt.value === value ? "opacity-100" : "opacity-0"
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
                <XIcon className="size-3.5" />
                Clear country
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
