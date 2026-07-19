export const NAIRA_PRICING_PAGE_LIMIT = 50

export const NAIRA_PRICING_PARAMS = {
  tab: "tab",
  page: "page",
  provider: "provider",
  model: "model",
  service: "service",
  periodDays: "periodDays",
} as const

export type NairaPricingTab = "records" | "pricing"

export const NAIRA_PROVIDER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Gemini", value: "gemini" },
  { label: "OpenAI", value: "openai" },
]

export const NAIRA_MODEL_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
]

export const NAIRA_SERVICE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Chat", value: "chat" },
  { label: "Recommendations", value: "recommendations" },
  { label: "Try-on", value: "tryon" },
  { label: "Detection", value: "detection" },
]

export const NAIRA_PERIOD_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 60 days", value: 60 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 180 days", value: 180 },
  { label: "Last 365 days", value: 365 },
]

export function parseNairaTab(value: string | null): NairaPricingTab {
  return value === "pricing" ? "pricing" : "records"
}
