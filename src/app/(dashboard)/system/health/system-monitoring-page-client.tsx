"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import {
  ActivityIcon,
  Loader2Icon,
  LogOutIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react"

import { DataGrid } from "@/components/data-grid/data-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { signOutFully } from "@/lib/auth/sign-out"
import type { HealthRunHistoryItem, HealthRunSummary } from "@/lib/health/types"
import { captureEvent } from "@/lib/posthog/client"
import type { LoginSessionRow } from "@/lib/sessions/list-sessions"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

type TabId = "health" | "sessions"

type HealthCheckRow = HealthRunSummary["results"][number]

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString()
}

function StatusBadgeCell({
  ok,
  label,
}: {
  ok: boolean
  label: string
}) {
  return (
    <Badge
      variant={ok ? "default" : "destructive"}
      className="text-[10px]"
    >
      {label}
    </Badge>
  )
}

function HealthStatusCell(
  params: ICellRendererParams<HealthRunHistoryItem>
) {
  const row = params.data
  if (!row) return null
  return (
    <StatusBadgeCell ok={row.ok} label={row.ok ? "ok" : "fail"} />
  )
}

function SessionStatusCell(
  params: ICellRendererParams<LoginSessionRow>
) {
  const row = params.data
  if (!row) return null
  return (
    <Badge
      variant={row.active ? "default" : "secondary"}
      className="text-[10px]"
    >
      {row.active ? "active" : "expired"}
    </Badge>
  )
}

function CheckStatusCell(params: ICellRendererParams<HealthCheckRow>) {
  const row = params.data
  if (!row) return null
  const label = row.skipped ? "skip" : row.ok ? "ok" : "fail"
  const variant = row.skipped
    ? "secondary"
    : row.ok
      ? "default"
      : "destructive"
  return (
    <Badge variant={variant} className="text-[10px]">
      {label}
    </Badge>
  )
}

export function SystemMonitoringPageClient() {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("health")
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<HealthRunHistoryItem[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [runDetail, setRunDetail] = useState<HealthRunSummary | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sessions, setSessions] = useState<LoginSessionRow[]>([])
  const [sessionsMeta, setSessionsMeta] = useState({ total: 0, active: 0 })
  const [healthFilter, setHealthFilter] = useState("")
  const [sessionFilter, setSessionFilter] = useState("")
  const [detailFilter, setDetailFilter] = useState("")
  const [selectedSession, setSelectedSession] = useState<LoginSessionRow | null>(
    null
  )
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false)
  const [isCurrentSession, setIsCurrentSession] = useState(false)
  const [revoking, setRevoking] = useState(false)

  const loadHealth = useCallback(async () => {
    const res = await fetch("/api/health/run")
    const data = (await res.json()) as {
      history?: HealthRunHistoryItem[]
      lastRun?: HealthRunSummary | null
      error?: string
    }
    if (!res.ok) {
      notify.error(data.error ?? "Failed to load health reports")
      return
    }
    setHistory(data.history ?? [])
    if (data.lastRun) {
      setSelectedRunId((prev) => prev ?? data.lastRun!.runId)
      setRunDetail((prev) => prev ?? data.lastRun!)
    }
  }, [])

  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/system/sessions")
    const data = (await res.json()) as {
      sessions?: LoginSessionRow[]
      total?: number
      active?: number
      error?: string
    }
    if (!res.ok) {
      notify.error(data.error ?? "Failed to load sessions")
      return
    }
    setSessions(data.sessions ?? [])
    setSessionsMeta({
      total: data.total ?? data.sessions?.length ?? 0,
      active: data.active ?? 0,
    })
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([loadHealth(), loadSessions()])
    } catch (err) {
      notify.fromError(err, "Failed to load monitoring data")
    } finally {
      setLoading(false)
    }
  }, [loadHealth, loadSessions])

  useEffect(() => {
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openRun = useCallback(async (runId: string) => {
    setSelectedRunId(runId)
    setDetailLoading(true)
    try {
      const res = await fetch(
        `/api/health/run?runId=${encodeURIComponent(runId)}`
      )
      const data = (await res.json()) as {
        run?: HealthRunSummary
        error?: string
      }
      if (!res.ok || !data.run) {
        notify.error(data.error ?? "Report not found")
        return
      }
      setRunDetail(data.run)
    } catch (err) {
      notify.fromError(err, "Failed to load report")
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const openSession = useCallback(async (row: LoginSessionRow) => {
    setSelectedSession(row)
    setSessionDetailOpen(true)
    setIsCurrentSession(false)
    try {
      const res = await fetch(
        `/api/system/sessions/${encodeURIComponent(row.id)}`
      )
      const data = (await res.json()) as {
        session?: LoginSessionRow
        isCurrent?: boolean
        error?: string
      }
      if (!res.ok || !data.session) {
        notify.error(data.error ?? "Session not found")
        return
      }
      setSelectedSession(data.session)
      setIsCurrentSession(Boolean(data.isCurrent))
    } catch (err) {
      notify.fromError(err, "Failed to load session")
    }
  }, [])

  const revokeSession = useCallback(async () => {
    if (!selectedSession) return
    setRevoking(true)
    try {
      const res = await fetch(
        `/api/system/sessions/${encodeURIComponent(selectedSession.id)}`,
        { method: "DELETE" }
      )
      const data = (await res.json()) as {
        ok?: boolean
        isCurrent?: boolean
        error?: string
      }
      if (!res.ok || !data.ok) {
        notify.error(data.error ?? "Failed to revoke session")
        return
      }

      captureEvent("session_force_logout", {
        revokedSessionId: selectedSession.id,
        revokedUserEmail: selectedSession.userEmail,
        isCurrent: Boolean(data.isCurrent),
      })

      notify.success("Session revoked — logged out of that browser")
      setSessionDetailOpen(false)
      setSelectedSession(null)

      if (data.isCurrent) {
        await signOutFully()
        router.push("/login")
        router.refresh()
        return
      }

      await loadSessions()
    } catch (err) {
      notify.fromError(err, "Failed to revoke session")
    } finally {
      setRevoking(false)
    }
  }, [selectedSession, loadSessions, router])

  const healthColumnDefs = useMemo(
    () =>
      [
        {
          colId: "finishedAt",
          headerName: "When",
          minWidth: 170,
          flex: 1.2,
          valueGetter: (p: ValueGetterParams<HealthRunHistoryItem>) =>
            formatWhen(p.data?.finishedAt),
        },
        {
          colId: "status",
          headerName: "Status",
          minWidth: 90,
          maxWidth: 110,
          cellRenderer: HealthStatusCell,
          valueGetter: (p: ValueGetterParams<HealthRunHistoryItem>) =>
            p.data?.ok ? "ok" : "fail",
        },
        {
          colId: "passed",
          headerName: "Passed",
          minWidth: 90,
          maxWidth: 100,
          field: "passed",
        },
        {
          colId: "failed",
          headerName: "Failed",
          minWidth: 90,
          maxWidth: 100,
          field: "failed",
        },
        {
          colId: "skipped",
          headerName: "Skipped",
          minWidth: 90,
          maxWidth: 100,
          field: "skipped",
        },
        {
          colId: "durationMs",
          headerName: "Duration",
          minWidth: 100,
          maxWidth: 120,
          valueGetter: (p: ValueGetterParams<HealthRunHistoryItem>) =>
            p.data ? `${p.data.durationMs}ms` : "—",
        },
        {
          colId: "ranBy",
          headerName: "Ran by",
          minWidth: 140,
          flex: 1,
          valueGetter: (p: ValueGetterParams<HealthRunHistoryItem>) =>
            p.data?.ranBy || p.data?.triggeredBy || "—",
        },
        {
          colId: "scope",
          headerName: "Scope",
          minWidth: 140,
          flex: 1.2,
          valueGetter: (p: ValueGetterParams<HealthRunHistoryItem>) =>
            p.data?.scope || "—",
        },
      ] as ColDef<HealthRunHistoryItem>[],
    []
  )

  const sessionColumnDefs = useMemo(
    () =>
      [
        {
          colId: "user",
          headerName: "User",
          minWidth: 160,
          flex: 1.2,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.userName || "—",
        },
        {
          colId: "email",
          headerName: "Email",
          minWidth: 180,
          flex: 1.3,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.userEmail || p.data?.userId || "—",
        },
        {
          colId: "role",
          headerName: "Role",
          minWidth: 110,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.role || "—",
        },
        {
          colId: "status",
          headerName: "Status",
          minWidth: 100,
          maxWidth: 120,
          cellRenderer: SessionStatusCell,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.active ? "active" : "expired",
        },
        {
          colId: "createdAt",
          headerName: "Created",
          minWidth: 160,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            formatWhen(p.data?.createdAt),
        },
        {
          colId: "expiresAt",
          headerName: "Expires",
          minWidth: 160,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            formatWhen(p.data?.expiresAt),
        },
        {
          colId: "ipAddress",
          headerName: "IP",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.ipAddress || "—",
        },
        {
          colId: "userAgent",
          headerName: "User agent",
          minWidth: 220,
          flex: 1.4,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.userAgent || "—",
        },
        {
          colId: "tokenPreview",
          headerName: "Token",
          minWidth: 120,
          valueGetter: (p: ValueGetterParams<LoginSessionRow>) =>
            p.data?.tokenPreview || "—",
        },
      ] as ColDef<LoginSessionRow>[],
    []
  )

  const detailColumnDefs = useMemo(
    () =>
      [
        {
          colId: "module",
          headerName: "Module",
          minWidth: 110,
          maxWidth: 140,
          field: "module",
        },
        {
          colId: "name",
          headerName: "Check",
          minWidth: 160,
          flex: 1.2,
          field: "name",
        },
        {
          colId: "checkId",
          headerName: "Endpoint id",
          minWidth: 160,
          flex: 1,
          field: "checkId",
        },
        {
          colId: "status",
          headerName: "Status",
          minWidth: 90,
          maxWidth: 110,
          cellRenderer: CheckStatusCell,
          valueGetter: (p: ValueGetterParams<HealthCheckRow>) =>
            p.data?.skipped ? "skip" : p.data?.ok ? "ok" : "fail",
        },
        {
          colId: "durationMs",
          headerName: "Duration",
          minWidth: 100,
          maxWidth: 120,
          valueGetter: (p: ValueGetterParams<HealthCheckRow>) =>
            p.data ? `${p.data.durationMs}ms` : "—",
        },
        {
          colId: "detail",
          headerName: "Detail / error",
          minWidth: 220,
          flex: 1.5,
          valueGetter: (p: ValueGetterParams<HealthCheckRow>) =>
            p.data?.error || p.data?.detail || "—",
        },
      ] as ColDef<HealthCheckRow>[],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldIcon className="text-muted-foreground size-5" />
            <h2 className="text-2xl font-semibold tracking-tight">
              System monitoring
            </h2>
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Health reports from <code className="text-xs">health.db</code> and
            login sessions from <code className="text-xs">auth.db</code>.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => void loadAll()}
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 border-b pb-px">
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            tab === "health"
              ? "border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent"
          )}
          onClick={() => setTab("health")}
        >
          <ActivityIcon className="size-3.5" />
          Health reports
          <Badge variant="secondary" className="ml-1">
            {history.length}
          </Badge>
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            tab === "sessions"
              ? "border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent"
          )}
          onClick={() => setTab("sessions")}
        >
          <UsersIcon className="size-3.5" />
          Login sessions
          <Badge variant="secondary" className="ml-1">
            {sessionsMeta.active}/{sessionsMeta.total}
          </Badge>
        </button>
      </div>

      {tab === "health" ? (
        <div className="flex flex-col gap-4">
          <div className="relative max-w-sm">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              placeholder="Filter health runs…"
              className="h-8 pl-8"
            />
          </div>

          <DataGrid<HealthRunHistoryItem>
            rowData={history}
            columnDefs={healthColumnDefs}
            loading={loading}
            quickFilterText={healthFilter}
            getRowId={(p) => p.data.runId}
            heightClassName="h-[22rem]"
            getRowClass={(p) =>
              p.data?.runId === selectedRunId ? "bg-muted/60" : undefined
            }
            onRowClicked={(e) => {
              if (e.data?.runId) void openRun(e.data.runId)
            }}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report detail</CardTitle>
              <CardDescription>
                {runDetail
                  ? `${runDetail.runId} · ${runDetail.durationMs}ms${
                      runDetail.scope ? ` · ${runDetail.scope}` : ""
                    }`
                  : "Select a run in the grid to inspect endpoints"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {runDetail ? (
                <div className="flex flex-wrap gap-2">
                  <Badge variant={runDetail.ok ? "default" : "destructive"}>
                    {runDetail.ok ? "Healthy" : "Unhealthy"}
                  </Badge>
                  <Badge variant="secondary">{runDetail.passed} passed</Badge>
                  <Badge variant="secondary">{runDetail.failed} failed</Badge>
                  <Badge variant="outline">{runDetail.skipped} skipped</Badge>
                </div>
              ) : null}

              <div className="relative max-w-sm">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                  value={detailFilter}
                  onChange={(e) => setDetailFilter(e.target.value)}
                  placeholder="Filter endpoints…"
                  className="h-8 pl-8"
                  disabled={!runDetail}
                />
              </div>

              {detailLoading ? (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2Icon className="size-4 animate-spin" />
                  Loading report…
                </p>
              ) : (
                <DataGrid<HealthCheckRow>
                  rowData={runDetail?.results ?? []}
                  columnDefs={detailColumnDefs}
                  loading={false}
                  quickFilterText={detailFilter}
                  getRowId={(p) => p.data.checkId}
                  heightClassName="h-[20rem]"
                />
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                placeholder="Filter sessions…"
                className="h-8 pl-8"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {sessionsMeta.active} active · {sessionsMeta.total} listed ·
              tokens masked
            </p>
          </div>

          <DataGrid<LoginSessionRow>
            rowData={sessions}
            columnDefs={sessionColumnDefs}
            loading={loading}
            quickFilterText={sessionFilter}
            getRowId={(p) => p.data.id}
            heightClassName="h-[calc(100vh-16rem)]"
            alwaysShowHorizontalScroll
            getRowClass={(p) =>
              p.data?.id === selectedSession?.id ? "bg-muted/60" : undefined
            }
            onRowClicked={(e) => {
              if (e.data) void openSession(e.data)
            }}
          />
        </div>
      )}

      <Sheet
        open={sessionDetailOpen}
        onOpenChange={(open) => {
          setSessionDetailOpen(open)
          if (!open) setSelectedSession(null)
        }}
      >
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Session detail</SheetTitle>
            <SheetDescription>
              {selectedSession?.userEmail || selectedSession?.userName || "Login session"}
            </SheetDescription>
          </SheetHeader>

          {selectedSession ? (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedSession.active ? "default" : "secondary"}
                >
                  {selectedSession.active ? "active" : "expired"}
                </Badge>
                {isCurrentSession ? (
                  <Badge variant="outline">this browser</Badge>
                ) : null}
                {selectedSession.role ? (
                  <Badge variant="secondary">{selectedSession.role}</Badge>
                ) : null}
              </div>

              <dl className="grid gap-3 text-sm">
                <DetailRow label="User" value={selectedSession.userName} />
                <DetailRow label="Email" value={selectedSession.userEmail} />
                <DetailRow label="User id" value={selectedSession.userId} />
                <DetailRow label="Session id" value={selectedSession.id} />
                <DetailRow
                  label="Created"
                  value={formatWhen(selectedSession.createdAt)}
                />
                <DetailRow
                  label="Updated"
                  value={formatWhen(selectedSession.updatedAt)}
                />
                <DetailRow
                  label="Expires"
                  value={formatWhen(selectedSession.expiresAt)}
                />
                <DetailRow label="IP" value={selectedSession.ipAddress} />
                <DetailRow
                  label="User agent"
                  value={selectedSession.userAgent}
                />
                <DetailRow label="Token" value={selectedSession.tokenPreview} />
              </dl>

              <p className="text-muted-foreground text-xs leading-relaxed">
                Force logout deletes this row from{" "}
                <code className="text-[11px]">auth.db</code>. That browser loses
                access within ~20s (or on the next navigation).
              </p>
            </div>
          ) : null}

          <SheetFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={!selectedSession || revoking}
              onClick={() => void revokeSession()}
            >
              {revoking ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <LogOutIcon className="size-4" />
              )}
              {isCurrentSession ? "Sign out this browser" : "Force logout"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="break-all">{value || "—"}</dd>
    </div>
  )
}
