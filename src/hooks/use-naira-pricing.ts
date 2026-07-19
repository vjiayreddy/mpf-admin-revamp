"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  NAIRA_PERIOD_OPTIONS,
  NAIRA_PRICING_PAGE_LIMIT,
  NAIRA_PRICING_PARAMS,
  parseNairaTab,
  type NairaPricingTab,
} from "@/config/naira-pricing-filters"
import {
  downloadExport,
  exportCostData,
  fetchCostRecords,
  fetchGcpCosts,
} from "@/lib/naira/costing-api"
import type { CostRecord, GcpCostRow } from "@/lib/naira/costing-types"
import { authClient } from "@/lib/auth-client"

export function useNairaPricing() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()
  const tab = parseNairaTab(searchParams.get(NAIRA_PRICING_PARAMS.tab))
  const pageParam = searchParams.get(NAIRA_PRICING_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const provider = searchParams.get(NAIRA_PRICING_PARAMS.provider) ?? ""
  const model = searchParams.get(NAIRA_PRICING_PARAMS.model) ?? ""
  const service = searchParams.get(NAIRA_PRICING_PARAMS.service) ?? ""
  const periodRaw = searchParams.get(NAIRA_PRICING_PARAMS.periodDays)
  const periodDaysParsed = periodRaw ? Number(periodRaw) : 30
  const periodDays = NAIRA_PERIOD_OPTIONS.some((o) => o.value === periodDaysParsed)
    ? periodDaysParsed
    : 30

  const [records, setRecords] = useState<CostRecord[]>([])
  const [pricingRows, setPricingRows] = useState<GcpCostRow[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recordsSeq = useRef(0)
  const pricingSeq = useRef(0)
  const recordsAbort = useRef<AbortController | null>(null)
  const pricingAbort = useRef<AbortController | null>(null)

  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key)
        else params.set(key, value)
      }
      if (resetPage) params.set(NAIRA_PRICING_PARAMS.page, "0")
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [NAIRA_PRICING_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  const loadRecords = useCallback(async () => {
    if (!session?.user) return
    if (!Number.isInteger(page) || page < 0) return

    recordsAbort.current?.abort()
    const controller = new AbortController()
    recordsAbort.current = controller
    const seq = ++recordsSeq.current

    setRecordsLoading(true)
    setError(null)
    try {
      const result = await fetchCostRecords(
        {
          provider: provider || undefined,
          model: model || undefined,
          service: service || undefined,
          limit: NAIRA_PRICING_PAGE_LIMIT,
          skip: page * NAIRA_PRICING_PAGE_LIMIT,
        },
        controller.signal
      )
      if (seq !== recordsSeq.current) return
      setRecords(result.records)
    } catch (err) {
      if (controller.signal.aborted) return
      if (seq !== recordsSeq.current) return
      setRecords([])
      setError(err instanceof Error ? err.message : "Failed to load records")
    } finally {
      if (seq === recordsSeq.current) setRecordsLoading(false)
    }
  }, [session?.user, page, provider, model, service])

  const loadPricing = useCallback(async () => {
    if (!session?.user) return

    pricingAbort.current?.abort()
    const controller = new AbortController()
    pricingAbort.current = controller
    const seq = ++pricingSeq.current

    setPricingLoading(true)
    setError(null)
    try {
      const result = await fetchGcpCosts(
        { days: periodDays, group_by: "day" },
        controller.signal
      )
      if (seq !== pricingSeq.current) return
      setPricingRows(result.rows)
    } catch (err) {
      if (controller.signal.aborted) return
      if (seq !== pricingSeq.current) return
      setPricingRows([])
      setError(err instanceof Error ? err.message : "Failed to load pricing")
    } finally {
      if (seq === pricingSeq.current) setPricingLoading(false)
    }
  }, [session?.user, periodDays])

  useEffect(() => {
    if (tab !== "records") return
    void loadRecords()
  }, [tab, loadRecords, paramsKey])

  useEffect(() => {
    if (tab !== "pricing") return
    void loadPricing()
  }, [tab, loadPricing, paramsKey])

  useEffect(() => {
    return () => {
      recordsAbort.current?.abort()
      pricingAbort.current?.abort()
    }
  }, [])

  const refresh = useCallback(() => {
    if (tab === "records") void loadRecords()
    else void loadPricing()
  }, [tab, loadRecords, loadPricing])

  const exportData = useCallback(
    async (format: "csv" | "json") => {
      setExporting(true)
      setError(null)
      try {
        const result = await exportCostData({
          days: periodDays,
          format,
        })
        downloadExport(result, format)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to export")
      } finally {
        setExporting(false)
      }
    },
    [periodDays]
  )

  const setTab = useCallback(
    (next: NairaPricingTab) => {
      setParams({ [NAIRA_PRICING_PARAMS.tab]: next === "records" ? null : next })
    },
    [setParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        { [NAIRA_PRICING_PARAMS.page]: String(Math.max(0, nextPage)) },
        false
      )
    },
    [setParams]
  )

  const activePage = Number.isInteger(page) && page >= 0 ? page : 0

  return {
    tab,
    page: activePage,
    pageSize: NAIRA_PRICING_PAGE_LIMIT,
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
    clearError: () => setError(null),
    setTab,
    setPage,
    setProvider: (value: string) =>
      setParams({ [NAIRA_PRICING_PARAMS.provider]: value || null }, true),
    setModel: (value: string) =>
      setParams({ [NAIRA_PRICING_PARAMS.model]: value || null }, true),
    setService: (value: string) =>
      setParams({ [NAIRA_PRICING_PARAMS.service]: value || null }, true),
    setPeriodDays: (value: number) =>
      setParams({ [NAIRA_PRICING_PARAMS.periodDays]: String(value) }),
    refresh,
    exportData,
    periodOptions: NAIRA_PERIOD_OPTIONS,
  }
}
