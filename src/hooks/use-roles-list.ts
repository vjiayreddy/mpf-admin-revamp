"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"

import { authClient } from "@/lib/auth-client"
import {
  GET_ALL_ROLES,
  type GetAllRolesData,
  type RoleListRow,
} from "@/lib/apollo/queries/roles"

export function useRolesList() {
  const { data: session } = authClient.useSession()

  const [fetchRoles, { data, loading, error }] = useLazyQuery<GetAllRolesData>(
    GET_ALL_ROLES,
    { fetchPolicy: "network-only" }
  )

  const reloadRoles = useCallback(() => {
    if (!session?.user) return
    void fetchRoles()
  }, [fetchRoles, session?.user])

  useEffect(() => {
    reloadRoles()
  }, [reloadRoles])

  const rows = useMemo(() => {
    const list = data?.getAllRoles ?? []
    return list.filter(
      (role): role is RoleListRow =>
        Boolean(role?._id) && Boolean(role.label?.trim())
    )
  }, [data?.getAllRoles])

  return {
    rows,
    loading: loading && rows.length === 0,
    error: error?.message ?? null,
    reloadRoles,
  }
}
