"use client"

import { useCallback, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { EyeIcon, Trash2Icon } from "lucide-react"
import { useEffect } from "react"

import { MeasurementView } from "@/components/measurements/measurement-view"
import { DataGrid } from "@/components/data-grid/data-grid"
import { Button } from "@/components/ui/button"
import { getMeasurementCategoryMeta } from "@/config/measurement-categories"
import {
  DELETE_USER_MEASUREMENT,
  GET_USER_MEASUREMENTS,
  type DeleteUserMeasurementData,
  type DeleteUserMeasurementVars,
  type GetUserMeasurementsData,
  type GetUserMeasurementsVars,
} from "@/lib/apollo/queries/measurements"
import type { UserMeasurementRecord } from "@/lib/measurements/types"
import { notify } from "@/lib/notify"

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

type MeasurementsHistoryPanelProps = {
  userId: string
}

export function MeasurementsHistoryPanel({
  userId,
}: MeasurementsHistoryPanelProps) {
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [fetchList, { data, loading, error, refetch }] = useLazyQuery<
    GetUserMeasurementsData,
    GetUserMeasurementsVars
  >(GET_USER_MEASUREMENTS, { fetchPolicy: "network-only" })

  const [deleteMeasurement, { loading: deleting }] = useMutation<
    DeleteUserMeasurementData,
    DeleteUserMeasurementVars
  >(DELETE_USER_MEASUREMENT)

  useEffect(() => {
    void fetchList({
      variables: { userId, page: 1, limit: 100 },
    })
  }, [userId, fetchList])

  const rows = data?.getUserMeasurements ?? []

  const openView = useCallback((row: UserMeasurementRecord) => {
    if (!row.catId) return
    setSelectedCatId(row.catId)
    setViewOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (row: UserMeasurementRecord) => {
      if (!row._id) return
      if (!window.confirm("Delete this measurement record?")) return
      setDeleteError(null)
      try {
        await deleteMeasurement({ variables: { measurementId: row._id } })
        notify.success("Measurement deleted")
        await refetch()
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to delete measurement"
        setDeleteError(msg)
        notify.fromError(err, "Failed to delete measurement")
      }
    },
    [deleteMeasurement, refetch]
  )

  const columnDefs = useMemo(() => {
    const cols: ColDef<UserMeasurementRecord>[] = [
      {
        colId: "actions",
        headerName: "Actions",
        minWidth: 120,
        maxWidth: 140,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<UserMeasurementRecord>) => {
          if (!params.data) return null
          return (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7"
                aria-label="View measurement"
                onClick={() => openView(params.data!)}
              >
                <EyeIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7"
                aria-label="Delete measurement"
                disabled={deleting}
                onClick={() => void handleDelete(params.data!)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          )
        },
      },
      {
        colId: "category",
        headerName: "Category",
        minWidth: 140,
        valueGetter: (p) =>
          p.data?.category?.name ||
          getMeasurementCategoryMeta(p.data?.catId)?.name ||
          "—",
      },
      {
        field: "measuredBy",
        headerName: "Measured by",
        minWidth: 120,
        valueGetter: (p) => p.data?.measuredBy || "—",
      },
      {
        colId: "date",
        headerName: "Date",
        minWidth: 120,
        valueGetter: (p) => formatDate(p.data?.dateRecorded?.timestamp),
      },
      {
        field: "approvedStatus",
        headerName: "Approval",
        minWidth: 120,
        valueGetter: (p) => p.data?.approvedStatus || "—",
      },
      {
        field: "remarks",
        headerName: "Remarks",
        minWidth: 120,
        valueGetter: (p) => p.data?.remarks || "—",
      },
    ]
    return cols
  }, [openView, handleDelete, deleting])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">History</h2>
        <p className="text-muted-foreground text-sm">
          Saved measurements for this customer.
          {rows.length > 0 ? ` · ${rows.length} records` : null}
        </p>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load measurement history.
        </p>
      ) : null}
      {deleteError ? (
        <p className="text-destructive text-sm" role="alert">
          {deleteError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <DataGrid
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          getRowId={(params) => params.data._id ?? String(Math.random())}
          heightClassName="h-[calc(100vh-26rem)]"
          className="rounded-none border-0"
        />
      </div>

      <MeasurementView
        open={viewOpen}
        onOpenChange={setViewOpen}
        target={
          selectedCatId
            ? { userId, catId: selectedCatId }
            : null
        }
      />
    </div>
  )
}
