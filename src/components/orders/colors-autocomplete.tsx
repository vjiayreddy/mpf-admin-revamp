"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAllSecondaryColors } from "@/hooks/use-all-secondary-colors"
import type { SecondaryColor } from "@/lib/apollo/queries/colors"
import { cn } from "@/lib/utils"

function colorHex(color?: string | null) {
  const raw = color?.trim().replace(/^#/, "") || ""
  if (!raw || !/^[0-9a-fA-F]{3,8}$/.test(raw)) return null
  return `#${raw}`
}

function ColorSwatch({ color }: { color?: string | null }) {
  const hex = colorHex(color)
  return (
    <span
      aria-hidden
      className="border-border size-4 shrink-0 rounded-sm border"
      style={hex ? { backgroundColor: hex } : undefined}
    />
  )
}

export type ColorsAutocompleteProps = {
  value: string
  onChange: (colorname: string) => void
  disabled?: boolean
  id?: string
  placeholder?: string
  error?: string
  /** Hide the outer label when the parent Field already labels the control. */
  hideLabel?: boolean
  label?: string
}

/**
 * Secondary-color picker matching legacy AsyncColorsAutocomplete.
 * Value is the colorname string stored on order items.
 * Dropdown overlays the form (absolute) so it does not stretch the grid.
 */
export function ColorsAutocomplete({
  value,
  onChange,
  disabled,
  id: idProp,
  placeholder = "Search color…",
  error,
  hideLabel = false,
  label = "Color",
}: ColorsAutocompleteProps) {
  const { colors, colorByName, loading } = useAllSecondaryColors()
  const autoId = useId()
  const id = idProp ?? autoId
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = useMemo(() => {
    const key = value.trim().toLowerCase()
    if (!key) return null
    return colorByName.get(key) ?? null
  }, [value, colorByName])

  const displayName = selected?.colorname?.trim() || value.trim() || ""

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return colors
    return colors.filter((c) => {
      const haystack = [c.colorname, c.label, c.color]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [colors, query])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

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

  const openDropdown = () => {
    if (disabled || loading) return
    setOpen(true)
  }

  const selectColor = (color: SecondaryColor) => {
    const name = color.colorname?.trim() || ""
    onChange(name)
    setOpen(false)
    setQuery("")
  }

  const clear = () => {
    onChange("")
    setQuery("")
  }

  return (
    <div ref={rootRef} className="relative flex w-full min-w-0 flex-col gap-1.5">
      {!hideLabel ? (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="text-xs font-medium">
            {label}
          </label>
          {displayName ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={disabled}
              onClick={clear}
            >
              Clear
            </Button>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "border-input bg-background flex h-9 w-full items-center gap-1.5 rounded-lg border px-2",
          error && "border-destructive",
          disabled && "pointer-events-none opacity-50"
        )}
        onClick={openDropdown}
      >
        {!open && displayName ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <ColorSwatch color={selected?.color} />
            <span className="truncate text-sm">{displayName}</span>
          </span>
        ) : (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            disabled={disabled || loading}
            placeholder={
              loading
                ? "Loading colors…"
                : colors.length === 0
                  ? "No colors available"
                  : placeholder
            }
            className="placeholder:text-muted-foreground h-7 min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
          />
        )}
        {displayName && !disabled ? (
          <button
            type="button"
            aria-label="Clear color"
            className="text-muted-foreground hover:bg-muted inline-flex size-7 shrink-0 items-center justify-center rounded-md"
            onClick={(e) => {
              e.stopPropagation()
              clear()
            }}
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || loading}
          aria-label={open ? "Close options" : "Open options"}
          className="text-muted-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-md disabled:opacity-50"
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
          className="bg-popover text-popover-foreground absolute top-[calc(100%+0.25rem)] right-0 left-0 z-50 max-h-48 overflow-y-auto rounded-lg border py-1 shadow-md"
          role="listbox"
          aria-label={label}
        >
          {loading ? (
            <li className="text-muted-foreground px-2.5 py-2 text-xs">
              Loading…
            </li>
          ) : filtered.length === 0 ? (
            <li className="text-muted-foreground px-2.5 py-2 text-xs">
              No colors match
            </li>
          ) : (
            filtered.map((color) => {
              const name = color.colorname?.trim() || ""
              const isSelected =
                name.toLowerCase() === value.trim().toLowerCase()
              return (
                <li key={color._id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      "hover:bg-accent flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => selectColor(color)}
                  >
                    <ColorSwatch color={color.color} />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    {isSelected ? (
                      <CheckIcon className="text-primary size-3.5 shrink-0" />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
