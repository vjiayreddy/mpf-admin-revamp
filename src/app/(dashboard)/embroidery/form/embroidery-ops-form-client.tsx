"use client"

import { Suspense, useEffect, useMemo } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"
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
  createEmbroideryOpsFormSchema,
  emptyOpsFormValues,
  isWorkAreaMandatory,
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

  const workAreasRequired = isWorkAreaMandatory(catId)

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
    resolver: async (values, context, options) =>
      zodResolver(createEmbroideryOpsFormSchema(workAreasRequired))(
        values,
        context,
        options
      ),
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

  const onSubmit = handleSubmit(
    async (values) => {
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
    },
    () => {
      notify.error("Please fix the highlighted fields")
    }
  )

  const title = detail
    ? `Update embroidery · ${detail.embroideryReqNo || detail._id}`
    : "Update embroidery"

  if (!id) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Update embroidery form
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Open a job from the embroidery list to edit work, workshops,
            statuses, and hours.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground mb-4 text-sm">
            No embroidery id in the URL. Pick a product from the list, or use
            More → Update form.
          </p>
          <Button type="button" onClick={() => router.push("/embroidery")}>
            Go to embroidery list
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="mt-0.5 size-8 shrink-0"
              aria-label="Back to list"
              onClick={() => router.push("/embroidery")}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm">
                Work, workshops, statuses, hours, and costs
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.push("/embroidery")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || !isDirty || !detail}
              onClick={() => void onSubmit()}
            >
              {saving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
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
          <form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
            <OpsSummarySection detail={detail} />
            <OpsWorkSection
              areaOptions={areaOptions}
              areasLoading={areasLoading}
              disabled={saving}
              workAreasRequired={workAreasRequired}
            />
            <OpsWorkshopsSection enabled disabled={saving} />
            <OpsStatusSection disabled={saving} />
            <OpsHoursCostSection disabled={saving} />
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
