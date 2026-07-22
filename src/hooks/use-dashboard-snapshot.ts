"use client"

import { useQuery } from "@apollo/client/react"
import { useMemo } from "react"

import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import {
  extractDateFormatForAnalytics,
  isoRangeForTimePeriod,
  rangeForTimePeriod,
} from "@/lib/analytics/date-range"
import {
  partitionAppointments,
  partitionEmb,
  partitionLeads,
  partitionOrders,
  partitionQc,
  partitionTrial,
  partitionUsers,
} from "@/lib/analytics/partition"
import { authClient } from "@/lib/auth-client"
import {
  GET_APPOINTMENTS_DASHBOARD_DATA,
  GET_DASHBOARD_DATA,
  GET_EMB_DASHBOARD_DATA,
  GET_LEADS_DASHBOARD_DATA,
  GET_ORDER_DASHBOARD_DATA,
  GET_QUALITYCHECK_DASHBOARD_DATA,
  GET_TRIAL_DASHBOARD_DATA,
  type AnalyticsItem,
  type AnalyticsSummaryVars,
} from "@/lib/apollo/queries/analytics"

export type DashboardKpiKey =
  | "orders"
  | "leads"
  | "trials"
  | "qc"
  | "embroidery"
  | "appointments"

export type DashboardKpi = {
  key: DashboardKpiKey
  label: string
  href: string
  value: string | number
  loading: boolean
  error: boolean
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined
    return (acc as Record<string, unknown>)[key]
  }, obj)
}

function analyticsItems(data: unknown, path: string): AnalyticsItem[] {
  const raw = getByPath(data, path)
  return Array.isArray(raw) ? (raw as AnalyticsItem[]) : []
}

function pickKpiValue(items: AnalyticsItem[]): string | number {
  if (items.length === 0) return "—"
  const preferred =
    items.find((item) => /total/i.test(item.label)) ?? items[0]
  const raw = preferred.value ?? preferred.total
  if (raw === null || raw === undefined || raw === "") return "—"
  return raw
}

function sumItemValues(items: AnalyticsItem[]): number | null {
  if (items.length === 0) return null
  let sum = 0
  let any = false
  for (const item of items) {
    const n = Number(item.value ?? item.total)
    if (Number.isFinite(n)) {
      sum += n
      any = true
    }
  }
  return any ? sum : null
}

function formatWeekRangeLabel(start: Date, end: Date) {
  // Fixed locale so SSR and client always match (avoids hydration mismatch).
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`
}

export function useDashboardSnapshot() {
  const { data: session } = authClient.useSession()

  const personalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const weekRange = useMemo(() => rangeForTimePeriod("week"), [])
  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(weekRange.start, weekRange.end),
    [weekRange]
  )

  const summaryVars = useMemo((): AnalyticsSummaryVars => {
    const range = isoRangeForTimePeriod("week")
    return {
      startDate: extractDateFormatForAnalytics(range.startDate, "START_DATE"),
      endDate: extractDateFormatForAnalytics(range.endDate, "END_DATE"),
      roleFilter: personalStylistId
        ? {
            _id: personalStylistId,
            roleIdentifier: "personal_stylist",
          }
        : null,
    }
  }, [personalStylistId])

  const appointmentsVars = useMemo(
    (): AnalyticsSummaryVars => ({
      startDate: summaryVars.startDate,
      endDate: summaryVars.endDate,
      roleFilter: summaryVars.roleFilter,
    }),
    [summaryVars]
  )

  const orders = useQuery(GET_ORDER_DASHBOARD_DATA, {
    variables: summaryVars,
    fetchPolicy: "network-only",
  })
  const leads = useQuery(GET_LEADS_DASHBOARD_DATA, {
    variables: summaryVars,
    fetchPolicy: "network-only",
  })
  const trials = useQuery(GET_TRIAL_DASHBOARD_DATA, {
    variables: summaryVars,
    fetchPolicy: "network-only",
  })
  const qc = useQuery(GET_QUALITYCHECK_DASHBOARD_DATA, {
    variables: summaryVars,
    fetchPolicy: "network-only",
  })
  const emb = useQuery(GET_EMB_DASHBOARD_DATA, {
    variables: summaryVars,
    fetchPolicy: "network-only",
  })
  const appointments = useQuery(GET_APPOINTMENTS_DASHBOARD_DATA, {
    variables: appointmentsVars,
    fetchPolicy: "network-only",
  })
  const users = useQuery(GET_DASHBOARD_DATA, {
    variables: summaryVars,
    fetchPolicy: "network-only",
  })

  const followUpCount = useMemo(() => {
    if (leads.error) return null
    const leadItems = analyticsItems(
      leads.data,
      "getLeadsDashboardData.analytics"
    )
    return sumItemValues(partitionLeads(leadItems).followUpLeads)
  }, [leads.data, leads.error])

  const followUpLoading = leads.loading && followUpCount === null

  const clientConnectCount = useMemo(() => {
    if (users.error) return null
    const items = analyticsItems(users.data, "getDashboardData.analytics")
    const partitioned = partitionUsers(items)
    const today = sumItemValues(partitioned.withOutCCToday)
    const missed = sumItemValues(partitioned.withOutCCmissed)
    if (today === null && missed === null) return null
    return (today ?? 0) + (missed ?? 0)
  }, [users.data, users.error])

  const clientConnectLoading = users.loading && clientConnectCount === null

  const kpis = useMemo((): DashboardKpi[] => {
    const orderItems = analyticsItems(
      orders.data,
      "getStoreOrderDashboardData.analytics"
    )
    const leadItems = analyticsItems(
      leads.data,
      "getLeadsDashboardData.analytics"
    )
    const trialItems = analyticsItems(
      trials.data,
      "getOrderTrialDashboardData.analytics"
    )
    const qcItems = analyticsItems(
      qc.data,
      "getOrderQualityCheckDashboardData.analytics"
    )
    const embItems = analyticsItems(
      emb.data,
      "getEmbroideryDashboardData.analytics"
    )
    const apptItems = analyticsItems(
      appointments.data,
      "getAppointmentDashboardData.analytics"
    )

    const apptPartition = partitionAppointments(apptItems)
    const apptSum =
      apptPartition.appointmentCreated.length > 0
        ? sumItemValues(apptPartition.appointmentCreated)
        : sumItemValues(apptPartition.appointmentScheduled)

    return [
      {
        key: "orders",
        label: "Orders",
        href: "/orders",
        value: orders.error
          ? "—"
          : pickKpiValue(partitionOrders(orderItems).totalOrders),
        loading: orders.loading,
        error: Boolean(orders.error),
      },
      {
        key: "leads",
        label: "Leads",
        href: "/leads",
        value: leads.error
          ? "—"
          : pickKpiValue(partitionLeads(leadItems).totalLeads),
        loading: leads.loading,
        error: Boolean(leads.error),
      },
      {
        key: "trials",
        label: "Trials",
        href: "/trial",
        value: trials.error
          ? "—"
          : pickKpiValue(partitionTrial(trialItems).totalTrials),
        loading: trials.loading,
        error: Boolean(trials.error),
      },
      {
        key: "qc",
        label: "Quality checks",
        href: "/quality-check",
        value: qc.error
          ? "—"
          : pickKpiValue(partitionQc(qcItems).totalQcAnalytics),
        loading: qc.loading,
        error: Boolean(qc.error),
      },
      {
        key: "embroidery",
        label: "Embroidery",
        href: "/embroidery",
        value: emb.error
          ? "—"
          : pickKpiValue(partitionEmb(embItems).totalEmbCount),
        loading: emb.loading,
        error: Boolean(emb.error),
      },
      {
        key: "appointments",
        label: "Appointments",
        href: "/appointments",
        value: appointments.error
          ? "—"
          : apptSum === null
            ? "—"
            : apptSum,
        loading: appointments.loading,
        error: Boolean(appointments.error),
      },
    ]
  }, [
    orders.data,
    orders.loading,
    orders.error,
    leads.data,
    leads.loading,
    leads.error,
    trials.data,
    trials.loading,
    trials.error,
    qc.data,
    qc.loading,
    qc.error,
    emb.data,
    emb.loading,
    emb.error,
    appointments.data,
    appointments.loading,
    appointments.error,
  ])

  return {
    kpis,
    personalStylistId,
    user: session?.user ?? null,
    weekRangeLabel,
    followUpCount,
    followUpLoading,
    clientConnectCount,
    clientConnectLoading,
  }
}
