import {
  normalizeList,
  readPeriodDays,
} from "@/lib/naira/normalize"
import type {
  CostRecord,
  CostRecordsParams,
  CostRecordsResponse,
  ExportParams,
  ExportResult,
  GcpCostRow,
  GcpCostsParams,
  GcpCostsResponse,
} from "@/lib/naira/costing-types"

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null
  if (!response.ok) {
    throw new Error(
      body && typeof body === "object" && "error" in body && body.error
        ? String(body.error)
        : `Request failed (${response.status})`
    )
  }
  return body as T
}

function toQuery(params?: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams()
  if (!params) return ""
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ""
}

export async function fetchCostRecords(
  params: CostRecordsParams,
  signal?: AbortSignal
): Promise<CostRecordsResponse> {
  const response = await fetch(
    `/api/naira/costs/records${toQuery(params)}`,
    { method: "GET", signal, cache: "no-store" }
  )
  const payload = await readJson<unknown>(response)
  return { records: normalizeList<CostRecord>(payload) }
}

export async function fetchGcpCosts(
  params: GcpCostsParams,
  signal?: AbortSignal
): Promise<GcpCostsResponse> {
  const response = await fetch(
    `/api/naira/costs/gcp-costs${toQuery({
      days: params.days,
      group_by: params.group_by ?? "day",
    })}`,
    { method: "GET", signal, cache: "no-store" }
  )
  const payload = await readJson<unknown>(response)
  return {
    rows: normalizeList<GcpCostRow>(payload),
    days: readPeriodDays(payload, params.days ?? 30),
  }
}

export async function exportCostData(
  params: ExportParams,
  signal?: AbortSignal
): Promise<ExportResult> {
  const response = await fetch(
    `/api/naira/costs/export${toQuery({
      days: params.days ?? 30,
      format: params.format ?? "json",
    })}`,
    { method: "GET", signal, cache: "no-store" }
  )
  const payload = await readJson<ExportResult>(response)
  return {
    format: payload.format || params.format || "json",
    data: payload.data,
    record_count: payload.record_count,
  }
}

export function downloadExport(result: ExportResult, format: "csv" | "json") {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  if (format === "csv") {
    const text =
      typeof result.data === "string"
        ? result.data
        : String(result.data ?? "")
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" })
    triggerDownload(blob, `cost-report-${stamp}.csv`)
    return
  }
  const json =
    typeof result.data === "string"
      ? result.data
      : JSON.stringify(result.data ?? result, null, 2)
  const blob = new Blob([json], { type: "application/json;charset=utf-8" })
  triggerDownload(blob, `cost-report-${stamp}.json`)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
