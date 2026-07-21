"use client"

import { useEffect, useMemo } from "react"
import { useLazyQuery } from "@apollo/client/react"

import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import { authClient } from "@/lib/auth-client"
import {
  GET_ALL_TICKETS,
  TICKETS_PAGE_SIZE,
  type GetTicketsData,
  type GetTicketsVars,
} from "@/lib/apollo/queries/tickets"
import {
  GET_TRACK_ORDERS_LIST,
  TRACK_ORDERS_LIST_PAGE_LIMIT,
  type GetAllStoreOrdersVars,
  type GetTrackOrdersListData,
} from "@/lib/apollo/queries/store-orders"
import { buildTrackOrdersListQueryVars } from "@/lib/track-orders/build-track-orders-list-filter"

/**
 * Shared attention counts for pulse strip + attention list (avoids double-fetch).
 * Track orders API has no totalCount — show page size with "+" when full.
 */
export function useDashboardAttention() {
  const { data: session } = authClient.useSession()
  const personalStylistId = useMemo(
    () => personalStylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const [fetchTickets, ticketsState] = useLazyQuery<
    GetTicketsData,
    GetTicketsVars
  >(GET_ALL_TICKETS, { fetchPolicy: "network-only" })

  const [fetchTrackOrders, trackState] = useLazyQuery<
    GetTrackOrdersListData,
    GetAllStoreOrdersVars
  >(GET_TRACK_ORDERS_LIST, { fetchPolicy: "network-only" })

  const trackVars = useMemo(
    () =>
      buildTrackOrdersListQueryVars(
        new URLSearchParams(),
        0,
        personalStylistId
      ),
    [personalStylistId]
  )

  useEffect(() => {
    void fetchTickets({
      variables: {
        page: 1,
        pageSize: TICKETS_PAGE_SIZE,
        status: ["Open"],
      },
    })
  }, [fetchTickets])

  useEffect(() => {
    if (!session?.user) return
    void fetchTrackOrders({ variables: trackVars })
  }, [fetchTrackOrders, trackVars, session?.user])

  const openTickets = ticketsState.error
    ? null
    : (ticketsState.data?.getTickets?.totalCount ?? null)

  const trackRows = trackState.data?.getAllStoreOrders ?? []
  const trackCount = trackState.error
    ? null
    : trackState.data
      ? trackRows.length >= TRACK_ORDERS_LIST_PAGE_LIMIT
        ? `${TRACK_ORDERS_LIST_PAGE_LIMIT}+`
        : trackRows.length
      : null

  return {
    openTickets,
    openTicketsLoading: ticketsState.loading && openTickets === null,
    trackOrdersCount: trackCount,
    trackOrdersLoading: trackState.loading && trackCount === null,
  }
}
