"use client"

import { useLazyQuery } from "@apollo/client/react"
import { Loader2Icon, SearchIcon, UserPlusIcon, XIcon } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  GET_USERS_BY_FILTER,
  type GetUsersByFilterData,
  type GetUsersByFilterVars,
  type UserListItem,
} from "@/lib/apollo/queries/users"
import { cn } from "@/lib/utils"

type Props = {
  label?: string
  valueLabel?: string
  onSelect: (user: UserListItem) => void
  /** Called with the current search text so register can prefill phone/email. */
  onCreateNew?: (searchQuery: string) => void
  className?: string
  /** Auto-focus the search field (useful on the create-order gate). */
  autoFocus?: boolean
}

function displayName(row: UserListItem) {
  const name =
    row.fullName?.trim() ||
    [row.firstName, row.lastName].filter(Boolean).join(" ").trim()
  return name || "Unnamed"
}

function initials(row: UserListItem) {
  const name = displayName(row)
  if (name === "Unnamed") return "?"
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function customerBadge(row: UserListItem) {
  if (row.customerSrNo != null) return `#${row.customerSrNo}`
  return null
}

/**
 * Always-visible customer search (legacy UserSearch-style).
 * Types into the field → debounced getUsersByFilter → pick a result.
 */
export function CustomerSearchSelect({
  label = "Customer",
  valueLabel,
  onSelect,
  onCreateNew,
  className,
  autoFocus = false,
}: Props) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const [fetchUsers, { data, loading, error }] = useLazyQuery<
    GetUsersByFilterData,
    GetUsersByFilterVars
  >(GET_USERS_BY_FILTER, { fetchPolicy: "network-only" })

  useEffect(() => {
    const next = query.trim()
    const t = window.setTimeout(() => setDebounced(next), 350)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (debounced.length < 2) return
    void fetchUsers({
      variables: {
        page: 0,
        limit: 25,
        filter: {
          searchTerm: debounced,
          isClient: true,
          sortByEnum: "REGISTERED_DATE",
        },
      },
    })
  }, [debounced, fetchUsers])

  useEffect(() => {
    if (!autoFocus) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [autoFocus])

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown)
    return () => document.removeEventListener("pointerdown", onDocPointerDown)
  }, [])

  const rows = useMemo(() => data?.getUsersByFilter ?? [], [data])
  const showResults = open && query.trim().length >= 2

  function pick(row: UserListItem) {
    onSelect(row)
    setQuery("")
    setOpen(false)
    setActiveIndex(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showResults || rows.length === 0) {
      if (e.key === "Escape") {
        setOpen(false)
        setActiveIndex(-1)
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % rows.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? rows.length - 1 : i - 1))
    } else if (e.key === "Enter" && activeIndex >= 0 && rows[activeIndex]) {
      e.preventDefault()
      pick(rows[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={rootRef} className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={`${listId}-input`} className="text-xs font-medium">
          {label}
        </Label>
      ) : null}

      {valueLabel ? (
        <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              Selected
            </p>
            <p className="truncate text-sm font-medium">{valueLabel}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
              setOpen(true)
            }}
          >
            Change
          </Button>
        </div>
      ) : null}

      {/* Input + results share one relative box so the list sits flush under the field */}
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          id={`${listId}-input`}
          value={query}
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          placeholder="Search by name, phone, or email…"
          className="h-11 pr-9 pl-9 text-sm"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={onKeyDown}
        />
        {query ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 z-10 -translate-y-1/2 rounded-md p-1"
            aria-label="Clear search"
            onClick={() => {
              setQuery("")
              setOpen(false)
              inputRef.current?.focus()
            }}
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}

        {showResults ? (
          <div
            id={listId}
            role="listbox"
            className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border shadow-md"
          >
            {loading ? (
              <div className="text-muted-foreground flex items-center gap-2 px-3 py-3 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Searching customers…
              </div>
            ) : null}

            {!loading && error ? (
              <div className="space-y-2 px-3 py-3 text-sm">
                <p className="text-destructive">Couldn’t load customers.</p>
                <p className="text-muted-foreground text-xs">
                  {error.message || "Check your connection and try again."}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void fetchUsers({
                      variables: {
                        page: 0,
                        limit: 25,
                        filter: {
                          searchTerm: debounced,
                          isClient: true,
                          sortByEnum: "REGISTERED_DATE",
                        },
                      },
                    })
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            {!loading && !error && rows.length === 0 ? (
              <div className="space-y-3 px-3 py-3 text-sm">
                <p className="text-muted-foreground">
                  No customers match “{query.trim()}”.
                </p>
                {onCreateNew ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onCreateNew(query.trim())}
                  >
                    <UserPlusIcon className="size-3.5" />
                    Register new customer
                  </Button>
                ) : null}
              </div>
            ) : null}

            {!loading && !error
              ? rows.map((row, index) => {
                  const badge = customerBadge(row)
                  const phone =
                    row.phone != null
                      ? `+${row.countryCode || ""}${row.phone}`
                      : null
                  const profile = row.images?.profile?.trim() || undefined
                  return (
                    <button
                      key={row._id}
                      id={`${listId}-opt-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={cn(
                        "hover:bg-accent flex w-full items-center gap-3 border-b px-3 py-2 text-left text-sm last:border-b-0",
                        index === activeIndex && "bg-accent"
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(row)}
                    >
                      <Avatar className="size-9 shrink-0">
                        {profile ? (
                          <AvatarImage src={profile} alt={displayName(row)} />
                        ) : null}
                        <AvatarFallback className="text-xs font-medium">
                          {initials(row)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {displayName(row)}
                          {badge ? (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              · {badge}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {[phone, row.email].filter(Boolean).join(" · ") ||
                            "No contact on file"}
                        </span>
                      </span>
                    </button>
                  )
                })
              : null}
          </div>
        ) : null}
      </div>

      <p className="text-muted-foreground text-xs">
        {query.trim().length > 0 && query.trim().length < 2
          ? "Type at least 2 characters to search."
          : "Results update as you type."}
      </p>

      {onCreateNew ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => onCreateNew(query.trim())}
        >
          <UserPlusIcon className="size-4" />
          Register new customer
        </Button>
      ) : null}
    </div>
  )
}
