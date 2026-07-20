"use client"

import { Suspense, useEffect, useMemo } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"

import { OpsHoursCostSection } from "@/components/embroidery/ops-form/ops-hours-cost-section"
import { OpsStatusSection } from "@/components/embroidery/ops-form/ops-status-section"
import { OpsSummarySection } from "@/components/embroidery/ops-form/ops-summary-section"
import { OpsWorkSection } from "@/components/embroidery/ops-form/ops-work-section"
import { OpsWorkshopsSection } from "@/components/embroidery/ops-form/ops-workshops-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmbroideryAreaMapping } from "@/hooks/use-embroidery-area-mapping"
import {
  GET_EMBROIDERY_OPS_BY_ID,
  SAVE_EMBROIDERY,
  type GetEmbroideryByIdVars,
  type GetEmbroideryOpsByIdData,
  type SaveEmbroideryData,
  type SaveEmbroideryVars,
} from "@/lib/apollo/queries/embroidery"
import {
  buildOpsPayload,
  emptyOpsFormValues,
  embroideryOpsFormSchema,
  resetOpsFormValues,
  type EmbroideryOpsFormValues,
  type WorkAreaOption,
} from "@/lib/embroidery/ops-form"
import { notify } from "@/lib/notify"
import { resolveProductCatId } from "@/lib/track-orders/product-cat-id"

function parseStoredWorkAreas(
  workAreas?: string[] | string | null
): WorkAreaOption[] {
  const raw = Array.isArray(workAreas)
    ? workAreas
    : typeof workAreas === "string" && workAreas.trim()
      ? [workAreas]
      : []
  const out: WorkAreaOption[] = []
  for (const entry of raw) {
    try {
      const parsed =
        typeof entry === "string" ? (JSON.parse(entry) as WorkAreaOption) : null
      if (parsed?.id && parsed?.name) {
        out.push({
          id: String(parsed.id),
          name: String(parsed.name),
          group: String(parsed.group || parsed.name),
        })
      }
    } catch {
      // skip
    }
  }
  return out
}

function OpsFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")?.trim() || ""

  const [fetchDetail, { data, loading, error }] = useLazyQuery<
    GetEmbroideryOpsByIdData,
    GetEmbroideryByIdVars
  >(GET_EMBROIDERY_OPS_BY_ID, { fetchPolicy: "network-only" })

  const [saveEmbroidery, { loading: saving }] = useMutation<
    SaveEmbroideryData,
    SaveEmbroideryVars
  >(SAVE_EMBROIDERY)

  const detail = data?.getEmbroideryById

  const catId = useMemo(() => {
    if (!detail) return null
    return (
      detail.catId?.trim() ||
      resolveProductCatId(detail.storeOrderProductName, detail.catId) ||
      null
    )
  }, [detail])

  const { options: mappedAreas, loading: areasLoading } =
    useEmbroideryAreaMapping(catId, Boolean(detail))

  const storedAreas = useMemo(
    () => parseStoredWorkAreas(detail?.workAreas),
    [detail?.workAreas]
  )

  const areaOptions = useMemo(() => {
    const byId = new Map<string, WorkAreaOption>()
    for (const opt of mappedAreas) byId.set(opt.id, opt)
    for (const opt of storedAreas) {
      if (!byId.has(opt.id)) byId.set(opt.id, opt)
    }
    return Array.from(byId.values())
  }, [mappedAreas, storedAreas])

  const methods = useForm<EmbroideryOpsFormValues>({
    resolver: zodResolver(embroideryOpsFormSchema),
    defaultValues: emptyOpsFormValues(),
  })

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods

  useEffect(() => {
    if (!id) return
    void fetchDetail({ variables: { id } })
  }, [id, fetchDetail])

  useEffect(() => {
    if (!detail) return
    reset(resetOpsFormValues(detail))
  }, [detail, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!id) return
    try {
      const body = buildOpsPayload(values, areaOptions)
      await saveEmbroidery({
        variables: { id, body },
      })
      reset(values)
      notify.success("Embroidery updated")
    } catch (err) {
      notify.fromError(err, "Failed to update embroidery")
    }
  })

  const title = detail
    ? `Update embroidery · ${detail.embroideryReqNo || detail._id}`
    : "Update embroidery"

  if (!id) {
    return (
      <p className="text-destructive text-sm" role="alert">
        Missing embroidery id. Open this page from the list Product No link.
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">
            Update work, workshops, statuses, hours, and costs for this job.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {loading && !detail ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load embroidery details.
        </p>
      ) : null}

      {detail ? (
        <FormProvider {...methods}>
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <OpsSummarySection detail={detail} />
            <OpsWorkSection
              areaOptions={areaOptions}
              areasLoading={areasLoading}
              disabled={saving}
            />
            <OpsWorkshopsSection enabled disabled={saving} />
            <OpsStatusSection disabled={saving} />
            <OpsHoursCostSection disabled={saving} />

            <div className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur">
              <div className="mx-auto flex max-w-4xl items-center justify-end gap-2 px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => router.push("/embroidery")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !isDirty}>
                  {saving ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : null}
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      ) : null}
    </div>
  )
}

export function EmbroideryOpsFormClient() {
  return (
    <Suspense
      fallback={
        <p className="text-muted-foreground text-sm">Loading form…</p>
      }
    >
      <OpsFormInner />
    </Suspense>
  )
}
