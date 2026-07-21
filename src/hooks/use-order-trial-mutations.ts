"use client"

import { useMutation } from "@apollo/client/react"

import {
  CREATE_ORDER_TRIAL,
  UPDATE_ORDER_TRIAL,
  type CreateOrderTrialData,
  type CreateOrderTrialVars,
  type UpdateOrderTrialData,
  type UpdateOrderTrialVars,
} from "@/lib/apollo/queries/trial"

/**
 * Shared create/update mutations for order trials (form + quick view).
 */
export function useOrderTrialMutations() {
  const [createTrial, createState] = useMutation<
    CreateOrderTrialData,
    CreateOrderTrialVars
  >(CREATE_ORDER_TRIAL)

  const [updateTrial, updateState] = useMutation<
    UpdateOrderTrialData,
    UpdateOrderTrialVars
  >(UPDATE_ORDER_TRIAL)

  return {
    createTrial,
    updateTrial,
    creating: createState.loading,
    updating: updateState.loading,
    saving: createState.loading || updateState.loading,
  }
}
