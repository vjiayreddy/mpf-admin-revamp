"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, SearchIcon, XIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import type { StudioOption } from "@/lib/apollo/queries/studios"
import { cn } from "@/lib/utils"

type StudioMultiSelectProps = {
  label: string
  studios: StudioOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
}

function studioLabel(studio: StudioOption) {
  const name = studio.name?.trim() || "Untitled studio"
  const city = studio.city?.trim()
  return city ? `${name} · ${city}` : name
}

export function StudioMultiSelect({
  label,
  studios,
  selectedIds,
  onChange,
  loading,
  disabled,
}: StudioMultiSelectProps) {
  const id = useId()
  const [query, setQuery] = useState("")

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return studios
    return studios.filter((studio) => {
      const haystack = [
        studio.name,
        studio.city,
        studio.code,
        studio._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [studios, query])

  const selectedStudios = useMemo(
    () => studios.filter((s) => selectedSet.has(s._id)),
    [studios, selectedSet]
  )

  const toggle = (studioId: string) => {
    if (selectedSet.has(studioId)) {
      onChange(selectedIds.filter((id) => id !== studioId))
      return
    }
    onChange([...selectedIds, studioId])
  }

  const remove = (studioId: string) => {
    onChange(selectedIds.filter((id) => id !== studioId))
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {label}
        {selectedIds.length > 0 ? (
          <span className="text-foreground ml-1 font-medium">
            ({selectedIds.length})
          </span>
        ) : null}
      </Label>

      {selectedStudios.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedStudios.map((studio) => (
            <button
              key={studio._id}
              type="button"
              disabled={disabled}
              onClick={() => remove(studio._id)}
              className="bg-muted hover:bg-muted/80 inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
              title="Remove studio"
            >
              <span className="truncate">{studio.name || studio._id}</span>
              <XIcon className="size-3 shrink-0 opacity-70" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="border-input overflow-hidden rounded-lg border">
        <div className="relative border-b">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <input
            id={id}
            type="search"
            value={query}
            disabled={disabled || loading}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={loading ? "Loading studios…" : "Search studios…"}
            className="h-8 w-full bg-transparent pr-2.5 pl-8 text-sm outline-none disabled:opacity-50"
          />
        </div>
        <ul
          className="max-h-40 overflow-y-auto py-1"
          role="listbox"
          aria-multiselectable
          aria-label={label}
        >
          {filtered.length === 0 ? (
            <li className="text-muted-foreground px-2.5 py-2 text-xs">
              {loading ? "Loading…" : "No studios match"}
            </li>
          ) : (
            filtered.map((studio) => {
              const checked = selectedSet.has(studio._id)
              return (
                <li key={studio._id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    disabled={disabled}
                    onClick={() => toggle(studio._id)}
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
                    <span className="min-w-0 truncate">
                      {studioLabel(studio)}
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
