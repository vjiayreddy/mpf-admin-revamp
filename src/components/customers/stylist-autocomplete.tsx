"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import { cn } from "@/lib/utils"

function stylistLabel(stylist: StylistOption) {
  return stylist.name?.trim() || stylist.email?.trim() || stylist._id
}

type StylistAutocompleteBaseProps = {
  stylists: StylistOption[]
  loading?: boolean
  disabled?: boolean
  label: string
  id?: string
  error?: string
  required?: boolean
  /** Exclude these stylist ids from the list (e.g. personal stylist). */
  excludeIds?: string[]
  searchPlaceholder?: string
}

type StylistMultiAutocompleteProps = StylistAutocompleteBaseProps & {
  multiple: true
  value: string[]
  onChange: (ids: string[]) => void
}

type StylistSingleAutocompleteProps = StylistAutocompleteBaseProps & {
  multiple?: false
  value: string
  onChange: (id: string) => void
}

export type StylistAutocompleteProps =
  | StylistMultiAutocompleteProps
  | StylistSingleAutocompleteProps

export function StylistAutocomplete(props: StylistAutocompleteProps) {
  const {
    stylists,
    loading,
    disabled,
    label,
    id: idProp,
    error,
    required,
    excludeIds,
    searchPlaceholder = "Search stylist…",
  } = props

  const isMultiple = props.multiple === true
  const autoId = useId()
  const id = idProp ?? autoId
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedIds = useMemo(() => {
    if (isMultiple) return props.value
    return props.value ? [props.value] : []
  }, [isMultiple, props.value])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const excludeSet = useMemo(
    () => new Set((excludeIds ?? []).filter(Boolean)),
    [excludeIds]
  )

  const options = useMemo(
    () =>
      stylists.filter(
        (s) => s._id && (!excludeSet.has(s._id) || selectedSet.has(s._id))
      ),
    [stylists, excludeSet, selectedSet]
  )

  const optionById = useMemo(() => {
    const map = new Map<string, StylistOption>()
    for (const s of stylists) map.set(s._id, s)
    return map
  }, [stylists])

  const selectedOptions = useMemo(
    () =>
      selectedIds
        .map((sid) => optionById.get(sid))
        .filter((s): s is StylistOption => Boolean(s)),
    [selectedIds, optionById]
  )

  const filtered = useMemo(() => {
    const dropdownSource = options.filter((s) => {
      // Multi (secondary): never list excluded personal stylist
      if (isMultiple && excludeSet.has(s._id)) return false
      return true
    })
    const q = query.trim().toLowerCase()
    if (!q) return dropdownSource
    return dropdownSource.filter((s) => {
      const haystack = [s.name, s.email, s.phone, s._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [options, query, excludeSet, isMultiple])

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

  const setSelected = (nextIds: string[]) => {
    if (isMultiple) {
      props.onChange(nextIds)
      return
    }
    props.onChange(nextIds[0] ?? "")
  }

  const toggle = (stylistId: string) => {
    if (isMultiple) {
      if (selectedSet.has(stylistId)) {
        setSelected(selectedIds.filter((v) => v !== stylistId))
      } else {
        setSelected([...selectedIds, stylistId])
      }
      return
    }
    setSelected([stylistId])
    setOpen(false)
    setQuery("")
  }

  const remove = (stylistId: string) => {
    setSelected(selectedIds.filter((v) => v !== stylistId))
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
        {selectedIds.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={disabled}
            onClick={() => setSelected([])}
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
                key={opt._id}
                className="bg-muted inline-flex max-w-full items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-xs"
              >
                <span className="whitespace-normal break-words">
                  {stylistLabel(opt)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${stylistLabel(opt)}`}
                  disabled={disabled}
                  className="hover:bg-background/80 inline-flex size-3.5 shrink-0 items-center justify-center rounded-sm opacity-70 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(opt._id)
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
                    ? "Loading stylists…"
                    : options.length === 0
                      ? "No stylists available"
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
                  remove(selectedOptions[selectedOptions.length - 1]!._id)
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
            className="max-h-48 overflow-y-auto py-1"
            role="listbox"
            aria-multiselectable={isMultiple}
            aria-label={label}
          >
            {loading ? (
              <li className="text-muted-foreground px-2.5 py-2 text-xs">
                Loading…
              </li>
            ) : filtered.length === 0 ? (
              <li className="text-muted-foreground px-2.5 py-2 text-xs">
                {options.length === 0
                  ? "No stylists available"
                  : "No stylists match"}
              </li>
            ) : (
              filtered.map((opt) => {
                const checked = selectedSet.has(opt._id)
                return (
                  <li key={opt._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={checked}
                      disabled={disabled}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(opt._id)}
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
                      <span className="min-w-0 flex-1 truncate">
                        {stylistLabel(opt)}
                      </span>
                    </button>
                  </li>
                )
              })
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
