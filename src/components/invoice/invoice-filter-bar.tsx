"use client"

import { useEffect, useState, type FormEvent } from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type InvoiceFilterBarProps = {
  searchInputValue: string
  loading?: boolean
  onSearchSubmit: (value: string) => void
  onClearSearch: () => void
}

export function InvoiceFilterBar({
  searchInputValue,
  loading,
  onSearchSubmit,
  onClearSearch,
}: InvoiceFilterBarProps) {
  const [draft, setDraft] = useState(searchInputValue)

  useEffect(() => {
    setDraft(searchInputValue)
  }, [searchInputValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchSubmit(draft)
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:p-4">
      <form
        onSubmit={submit}
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <div className="border-input flex min-w-0 flex-1 overflow-hidden rounded-lg border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search invoices…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search invoices"
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-9 shrink-0 sm:px-4"
          disabled={loading}
        >
          Search
        </Button>
        {searchInputValue ? (
          <Button
            type="button"
            variant="ghost"
            className="h-9 shrink-0"
            disabled={loading}
            onClick={() => {
              setDraft("")
              onClearSearch()
            }}
          >
            <XIcon className="size-4" />
            Clear
          </Button>
        ) : null}
      </form>
    </div>
  )
}
