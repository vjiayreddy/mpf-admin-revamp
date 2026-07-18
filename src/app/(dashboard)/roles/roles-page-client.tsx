"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community"
import { ListFilterIcon } from "lucide-react"

import { CreateRoleDialog } from "@/components/roles/create-role-dialog"
import { RolePermissionsDialog } from "@/components/roles/role-permissions-dialog"
import { RoleRowActions } from "@/components/roles/role-row-actions"
import { RolesFilterBar } from "@/components/roles/roles-filter-bar"
import { DataGrid } from "@/components/data-grid/data-grid"
import { useRolesList } from "@/hooks/use-roles-list"
import type { RoleListRow } from "@/lib/apollo/queries/roles"

function ActionsCell(
  params: ICellRendererParams<RoleListRow> & {
    onPermissions?: (role: RoleListRow) => void
  }
) {
  const role = params.data
  if (!role) return null
  return (
    <RoleRowActions
      role={role}
      onPermissions={(r) => params.onPermissions?.(r)}
    />
  )
}

export function RolesPageClient() {
  const { rows, loading, error, reloadRoles } = useRolesList()
  const [quickFilter, setQuickFilter] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleListRow | null>(null)

  const openPermissions = useCallback((role: RoleListRow) => {
    setSelectedRole(role)
    setPermissionsOpen(true)
  }, [])

  const columnDefs = useMemo(
    () =>
      [
        {
          field: "label",
          headerName: "Role",
          minWidth: 200,
          flex: 1.2,
          valueGetter: (p: ValueGetterParams<RoleListRow>) =>
            p.data?.label || "—",
        },
        {
          field: "name",
          headerName: "Name",
          minWidth: 160,
          flex: 1,
          valueGetter: (p: ValueGetterParams<RoleListRow>) =>
            p.data?.name || "—",
        },
        {
          colId: "actions",
          headerName: "Actions",
          minWidth: 140,
          maxWidth: 160,
          sortable: false,
          filter: false,
          cellRenderer: ActionsCell,
          cellRendererParams: { onPermissions: openPermissions },
        },
      ] as ColDef<RoleListRow>[],
    [openPermissions]
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage roles and assign resource permissions for administrators.
        </p>
      </div>

      <RolesFilterBar
        searchValue={quickFilter}
        loading={loading}
        onSearchChange={setQuickFilter}
        onAddRole={() => setCreateOpen(true)}
      />

      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-sm">
          <ListFilterIcon className="size-5 opacity-60" />
          No roles found.
        </div>
      ) : (
        <DataGrid<RoleListRow>
          rowData={rows}
          columnDefs={columnDefs}
          loading={loading}
          quickFilterText={quickFilter}
          getRowId={(p) => p.data._id}
          heightClassName="h-[calc(100vh-16rem)]"
        />
      )}

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={reloadRoles}
      />

      <RolePermissionsDialog
        open={permissionsOpen}
        onOpenChange={(open) => {
          setPermissionsOpen(open)
          if (!open) setSelectedRole(null)
        }}
        role={selectedRole}
        onSaved={reloadRoles}
      />
    </div>
  )
}
