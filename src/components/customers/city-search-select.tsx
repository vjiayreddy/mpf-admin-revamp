"use client"

import { useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GET_CITIES_BY_SEARCH,
  type CityOption,
  type GetCitiesBySearchData,
  type GetCitiesBySearchVars,
} from "@/lib/apollo/queries/cities"
import { cn } from "@/lib/utils"

type CitySearchSelectProps = {
  label?: string
  valueLabel?: string
  onSelect: (city: CityOption) => void
  disabled?: boolean
}

export function CitySearchSelect({
  label = "City",
  valueLabel,
  onSelect,
  disabled,
}: CitySearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const [searchCities, { data, loading }] = useLazyQuery<
    GetCitiesBySearchData,
    GetCitiesBySearchVars
  >(GET_CITIES_BY_SEARCH)

  useEffect(() => {
    if (!open) return
    const term = search.trim()
    if (term.length < 2) return
    const timer = window.setTimeout(() => {
      void searchCities({ variables: { searchTerm: term } })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [open, search, searchCities])

  const cities = useMemo(
    () => data?.getCityBySearchTerm ?? [],
    [data?.getCityBySearchTerm]
  )

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label ? (
        <Label className="text-muted-foreground text-xs font-normal">
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
          disabled={disabled}
          className={cn(
            "border-input flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-2.5 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="truncate text-left">
            {valueLabel || "Search city…"}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--anchor-width)] min-w-[260px] p-0" align="start">
          <div className="border-b p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type at least 2 characters…"
              className="h-8"
              autoFocus
            />
          </div>
          <ScrollArea className="h-52">
            <div className="p-1">
              {search.trim().length < 2 ? (
                <p className="text-muted-foreground px-2 py-3 text-sm">
                  Start typing to search cities.
                </p>
              ) : loading ? (
                <p className="text-muted-foreground px-2 py-3 text-sm">
                  Searching…
                </p>
              ) : cities.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-sm">
                  No cities found.
                </p>
              ) : (
                cities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                    onClick={() => {
                      onSelect(city)
                      setOpen(false)
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate text-left">
                      {[city.name, city.stateTitle, city.countryTitle]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    <CheckIcon className="size-3.5 shrink-0 opacity-0" />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
