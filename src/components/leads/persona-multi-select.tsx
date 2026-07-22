"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type PersonaSelectOption = {
  id: string
  label: string
}

type PersonaMultiSelectProps = {
  /** When empty/omitted, no built-in label is rendered (use a parent Field label). */
  label?: string
  id?: string
  options: PersonaSelectOption[]
  value: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
}

/**
 * Multi-select with chips inside the input (MUI Autocomplete style),
 * and a locally anchored dropdown (no portal).
 */
export function PersonaMultiSelect({
  label,
  id: idProp,
  options,
  value,
  onChange,
  loading,
  disabled,
  placeholder,
  searchPlaceholder = "Search persona…",
}: PersonaMultiSelectProps) {
  const reactId = useId()
  const id = idProp || reactId
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedOptions = useMemo(() => {
    const set = new Set(value)
    return options.filter((o) => set.has(o.id))
  }, [options, value])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => {
      const haystack = `${o.label} ${o.id}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [options, search])

  const toggle = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter((x) => x !== optionId))
    } else {
      onChange([...value, optionId])
    }
  }

  const remove = (optionId: string) => {
    onChange(value.filter((x) => x !== optionId))
  }

  const openMenu = () => {
    if (disabled || loading) return
    setOpen(true)
    setSearch("")
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  return (
    <div ref={rootRef} className="relative flex min-w-0 flex-col gap-1.5">
      {label ? (
        <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
          {label}
          {selectedOptions.length > 0 ? (
            <span className="text-foreground ml-1 font-medium">
              ({selectedOptions.length})
            </span>
          ) : null}
        </Label>
      ) : null}

      <div
        id={id}
        role="combobox"
        tabIndex={disabled || loading ? -1 : 0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled || loading || undefined}
        onClick={openMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openMenu()
          }
        }}
        className={cn(
          "border-input flex min-h-9 w-full items-center gap-1.5 rounded-lg border bg-transparent px-2 py-1.5 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          (disabled || loading) && "cursor-not-allowed opacity-50",
          !(disabled || loading) && "cursor-pointer"
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {loading ? (
            <span className="text-muted-foreground px-0.5">Loading personas…</span>
          ) : selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.id}
                className="bg-muted inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs"
              >
                <span className="truncate">{opt.label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  className="hover:bg-background/80 shrink-0 rounded-sm p-0.5"
                  title={`Remove ${opt.label}`}
                  aria-label={`Remove ${opt.label}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(opt.id)
                  }}
                >
                  <XIcon className="size-3 opacity-70" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground px-0.5">
              {placeholder ?? "Select personas"}
            </span>
          )}
        </div>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
      </div>

      {open ? (
        <div
          className={cn(
            "bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1",
            "min-w-[260px] overflow-hidden rounded-lg border shadow-md"
          )}
          role="listbox"
          aria-multiselectable
          aria-label={label || "Personas"}
        >
          <div className="border-b p-2">
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8"
            />
          </div>
          <ScrollArea className="h-52">
            <div className="p-1">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-sm">
                  No persona found.
                </p>
              ) : (
                filtered.map((opt) => {
                  const selected = value.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                        selected && "bg-accent"
                      )}
                      onClick={() => toggle(opt.id)}
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
                        {opt.label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  )
}
