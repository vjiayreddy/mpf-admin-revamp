"use client"

import { Suspense, useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import { DownloadIcon, Loader2Icon, RefreshCwIcon } from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridPagination } from "@/components/data-grid/data-grid-pagination"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  NAIRA_MODEL_OPTIONS,
  NAIRA_PROVIDER_OPTIONS,
  NAIRA_SERVICE_OPTIONS,
} from "@/config/naira-pricing-filters"
import { useNairaPricing } from "@/hooks/use-naira-pricing"
import type { CostRecord, GcpCostRow } from "@/lib/naira/costing-types"
import {
  formatInr,
  formatNumber,
  formatTimestamp,
} from "@/lib/naira/format"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-background h-9 w-full min-w-[140px] rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

function NairaPricingInner() {
  const {
    tab,
    page,
    pageSize,
    provider,
    model,
    service,
    periodDays,
    records,
    pricingRows,
    recordsLoading,
    pricingLoading,
    exporting,
    error,
    clearError,
    setTab,
    setPage,
    setProvider,
    setModel,
    setService,
    setPeriodDays,
    refresh,
    exportData,
    periodOptions,
  } = useNairaPricing()

  const recordColumns = useMemo<ColDef<CostRecord>[]>(
    () => [
      {
        colId: "timestamp",
        headerName: "Timestamp",
        minWidth: 180,
        flex: 1.1,
        valueGetter: (p) => formatTimestamp(p.data?.timestamp),
      },
      {
        colId: "service",
        field: "service",
        headerName: "Service",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "model",
        field: "model",
        headerName: "Model",
        minWidth: 150,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "provider",
        field: "provider",
        headerName: "Provider",
        minWidth: 120,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "input_tokens",
        headerName: "Input Tokens",
        minWidth: 120,
        type: "rightAligned",
        valueGetter: (p) => formatNumber(p.data?.input_tokens),
      },
      {
        colId: "output_tokens",
        headerName: "Output Tokens",
        minWidth: 120,
        type: "rightAligned",
        valueGetter: (p) => formatNumber(p.data?.output_tokens),
      },
      {
        colId: "total_cost",
        headerName: "Total Cost",
        minWidth: 130,
        type: "rightAligned",
        valueGetter: (p) =>
          formatInr(p.data?.total_cost ?? p.data?.cost ?? 0),
      },
    ],
    []
  )

  const pricingColumns = useMemo<ColDef<GcpCostRow>[]>(
    () => [
      {
        colId: "group_key",
        field: "group_key",
        headerName: "Date",
        minWidth: 140,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "service",
        field: "service",
        headerName: "Service",
        minWidth: 140,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        colId: "record_count",
        headerName: "Record Count",
        minWidth: 130,
        type: "rightAligned",
        valueGetter: (p) => formatNumber(p.data?.record_count),
      },
      {
        colId: "total_cost",
        headerName: "Total Cost",
        minWidth: 140,
        type: "rightAligned",
        valueGetter: (p) => formatInr(p.data?.total_cost),
      },
    ],
    []
  )

  const loading = tab === "records" ? recordsLoading : pricingLoading

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Costing Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor and analyze AI service costs and usage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || exporting}
            onClick={refresh}
          >
            {loading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={() => void exportData("csv")}
          >
            <DownloadIcon className="size-4" />
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={() => void exportData("json")}
          >
            <DownloadIcon className="size-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {error ? (
        <div
          className="border-destructive/30 bg-destructive/10 text-destructive flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          <p>{error}</p>
          <Button type="button" variant="ghost" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted/30 flex gap-1 border-b p-1">
          <Button
            type="button"
            size="sm"
            variant={tab === "records" ? "secondary" : "ghost"}
            className="flex-1 sm:flex-none"
            onClick={() => setTab("records")}
          >
            Records
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "pricing" ? "secondary" : "ghost"}
            className="flex-1 sm:flex-none"
            onClick={() => setTab("pricing")}
          >
            Pricing
          </Button>
        </div>

        {tab === "records" ? (
          <div className="flex flex-col gap-3 p-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex min-w-[140px] flex-col gap-1.5">
                <Label htmlFor="naira-provider">Provider</Label>
                <select
                  id="naira-provider"
                  className={selectClass}
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="">All providers</option>
                  {NAIRA_PROVIDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex min-w-[160px] flex-col gap-1.5">
                <Label htmlFor="naira-model">Model</Label>
                <select
                  id="naira-model"
                  className={selectClass}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="">All models</option>
                  {NAIRA_MODEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex min-w-[150px] flex-col gap-1.5">
                <Label htmlFor="naira-service">Service</Label>
                <select
                  id="naira-service"
                  className={selectClass}
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="">All services</option>
                  {NAIRA_SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DataGrid<CostRecord>
              rowData={records}
              columnDefs={recordColumns}
              loading={recordsLoading}
              getRowId={(params) => {
                const d = params.data
                if (d.id) return String(d.id)
                return [
                  d.timestamp ?? "",
                  d.provider ?? "",
                  d.model ?? "",
                  d.service ?? "",
                  d.input_tokens ?? 0,
                  d.output_tokens ?? 0,
                  d.total_cost ?? d.cost ?? 0,
                ].join("|")
              }}
              heightClassName="h-[min(60vh,520px)]"
              className="rounded-lg"
            />
            <DataGridPagination
              page={page}
              pageSize={pageSize}
              currentPageCount={records.length}
              onPageChange={setPage}
              disabled={recordsLoading}
            />
            {!recordsLoading && records.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No records found for the selected filters.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold">GCP Cost Analysis</h2>
                <p className="text-muted-foreground text-xs">
                  Daily GCP costs for the last {periodDays} days
                </p>
              </div>
              <div className="flex min-w-[160px] flex-col gap-1.5">
                <Label htmlFor="naira-period">Period</Label>
                <select
                  id="naira-period"
                  className={selectClass}
                  value={periodDays}
                  onChange={(e) => setPeriodDays(Number(e.target.value))}
                >
                  {periodOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DataGrid<GcpCostRow>
              rowData={pricingRows}
              columnDefs={pricingColumns}
              loading={pricingLoading}
              getRowId={(params) =>
                `${params.data.group_key ?? ""}-${params.data.service ?? ""}`
              }
              heightClassName="h-[min(60vh,520px)]"
              className="rounded-lg"
            />
            {!pricingLoading && pricingRows.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No model cost data available for the selected period.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export function NairaPricingPageClient() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground p-4 text-sm">
          Loading costing dashboard…
        </div>
      }
    >
      <NairaPricingInner />
    </Suspense>
  )
}
