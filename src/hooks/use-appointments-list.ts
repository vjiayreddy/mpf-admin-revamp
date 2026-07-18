"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  APPOINTMENT_FILTER_PARAMS,
  MORE_APPOINTMENT_FILTER_KEYS,
} from "@/config/appointment-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { authClient } from "@/lib/auth-client"
import {
  buildAppointmentsFilterFromSearchParams,
  countAdvancedAppointmentFilters,
  getClearAllAppointmentFilterUpdates,
  listActiveAppointmentFilters,
  personalStylistIdFromTeamsJson,
} from "@/lib/appointments/build-appointments-filter"
import {
  APPOINTMENTS_PAGE_LIMIT,
  GET_ALL_APPOINTMENTS,
  type AppointmentListRow,
  type GetAllAppointmentsData,
  type GetAllAppointmentsVars,
} from "@/lib/apollo/queries/appointments"

export function useAppointmentsList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const paramsKey = searchParams.toString()

  const pageParam = searchParams.get(APPOINTMENT_FILTER_PARAMS.page)
  const page = pageParam !== null && pageParam !== "" ? Number(pageParam) : NaN
  const searchTerm =
    searchParams.get(APPOINTMENT_FILTER_PARAMS.searchTerm) ?? ""
  const status = searchParams.get(APPOINTMENT_FILTER_PARAMS.status) ?? ""
  const stylistId =
    searchParams.get(APPOINTMENT_FILTER_PARAMS.stylistId) ?? ""

  const defaultStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const { studioNameById } = useAllStudios()
  const { stylists } = useAllStylists()

  const stylistNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of stylists) {
      if (s._id) map.set(s._id, s.name || s.email || s._id)
    }
    return map
  }, [stylists])

  const gqlFilter = useMemo(
    () =>
      buildAppointmentsFilterFromSearchParams(
        new URLSearchParams(paramsKey),
        defaultStylistId
      ),
    [paramsKey, defaultStylistId]
  )

  const activeFilters = useMemo(
    () =>
      listActiveAppointmentFilters(new URLSearchParams(paramsKey), {
        studioNameById,
        stylistNameById,
      }),
    [paramsKey, studioNameById, stylistNameById]
  )

  const advancedFilterCount = useMemo(
    () => countAdvancedAppointmentFilters(new URLSearchParams(paramsKey)),
    [paramsKey]
  )

  const [fetchAppointments, { data, loading, error }] = useLazyQuery<
    GetAllAppointmentsData,
    GetAllAppointmentsVars
  >(GET_ALL_APPOINTMENTS, {
    fetchPolicy: "network-only",
  })

  const [rowPatches, setRowPatches] = useState<
    Record<string, Partial<AppointmentListRow>>
  >({})

  useEffect(() => {
    setRowPatches({})
  }, [paramsKey])

  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      if (resetPage) {
        params.set(APPOINTMENT_FILTER_PARAMS.page, "0")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (nextPage: number) => {
      setParams(
        {
          [APPOINTMENT_FILTER_PARAMS.page]: String(Math.max(0, nextPage)),
        },
        false
      )
    },
    [setParams]
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      setParams({
        [APPOINTMENT_FILTER_PARAMS.searchTerm]: value.trim() || null,
      })
    },
    [setParams]
  )

  const setStatus = useCallback(
    (value: string) => {
      setParams({
        [APPOINTMENT_FILTER_PARAMS.status]:
          !value || value === "all" ? null : value,
      })
    },
    [setParams]
  )

  const setStylistId = useCallback(
    (value: string) => {
      setParams({
        [APPOINTMENT_FILTER_PARAMS.stylistId]: value || null,
      })
    },
    [setParams]
  )

  const applyMoreFilters = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearMoreFilters = useCallback(() => {
    const updates: Record<string, string | null> = {}
    for (const key of MORE_APPOINTMENT_FILTER_KEYS) {
      updates[key] = null
    }
    setParams(updates)
  }, [setParams])

  const clearFilter = useCallback(
    (updates: Record<string, string | null>) => {
      setParams(updates)
    },
    [setParams]
  )

  const clearAllFilters = useCallback(() => {
    setParams(getClearAllAppointmentFilterUpdates())
  }, [setParams])

  useEffect(() => {
    if (pageParam === null) {
      setParams({ [APPOINTMENT_FILTER_PARAMS.page]: "0" }, false)
    }
  }, [pageParam, setParams])

  useEffect(() => {
    if (!Number.isInteger(page) || page < 0) return
    if (!session?.user) return

    void fetchAppointments({
      variables: {
        page: page + 1,
        limit: APPOINTMENTS_PAGE_LIMIT,
        params: gqlFilter,
      },
    })
  }, [fetchAppointments, page, gqlFilter, session?.user])

  const serverRows =
    data?.getAllAppointments?.appointments ?? []
  const totalCount = data?.getAllAppointments?.totalItemCount ?? 0

  const rows: AppointmentListRow[] = useMemo(
    () =>
      serverRows.map((row) => {
        const patch = rowPatches[row._id]
        return patch ? { ...row, ...patch } : row
      }),
    [serverRows, rowPatches]
  )

  const reloadAppointments = useCallback(
    (opts?: { preservePatches?: boolean }) => {
      if (!Number.isInteger(page) || page < 0) return
      if (!session?.user) return
      if (!opts?.preservePatches) {
        setRowPatches({})
      }
      void fetchAppointments({
        variables: {
          page: page + 1,
          limit: APPOINTMENTS_PAGE_LIMIT,
          params: gqlFilter,
        },
      })
    },
    [fetchAppointments, page, gqlFilter, session?.user]
  )

  const patchAppointmentRow = useCallback(
    (appointmentId: string, patch: Partial<AppointmentListRow>) => {
      setRowPatches((prev) => ({
        ...prev,
        [appointmentId]: { ...prev[appointmentId], ...patch },
      }))
    },
    []
  )

  return {
    rows,
    totalCount,
    loading,
    error,
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    pageSize: APPOINTMENTS_PAGE_LIMIT,
    searchInputValue: searchTerm,
    status,
    stylistId,
    activeFilters,
    advancedFilterCount,
    searchParams,
    setPage,
    setSearchQuery,
    setStatus,
    setStylistId,
    applyMoreFilters,
    clearMoreFilters,
    clearFilter,
    clearAllFilters,
    reloadAppointments,
    patchAppointmentRow,
  }
}
