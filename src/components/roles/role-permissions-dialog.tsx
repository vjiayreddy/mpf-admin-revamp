"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ASSIGN_PERMISSIONS_TO_ROLE,
  GET_ACCESS_FILTER,
  GET_ALL_RESOURCES,
  type AccessFilterRow,
  type AssignPermissionsData,
  type AssignPermissionsVars,
  type GetAccessFilterData,
  type GetAccessFilterVars,
  type GetAllResourcesData,
  type PermissionInput,
  type RoleListRow,
  type RoleResource,
} from "@/lib/apollo/queries/roles"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

type ResourcePermState = {
  isAvailable: boolean
  controls: string[]
}

type RolePermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleListRow | null
  onSaved?: () => void
}

function sortResources(resources: RoleResource[]) {
  return [...resources].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )
}

function buildInitialState(
  resources: RoleResource[],
  access: AccessFilterRow[]
): Record<string, ResourcePermState> {
  const byName = new Map<string, AccessFilterRow>()
  for (const row of access) {
    const name = row.resource?.name
    if (name) byName.set(name, row)
  }

  const state: Record<string, ResourcePermState> = {}
  for (const resource of resources) {
    const key = resource.name
    if (!key) continue
    const existing = byName.get(key)
    state[key] = {
      isAvailable: existing?.isAvailable ?? false,
      controls: existing?.allowedControls?.filter(Boolean) ?? [],
    }
  }
  return state
}

export function RolePermissionsDialog({
  open,
  onOpenChange,
  role,
  onSaved,
}: RolePermissionsDialogProps) {
  const [permState, setPermState] = useState<Record<string, ResourcePermState>>(
    {}
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [fetchResources, resourcesState] = useLazyQuery<GetAllResourcesData>(
    GET_ALL_RESOURCES,
    { fetchPolicy: "network-only" }
  )
  const [fetchAccess, accessState] = useLazyQuery<
    GetAccessFilterData,
    GetAccessFilterVars
  >(GET_ACCESS_FILTER, { fetchPolicy: "network-only" })

  const [assignPermissions, { loading: saving }] = useMutation<
    AssignPermissionsData,
    AssignPermissionsVars
  >(ASSIGN_PERMISSIONS_TO_ROLE)

  const resources = useMemo(
    () => sortResources(resourcesState.data?.getAllResources ?? []),
    [resourcesState.data?.getAllResources]
  )

  const loading =
    (resourcesState.loading || accessState.loading) && resources.length === 0

  useEffect(() => {
    if (!open || !role) return
    setSubmitError(null)
    setPermState({})
    void (async () => {
      const [resourcesResult, accessResult] = await Promise.all([
        fetchResources(),
        role.name
          ? fetchAccess({ variables: { roleName: [role.name] } })
          : Promise.resolve(null),
      ])
      const list = resourcesResult.data?.getAllResources ?? []
      const access = accessResult?.data?.getAccessFilter ?? []
      setPermState(buildInitialState(list, access))
    })()
  }, [open, role, fetchResources, fetchAccess])

  const toggleAvailable = useCallback((resourceName: string, value: boolean) => {
    setPermState((prev) => ({
      ...prev,
      [resourceName]: {
        isAvailable: value,
        controls: prev[resourceName]?.controls ?? [],
      },
    }))
  }, [])

  const toggleControl = useCallback(
    (resourceName: string, controlName: string) => {
      setPermState((prev) => {
        const current = prev[resourceName] ?? {
          isAvailable: false,
          controls: [],
        }
        const has = current.controls.includes(controlName)
        return {
          ...prev,
          [resourceName]: {
            ...current,
            controls: has
              ? current.controls.filter((c) => c !== controlName)
              : [...current.controls, controlName],
          },
        }
      })
    },
    []
  )

  const onSubmit = async () => {
    if (!role?._id) return
    setSubmitError(null)

    const permissions: PermissionInput[] = []
    for (const resource of resources) {
      if (!resource.name || !resource._id) continue
      const state = permState[resource.name]
      const controls = state?.controls ?? []
      if (controls.length === 0) continue
      permissions.push({
        isAvailable: state?.isAvailable ?? false,
        note: resource.name,
        resourceId: resource._id,
        allowedControls: controls,
      })
    }

    try {
      await assignPermissions({
        variables: { roleId: role._id, permissions },
      })
      onOpenChange(false)
      onSaved?.()
      notify.success("Permissions updated")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update permissions"
      setSubmitError(msg)
      notify.fromError(err, "Failed to update permissions")
    }
  }

  const loadError =
    resourcesState.error?.message || accessState.error?.message || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,820px)] max-w-3xl flex-col gap-0 p-0">
        <DialogHeader>
          <DialogTitle>
            Permissions
            {role?.label ? ` · ${role.label}` : ""}
          </DialogTitle>
          <DialogDescription>
            Toggle resource access and select allowed controls for this role.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="text-muted-foreground flex min-h-48 items-center justify-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading resources…
            </div>
          ) : null}

          {!loading && loadError ? (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {loadError}
            </p>
          ) : null}

          {!loading && !loadError && resources.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              No resources found.
            </p>
          ) : null}

          {!loading && !loadError
            ? resources.map((resource) => {
                const key = resource.name
                if (!key) return null
                const state = permState[key] ?? {
                  isAvailable: false,
                  controls: [],
                }
                const controls = [...(resource.availableControls ?? [])].sort(
                  (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                )

                return (
                  <div key={resource._id} className="mb-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {resource.label || resource.name}
                        </p>
                        {resource.note ? (
                          <p className="text-muted-foreground text-xs">
                            {resource.note}
                          </p>
                        ) : null}
                      </div>
                      <label className="flex shrink-0 items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Available</span>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={state.isAvailable}
                          onChange={(e) =>
                            toggleAvailable(key, e.target.checked)
                          }
                          disabled={saving}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {controls.map((control) => {
                        const controlName = control.name
                        if (!controlName) return null
                        const checked = state.controls.includes(controlName)
                        const id = `${key}-${controlName}`
                        return (
                          <label
                            key={id}
                            htmlFor={id}
                            className={cn(
                              "border-input hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-sm",
                              checked && "border-primary/40 bg-primary/5"
                            )}
                          >
                            <input
                              id={id}
                              type="checkbox"
                              className="size-3.5 accent-primary"
                              checked={checked}
                              onChange={() => toggleControl(key, controlName)}
                              disabled={saving}
                            />
                            <Label
                              htmlFor={id}
                              className="cursor-pointer font-normal"
                            >
                              {control.label || control.name}
                            </Label>
                          </label>
                        )
                      })}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                )
              })
            : null}

          {submitError ? (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {submitError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || loading || !!loadError}
            onClick={() => void onSubmit()}
          >
            {saving ? "Saving…" : "Save permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
