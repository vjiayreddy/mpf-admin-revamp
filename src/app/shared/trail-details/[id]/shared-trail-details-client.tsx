"use client"

import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { useParams } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { TrialProductsTable } from "@/components/trial/trial-products-table"
import {
  GET_ORDER_TRIAL_BY_ID,
  type GetOrderTrialByIdData,
  type GetOrderTrialByIdVars,
  type OrderTrialRow,
} from "@/lib/apollo/queries/trial"
import { customerFullName, formatStoreOrderDate } from "@/lib/track-orders/format"

export function SharedTrailDetailsClient() {
  const params = useParams<{ id: string }>()
  const trialId = params?.id
  const [trial, setTrial] = useState<OrderTrialRow | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [fetchTrial, { loading }] = useLazyQuery<
    GetOrderTrialByIdData,
    GetOrderTrialByIdVars
  >(GET_ORDER_TRIAL_BY_ID, { fetchPolicy: "network-only" })

  useEffect(() => {
    if (!trialId) return
    let cancelled = false
    void fetchTrial({ variables: { orderTrialId: trialId } }).then((result) => {
      if (cancelled) return
      const next = result.data?.getOrderTrialById ?? null
      if (!next) {
        setError("Trail details not found")
        return
      }
      setTrial(next)
    }).catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Failed to load trail")
      }
    })
    return () => {
      cancelled = true
    }
  }, [trialId, fetchTrial])

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          My Perfect Fit
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Trail details</h1>
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          Loading…
        </div>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {trial ? (
        <div className="space-y-6">
          <div className="bg-card grid gap-2 rounded-lg border p-4 text-sm sm:grid-cols-2">
            <p>
              <span className="font-medium">Client:</span>{" "}
              {customerFullName(
                trial.storeProductOrder?.customerFirstName,
                trial.storeProductOrder?.customerLastName
              )}
            </p>
            <p>
              <span className="font-medium">Stylist:</span>{" "}
              {trial.stylist?.name ||
                trial.storeProductOrder?.stylist?.[0]?.name ||
                "—"}
            </p>
            <p>
              <span className="font-medium">Order No:</span>{" "}
              {trial.storeProductOrder?.orderNo ?? "—"}
            </p>
            <p>
              <span className="font-medium">Order trail date:</span>{" "}
              {formatStoreOrderDate(trial.storeProductOrder?.trialDate)}
            </p>
            <p>
              <span className="font-medium">Actual trail date:</span>{" "}
              {formatStoreOrderDate(trial.trialDate)}
            </p>
            <p>
              <span className="font-medium">Delivery:</span>{" "}
              {formatStoreOrderDate(trial.deliveryDate)}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {trial.trialStatus || "—"}
            </p>
            <p>
              <span className="font-medium">Decision:</span>{" "}
              {trial.trialDecision || "—"}
            </p>
            <p>
              <span className="font-medium">Rating:</span>{" "}
              {trial.trialRating || "—"}
            </p>
            <p>
              <span className="font-medium">Trail by:</span>{" "}
              {trial.trialBy || "—"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium">Note:</span> {trial.note || "—"}
            </p>
          </div>

          <TrialProductsTable
            data={trial}
            measurementStatus={trial.measurementStatus}
          />
        </div>
      ) : null}
    </main>
  )
}
