"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type GroupedMultiOption = {
  id: string
  name: string
  group?: string
}

type GroupedMultiAutocompleteProps = {
  options: GroupedMultiOption[]
  value: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  label: string
  id?: string
  searchPlaceholder?: string
  emptyPlaceholder?: string
  noMatchPlaceholder?: string
  loadingPlaceholder?: string
  listMaxHeightClassName?: string
  error?: string
  required?: boolean
}

type GroupedOptions = {
  group: string
  showHeader: boolean
  options: GroupedMultiOption[]
}

function buildGroups(options: GroupedMultiOption[]): GroupedOptions[] {
  const order: string[] = []
  const byGroup = new Map<string, GroupedMultiOption[]>()

  for (const opt of options) {
    const group = opt.group?.trim() || ""
    if (!byGroup.has(group)) {
      byGroup.set(group, [])
      order.push(group)
    }
    byGroup.get(group)!.push(opt)
  }

  return order.map((group) => {
    const opts = byGroup.get(group) ?? []
    const showHeader =
      Boolean(group) &&
      !(opts.length === 1 && opts[0]?.name?.trim() === group)
    return { group, showHeader, options: opts }
  })
}

function chipLabel(opt: GroupedMultiOption) {
  return opt.name
}

export function GroupedMultiAutocomplete({
  options,
  value,
  onChange,
  loading,
  disabled,
  label,
  id: idProp,
  searchPlaceholder = "Search…",
  emptyPlaceholder = "No options available",
  noMatchPlaceholder = "No options match",
  loadingPlaceholder = "Loading…",
  listMaxHeightClassName = "max-h-48",
  error,
  required,
}: GroupedMultiAutocompleteProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedSet = useMemo(() => new Set(value), [value])

  const optionById = useMemo(() => {
    const map = new Map<string, GroupedMultiOption>()
    for (const opt of options) map.set(opt.id, opt)
    return map
  }, [options])

  const selectedOptions = useMemo(() => {
    return value
      .map((idValue) => optionById.get(idValue))
      .filter((opt): opt is GroupedMultiOption => Boolean(opt))
  }, [value, optionById])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => {
      const haystack = [opt.name, opt.group, opt.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [options, query])

  const groups = useMemo(() => buildGroups(filtered), [filtered])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root) return
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false)
        setQuery("")
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const toggle = (optionId: string) => {
    if (selectedSet.has(optionId)) {
      onChange(value.filter((v) => v !== optionId))
      return
    }
    onChange([...value, optionId])
  }

  const remove = (optionId: string) => {
    onChange(value.filter((v) => v !== optionId))
  }

  const openDropdown = () => {
    if (disabled || loading) return
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div ref={rootRef} className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required ? <span className="text-destructive ml-0.5">*</span> : null}
        </Label>
        {value.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={disabled}
            onClick={() => onChange([])}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "border-input relative w-full rounded-lg border",
          error && "border-destructive"
        )}
      >
        <div
          className={cn(
            "flex min-h-9 items-start gap-1.5 px-2 py-1",
            open && "border-b"
          )}
          onClick={openDropdown}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selectedOptions.map((opt) => (
              <span
                key={opt.id}
                className="bg-muted inline-flex max-w-full items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-xs"
              >
                <span className="whitespace-normal break-words">
                  {chipLabel(opt)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${opt.name}`}
                  disabled={disabled}
                  className="hover:bg-background/80 inline-flex size-3.5 shrink-0 items-center justify-center rounded-sm opacity-70 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(opt.id)
                  }}
                >
                  <XIcon className="size-2.5" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={query}
              disabled={disabled || loading}
              placeholder={
                selectedOptions.length > 0
                  ? ""
                  : loading
                    ? loadingPlaceholder
                    : options.length === 0
                      ? emptyPlaceholder
                      : searchPlaceholder
              }
              className="placeholder:text-muted-foreground h-7 min-w-[7rem] flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
              autoComplete="off"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={`${id}-listbox`}
              onFocus={openDropdown}
              onClick={(e) => {
                e.stopPropagation()
                openDropdown()
              }}
              onChange={(e) => {
                setQuery(e.target.value)
                if (!open) setOpen(true)
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" &&
                  !query &&
                  selectedOptions.length > 0
                ) {
                  remove(selectedOptions[selectedOptions.length - 1]!.id)
                }
              }}
            />
          </div>
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || loading}
            aria-label={open ? "Close options" : "Open options"}
            className="text-muted-foreground mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation()
              if (open) {
                setOpen(false)
                setQuery("")
              } else {
                openDropdown()
              }
            }}
          >
            <ChevronsUpDownIcon className="size-3.5 opacity-50" />
          </button>
        </div>

        {open ? (
          <ul
            id={`${id}-listbox`}
            className={cn("overflow-y-auto py-1", listMaxHeightClassName)}
            role="listbox"
            aria-multiselectable
            aria-label={label}
          >
            {loading ? (
              <li className="text-muted-foreground px-2.5 py-2 text-xs">
                Loading…
              </li>
            ) : groups.length === 0 ? (
              <li className="text-muted-foreground px-2.5 py-2 text-xs">
                {options.length === 0 ? emptyPlaceholder : noMatchPlaceholder}
              </li>
            ) : (
              groups.map(({ group, showHeader, options: groupOptions }) => (
                <li key={group || "__ungrouped"} className="list-none">
                  {showHeader ? (
                    <div className="bg-muted text-muted-foreground sticky top-0 z-10 border-b px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
                      {group}
                    </div>
                  ) : null}
                  <ul role="group" aria-label={group || label}>
                    {groupOptions.map((opt) => {
                      const checked = selectedSet.has(opt.id)
                      return (
                        <li key={opt.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={checked}
                            disabled={disabled}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggle(opt.id)}
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
                              {checked ? (
                                <CheckIcon className="size-3" />
                              ) : null}
                            </span>
                            <span className="min-w-0 truncate">{opt.name}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
