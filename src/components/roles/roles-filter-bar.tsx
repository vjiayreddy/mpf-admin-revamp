"use client"

import { useEffect, useId, useState, type FormEvent } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RolesFilterBarProps = {
  searchValue: string
  loading?: boolean
  onSearchChange: (value: string) => void
  onAddRole: () => void
}

export function RolesFilterBar({
  searchValue,
  loading,
  onSearchChange,
  onAddRole,
}: RolesFilterBarProps) {
  const searchId = useId()
  const [draft, setDraft] = useState(searchValue)

  useEffect(() => {
    setDraft(searchValue)
  }, [searchValue])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearchChange(draft.trim())
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
              id={searchId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search roles…"
              className="h-9 rounded-none border-0 pl-8 shadow-none focus-visible:ring-0"
              aria-label="Search roles"
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
        <Button
          type="button"
          className="h-9 shrink-0 sm:px-4"
          onClick={onAddRole}
          disabled={loading}
        >
          <PlusIcon className="size-4" />
          Add Role
        </Button>
      </form>
    </div>
  )
}
