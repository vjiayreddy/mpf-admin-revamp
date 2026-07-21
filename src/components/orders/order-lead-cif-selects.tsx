"use client"

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  GET_ALL_CIF_LIST,
  type CifListRow,
  type GetAllCifListData,
  type GetAllCifListVars,
} from "@/lib/apollo/queries/cif"
import {
  GET_ALL_LEADS,
  LEADS_PAGE_LIMIT,
  type GetAllLeadsData,
  type GetAllLeadsVars,
  type LeadListRow,
} from "@/lib/apollo/queries/leads"
import { cn } from "@/lib/utils"

export type OrderLeadOption = {
  _id: string
  leadId?: string | number | null
  firstName?: string | null
  lastName?: string | null
  linkedOrders?: Array<{ orderId?: string | null }> | null
}

export type OrderCifOption = {
  _id: string
  cifSerialNumber?: string | number | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
}

function leadLabel(lead: OrderLeadOption) {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim()
  const id = lead.leadId != null ? String(lead.leadId) : ""
  if (name && id) return `${name} · #${id}`
  if (id) return `Lead #${id}`
  return name || lead._id
}

function cifLabel(cif: OrderCifOption) {
  const name = [cif.firstName, cif.lastName].filter(Boolean).join(" ").trim()
  const id = cif.cifSerialNumber != null ? String(cif.cifSerialNumber) : ""
  if (name && id) return `${name} · CIF #${id}`
  if (id) return `CIF #${id}`
  return name || cif._id
}

function mergeById<T extends { _id: string }>(primary: T[], extra: T[]): T[] {
  const map = new Map<string, T>()
  for (const row of [...extra, ...primary]) {
    if (row?._id) map.set(row._id, row)
  }
  return Array.from(map.values())
}

type MultiSelectShellProps<T extends { _id: string }> = {
  id?: string
  label: string
  options: T[]
  value: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  emptyHint?: string
  searchPlaceholder?: string
  getLabel: (option: T) => string
  renderOptionMeta?: (option: T) => ReactNode
}

function MultiIdSelect<T extends { _id: string }>({
  id: idProp,
  label,
  options,
  value,
  onChange,
  loading,
  disabled,
  emptyHint = "No options available",
  searchPlaceholder = "Search…",
  getLabel,
  renderOptionMeta,
}: MultiSelectShellProps<T>) {
  const autoId = useId()
  const id = idProp ?? autoId
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedSet = useMemo(() => new Set(value), [value])
  const optionById = useMemo(() => {
    const map = new Map<string, T>()
    for (const opt of options) map.set(opt._id, opt)
    return map
  }, [options])

  const selectedOptions = useMemo(
    () =>
      value
        .map((sid) => optionById.get(sid))
        .filter((opt): opt is T => Boolean(opt)),
    [value, optionById]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => getLabel(opt).toLowerCase().includes(q))
  }, [options, query, getLabel])

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
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const toggle = (optionId: string) => {
    if (selectedSet.has(optionId)) {
      onChange(value.filter((v) => v !== optionId))
    } else {
      onChange([...value, optionId])
    }
  }

  const remove = (optionId: string) => {
    onChange(value.filter((v) => v !== optionId))
  }

  return (
    <div ref={rootRef} className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
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
          disabled && "pointer-events-none opacity-50"
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
                  {getLabel(opt)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${getLabel(opt)}`}
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
                    ? "Loading…"
                    : options.length === 0
                      ? emptyHint
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
            className="max-h-52 overflow-y-auto py-1"
            role="listbox"
            aria-multiselectable
            aria-label={label}
          >
            {loading ? (
              <li className="text-muted-foreground px-2.5 py-2 text-xs">
                Loading…
              </li>
            ) : filtered.length === 0 ? (
              <li className="text-muted-foreground px-2.5 py-2 text-xs">
                No matches
              </li>
            ) : (
              filtered.map((opt) => {
                const selected = selectedSet.has(opt._id)
                return (
                  <li key={opt._id} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={cn(
                        "hover:bg-accent flex w-full items-start gap-2 px-2.5 py-1.5 text-left text-sm",
                        selected && "bg-accent"
                      )}
                      onClick={() => toggle(opt._id)}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {getLabel(opt)}
                        </span>
                        {renderOptionMeta?.(opt)}
                      </span>
                      {selected ? (
                        <CheckIcon className="text-primary mt-0.5 size-3.5 shrink-0" />
                      ) : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export type OrderLeadsSelectProps = {
  userId?: string
  value: string[]
  onChange: (ids: string[]) => void
  /** Options already linked on the order (for chip labels before fetch). */
  seededOptions?: OrderLeadOption[]
  disabled?: boolean
}

export function OrderLeadsSelect({
  userId,
  value,
  onChange,
  seededOptions = [],
  disabled,
}: OrderLeadsSelectProps) {
  const [fetchLeads, { data, loading }] = useLazyQuery<
    GetAllLeadsData,
    GetAllLeadsVars
  >(GET_ALL_LEADS, {
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (!userId?.trim()) return
    void fetchLeads({
      variables: {
        page: 1,
        limit: LEADS_PAGE_LIMIT,
        params: { userId: userId.trim() },
      },
    })
  }, [userId, fetchLeads])

  const fetched = useMemo(
    () =>
      (data?.getAllLeads?.leads ?? [])
        .filter((l): l is LeadListRow & { _id: string } => Boolean(l?._id))
        .map(
          (l): OrderLeadOption => ({
            _id: l._id,
            leadId: l.leadId,
            firstName: l.firstName,
            lastName: l.lastName,
            linkedOrders: l.linkedOrders,
          })
        ),
    [data?.getAllLeads?.leads]
  )

  const options = useMemo(
    () => mergeById(fetched, seededOptions.filter((o) => o._id)),
    [fetched, seededOptions]
  )

  return (
    <MultiIdSelect
      id="order-leadIds"
      label="Leads"
      options={options}
      value={value}
      onChange={onChange}
      loading={loading}
      disabled={disabled || !userId?.trim()}
      emptyHint={
        userId?.trim() ? "No leads for this customer" : "Select a customer first"
      }
      searchPlaceholder="Search leads…"
      getLabel={leadLabel}
      renderOptionMeta={(opt) =>
        opt.linkedOrders && opt.linkedOrders.length > 0 ? (
          <span className="text-muted-foreground text-[11px]">
            Linked to {opt.linkedOrders.length} order
            {opt.linkedOrders.length === 1 ? "" : "s"}
          </span>
        ) : null
      }
    />
  )
}

export type OrderCifsSelectProps = {
  phoneSearchTerm?: string | null
  value: string[]
  onChange: (ids: string[]) => void
  seededOptions?: OrderCifOption[]
  disabled?: boolean
}

export function OrderCifsSelect({
  phoneSearchTerm,
  value,
  onChange,
  seededOptions = [],
  disabled,
}: OrderCifsSelectProps) {
  const [fetchCifs, { data, loading }] = useLazyQuery<
    GetAllCifListData,
    GetAllCifListVars
  >(GET_ALL_CIF_LIST, {
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    const term = phoneSearchTerm?.trim()
    if (!term) return
    void fetchCifs({
      variables: {
        page: 1,
        limit: 100,
        filter: { searchTerm: term },
      },
    })
  }, [phoneSearchTerm, fetchCifs])

  const fetched = useMemo(
    () =>
      (data?.getAllCustomerInformationList?.customers ?? [])
        .filter((c): c is CifListRow & { _id: string } => Boolean(c?._id))
        .map(
          (c): OrderCifOption => ({
            _id: c._id,
            cifSerialNumber: c.cifSerialNumber,
            firstName: c.firstName,
            lastName: c.lastName,
            phone: c.phone,
          })
        ),
    [data?.getAllCustomerInformationList?.customers]
  )

  const options = useMemo(
    () => mergeById(fetched, seededOptions.filter((o) => o._id)),
    [fetched, seededOptions]
  )

  return (
    <MultiIdSelect
      id="order-customerCifIds"
      label="CIF info"
      options={options}
      value={value}
      onChange={onChange}
      loading={loading}
      disabled={disabled || !phoneSearchTerm?.trim()}
      emptyHint={
        phoneSearchTerm?.trim()
          ? "No CIF records for this phone"
          : "Customer phone required"
      }
      searchPlaceholder="Search CIF…"
      getLabel={cifLabel}
      renderOptionMeta={(opt) =>
        opt.phone ? (
          <span className="text-muted-foreground text-[11px]">{opt.phone}</span>
        ) : null
      }
    />
  )
}
