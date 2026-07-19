export type CostProvider = "gemini" | "openai" | string
export type CostService =
  | "chat"
  | "recommendations"
  | "tryon"
  | "detection"
  | "context_manager"
  | "vector_search"
  | "trend_research"
  | string

export type CostRecord = {
  id?: string | null
  timestamp?: string | null
  provider?: CostProvider | null
  model?: string | null
  service?: CostService | null
  input_tokens?: number | null
  output_tokens?: number | null
  total_tokens?: number | null
  total_cost?: number | null
  cost?: number | null
}

export type GcpCostRow = {
  group_key?: string | null
  service?: string | null
  record_count?: number | null
  total_cost?: number | null
}

export type CostRecordsParams = {
  provider?: string
  model?: string
  service?: string
  limit?: number
  skip?: number
}

export type GcpCostsParams = {
  days?: number
  group_by?: "day" | "model" | "service"
}

export type ExportParams = {
  days?: number
  format?: "json" | "csv"
}

export type ExportResult = {
  format: string
  data: string | unknown
  record_count?: number
}

export type CostRecordsResponse = {
  records: CostRecord[]
}

export type GcpCostsResponse = {
  rows: GcpCostRow[]
  days: number
}
