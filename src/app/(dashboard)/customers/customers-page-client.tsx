"use client"

import { useMemo, useState, useEffect, type FormEvent, type KeyboardEvent } from "react"
import type { ColDef, ICellRendererParams, ValueGetterParams } from "ag-grid-community"
import { SearchIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomersList } from "@/hooks/use-customers-list"
import type { CustomerListRow } from "@/lib/apollo/queries/users"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function CustomerNameCell({ data }: ICellRendererParams<CustomerListRow>) {
  if (!data) return null
  const name =
    `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
    data.fullName ||
    "—"
  return <span className="font-medium">{name}</span>
}

function StatusCell({ value }: ICellRendererParams<CustomerListRow, string>) {
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="bg-muted inline-flex rounded-md px-2 py-0.5 text-xs capitalize">
      {value}
    </span>
  )
}

export function CustomersPageClient() {
  const {
    rows,
    loading,
    error,
    page,
    pageSize,
    searchTerm,
    setPage,
    setSearchTerm,
  } = useCustomersList()

  const [draftSearch, setDraftSearch] = useState(searchTerm)

  useEffect(() => {
    setDraftSearch(searchTerm)
  }, [searchTerm])

  const columnDefs = useMemo<ColDef<CustomerListRow>[]>(
    () => [
      {
        field: "fullName",
        headerName: "Customer",
        minWidth: 180,
        cellRenderer: CustomerNameCell,
        valueGetter: (p: ValueGetterParams<CustomerListRow>) =>
          `${p.data?.firstName ?? ""} ${p.data?.lastName ?? ""}`.trim() ||
          p.data?.fullName ||
          "",
      },
      {
        field: "customerSrNo",
        headerName: "Cus. No",
        minWidth: 90,
        maxWidth: 110,
      },
      {
        colId: "registeredDate",
        headerName: "Registered",
        minWidth: 120,
        valueGetter: (p) => formatDate(p.data?.createdAt),
      },
      {
        colId: "phone",
        headerName: "Phone",
        minWidth: 150,
        valueGetter: (p) => {
          if (!p.data?.phone) return "—"
          return `+${p.data.countryCode ?? ""} ${p.data.phone}`.trim()
        },
      },
      {
        colId: "stylist",
        headerName: "Stylist",
        minWidth: 140,
        valueGetter: (p) => p.data?.stylist?.[0]?.name ?? "—",
      },
      {
        colId: "ccDueDate",
        headerName: "CC Due",
        minWidth: 120,
        valueGetter: (p) => formatDate(p.data?.ccDueDate?.timestamp),
      },
      {
        field: "userStatus",
        headerName: "Status",
        minWidth: 120,
        cellRenderer: StatusCell,
      },
      {
        colId: "studios",
        headerName: "Primary Studio",
        minWidth: 150,
        valueGetter: (p) =>
          p.data?.studios
            ?.map((s) => s?.name)
            .filter(Boolean)
            .join(", ") || "—",
      },
      {
        colId: "secondaryStudios",
        headerName: "Secondary Studio",
        minWidth: 160,
        valueGetter: (p) => {
          const primaryId = p.data?.studioId
          return (
            p.data?.secondaryStudios
              ?.filter((s) => s?._id !== primaryId)
              .map((s) => s?.name)
              .filter(Boolean)
              .join(", ") || "—"
          )
        },
      },
      {
        field: "customerType",
        headerName: "Type",
        minWidth: 120,
        cellRenderer: StatusCell,
      },
      {
        colId: "lastUpdatedAt",
        headerName: "Last Updated",
        minWidth: 120,
        valueGetter: (p) => formatDate(p.data?.lastUpdatedAt?.timestamp),
      },
    ],
    []
  )

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSearchTerm(draftSearch)
  }

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      setSearchTerm(draftSearch)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Customer directory — search and paginate against the live MPF API.
        </p>
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search customers…"
            className="pl-8"
            aria-label="Search customers"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load customers. Check your session and try again.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <DataGrid
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={(params) => params.data._id}
          heightClassName="h-[calc(100vh-16rem)]"
          className="rounded-none border-0"
        />
        <DataGridPagination
          page={page}
          pageSize={pageSize}
          currentPageCount={rows.length}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>
    </div>
  )
}
