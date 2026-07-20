"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { ProductRowActions } from "@/components/products/product-row-actions"
import { ProductsFilterBar } from "@/components/products/products-filter-bar"
import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Input } from "@/components/ui/input"
import { useProductsList } from "@/hooks/use-products-list"
import type { ProductListRow } from "@/lib/apollo/queries/products"
import { cn } from "@/lib/utils"

const STOREFRONT_BASE = "https://www.myperfectfit.in/shop"

function formatRupees(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—"
  return `Rs.${value}/-`
}

function ColorCell({
  color,
  name,
}: {
  color?: string | null
  name?: string | null
}) {
  if (!color && !name) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="inline-flex items-center gap-2">
      {color ? (
        <span
          className="inline-block size-3.5 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: `#${color.replace(/^#/, "")}` }}
          aria-hidden
        />
      ) : null}
      <span className="truncate text-sm">{name || "—"}</span>
    </span>
  )
}

type ProductIdCellParams = ICellRendererParams<ProductListRow> & {
  onOpenEdit?: (productId: string) => void
}

function ProductIdCell(params: ProductIdCellParams) {
  const row = params.data
  if (!row) return null
  return (
    <button
      type="button"
      className="text-primary cursor-pointer font-mono text-sm font-semibold hover:underline"
      onClick={(e) => {
        e.stopPropagation()
        if (row._id) params.onOpenEdit?.(row._id)
      }}
    >
      {row.pidSerial ?? row.pId ?? "—"}
    </button>
  )
}

function ProductImageCell(params: ICellRendererParams<ProductListRow>) {
  const src = params.data?.images?.[0]
  if (!src) {
    return <span className="text-muted-foreground text-xs">No image</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote product CDN URLs vary
    <img
      src={src}
      alt={params.data?.title || "Product"}
      className="size-10 rounded object-cover"
      loading="lazy"
    />
  )
}

function ProductNameCell(params: ICellRendererParams<ProductListRow>) {
  const row = params.data
  if (!row) return null
  const slug = row.name
  if (!slug) {
    return <span className="text-sm">{row.title || "—"}</span>
  }
  return (
    <a
      href={`${STOREFRONT_BASE}/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground hover:text-primary text-sm hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {row.title || slug}
    </a>
  )
}

function StatusCell(params: ICellRendererParams<ProductListRow>) {
  const value = params.data?.currentStatus
  if (!value) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        value === "PUBLISHED" || value === "PUBLISHED_WITH_SHOPIFY_SYNC"
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : value === "DRAFT"
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
            : "bg-muted text-foreground"
      )}
    >
      {value}
    </span>
  )
}

export function ProductsPageClient() {
  const {
    rows,
    totalCount,
    loading,
    error,
    page,
    pageSize,
    searchInputValue,
    status,
    internalBrand,
    brands,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery,
    setStatus,
    setInternalBrand,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
  } = useProductsList()

  const router = useRouter()
  const [pageQuickFilter, setPageQuickFilter] = useState("")
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)

  const openEdit = useCallback(
    (id: string) => {
      router.push(`/products/form?productId=${id}`)
    },
    [router]
  )

  const columnDefs = useMemo(
    () =>
      [
        {
          colId: "more",
          headerName: "More",
          width: 72,
          pinned: "left",
          sortable: false,
          filter: false,
          cellRenderer: (p: ICellRendererParams<ProductListRow>) =>
            p.data ? <ProductRowActions row={p.data} /> : null,
        },
        {
          colId: "pidSerial",
          headerName: "Product ID",
          minWidth: 110,
          pinned: "left",
          cellRenderer: ProductIdCell,
          cellRendererParams: {
            onOpenEdit: openEdit,
          },
        },
        {
          colId: "image",
          headerName: "Image",
          width: 90,
          sortable: false,
          filter: false,
          cellRenderer: ProductImageCell,
        },
        {
          field: "title",
          headerName: "Pro. Name",
          minWidth: 220,
          flex: 1,
          cellRenderer: ProductNameCell,
          tooltipValueGetter: (p) => p.data?.title || null,
        },
        {
          field: "sortOrder",
          headerName: "Sort Order",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            p.data?.sortOrder ?? "—",
        },
        {
          field: "currentStatus",
          headerName: "Status",
          minWidth: 140,
          cellRenderer: StatusCell,
        },
        {
          colId: "isAvailable",
          headerName: "Is Available",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            p.data?.isAvailable == null
              ? "—"
              : p.data.isAvailable
                ? "Yes"
                : "No",
        },
        {
          colId: "category",
          headerName: "Category",
          minWidth: 140,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            p.data?.category?.[0]?.name ?? "—",
        },
        {
          colId: "internalBrand",
          headerName: "Internal Brand",
          minWidth: 140,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            p.data?.internalBrand?.[0]?.title ||
            p.data?.internalBrand?.[0]?.name ||
            "—",
        },
        {
          colId: "discPrice",
          headerName: "Disc Price",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            formatRupees(p.data?.discPrice),
        },
        {
          colId: "price",
          headerName: "Price After Disc",
          minWidth: 140,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            formatRupees(p.data?.price),
        },
        {
          field: "qty",
          headerName: "Quantity",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            p.data?.qty ?? "—",
        },
        {
          colId: "primaryColor",
          headerName: "Primary Color",
          minWidth: 150,
          cellRenderer: (p: ICellRendererParams<ProductListRow>) => (
            <ColorCell
              color={p.data?.primaryColor?.[0]?.color}
              name={p.data?.primaryColor?.[0]?.colorname}
            />
          ),
        },
        {
          colId: "secondaryColor",
          headerName: "Secondary Color",
          minWidth: 150,
          cellRenderer: (p: ICellRendererParams<ProductListRow>) => (
            <ColorCell
              color={p.data?.secondaryColor?.[0]?.color}
              name={p.data?.secondaryColor?.[0]?.colorname}
            />
          ),
        },
        {
          colId: "brand",
          headerName: "Brand",
          minWidth: 130,
          valueGetter: (p: ValueGetterParams<ProductListRow>) =>
            p.data?.brand?.[0]?.name ?? "—",
        },
      ] as ColDef<ProductListRow>[],
    [openEdit]
  )

  const hasChips = activeFilters.length > 0
  const gridHeight = hasChips
    ? "h-[calc(100vh-24rem)]"
    : "h-[calc(100vh-20rem)]"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground text-sm">
          Search and filter the catalog, then open a product to edit.
          {totalCount > 0 ? (
            <span className="text-muted-foreground/80">
              {" "}
              · {totalCount.toLocaleString()} total
            </span>
          ) : null}
        </p>
      </div>

      <ProductsFilterBar
        searchInputValue={searchInputValue}
        status={status}
        internalBrand={internalBrand}
        brands={brands}
        activeFilters={activeFilters}
        advancedFilterCount={advancedFilterCount}
        loading={loading}
        onSearchSubmit={setSearchQuery}
        onStatusChange={setStatus}
        onInternalBrandChange={setInternalBrand}
        moreFiltersOpen={moreFiltersOpen}
        onMoreFiltersOpenChange={setMoreFiltersOpen}
        onApplyMoreFilters={applyMoreFilters}
        onClearMoreFilters={clearMoreFilters}
        onClearFilter={clearFilter}
        onClearAllFilters={clearAllFilters}
        searchParams={searchParams}
      />

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load products. Check your session and try again.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex items-center gap-2 border-b px-3 py-2">
          <ListFilterIcon className="text-muted-foreground size-4 shrink-0" />
          <Input
            value={pageQuickFilter}
            onChange={(e) => setPageQuickFilter(e.target.value)}
            placeholder="Filter this page…"
            className="bg-background h-8 max-w-sm"
            aria-label="Filter loaded rows on this page"
            disabled={loading}
          />
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Narrows the current page only — not a server search
          </span>
        </div>
        <DataGrid
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={(params) => params.data._id}
          quickFilterText={pageQuickFilter}
          heightClassName={gridHeight}
          persistKey="products"
          className="rounded-none border-0"
        />
        <DataGridPagination
          page={page}
          pageSize={pageSize}
          currentPageCount={rows.length}
          totalCount={totalCount}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>
    </div>
  )
}
