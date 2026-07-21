"use client"

import { useId, useMemo, useState } from "react"
import { CheckIcon, SearchIcon, XIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type FilterMultiOption = {
  id: string
  label: string
}

type FilterIdMultiSelectProps = {
  label: string
  options: FilterMultiOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  searchPlaceholder?: string
  emptyLabel?: string
}

export function FilterIdMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  loading,
  disabled,
  searchPlaceholder = "Search…",
  emptyLabel = "No matches",
}: FilterIdMultiSelectProps) {
  const id = useId()
  const [query, setQuery] = useState("")

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => {
      const haystack = `${opt.label} ${opt.id}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [options, query])

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedSet.has(o.id)),
    [options, selectedSet]
  )

  const toggle = (optionId: string) => {
    if (selectedSet.has(optionId)) {
      onChange(selectedIds.filter((x) => x !== optionId))
      return
    }
    onChange([...selectedIds, optionId])
  }

  const remove = (optionId: string) => {
    onChange(selectedIds.filter((x) => x !== optionId))
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

      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => remove(opt.id)}
              className="bg-muted hover:bg-muted/80 inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
              title={`Remove ${opt.label}`}
            >
              <span className="truncate">{opt.label}</span>
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
            placeholder={loading ? "Loading…" : searchPlaceholder}
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
              {loading ? "Loading…" : emptyLabel}
            </li>
          ) : (
            filtered.map((opt) => {
              const checked = selectedSet.has(opt.id)
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    disabled={disabled}
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
                      {checked ? <CheckIcon className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 truncate">{opt.label}</span>
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
