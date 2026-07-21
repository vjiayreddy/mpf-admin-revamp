"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Controller, useFieldArray, useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@apollo/client/react"
import {
  ChevronDownIcon,
  ImagePlusIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ColorsAutocomplete } from "@/components/orders/colors-autocomplete"
import { WorkAreaGroupedAutocomplete } from "@/components/embroidery/ops-form/work-area-grouped-autocomplete"
import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import { useAllSecondaryColors } from "@/hooks/use-all-secondary-colors"
import { useEmbroideryAreaMapping } from "@/hooks/use-embroidery-area-mapping"
import {
  GET_EMBROIDERY_BY_ID,
  GET_EMBROIDERY_SAMPLE_MATERIAL_MAPPING,
  SAVE_EMBROIDERY,
  type GetEmbroideryByIdData,
  type GetEmbroideryByIdVars,
  type GetEmbroiderySampleMaterialMappingData,
  type GetEmbroiderySampleMaterialMappingVars,
  type SaveEmbroideryData,
  type SaveEmbroideryVars,
} from "@/lib/apollo/queries/embroidery"
import {
  GET_USER_MEASUREMENTS,
  type GetUserMeasurementsData,
  type GetUserMeasurementsVars,
} from "@/lib/apollo/queries/measurements"
import {
  type EmbDesignFormValues,
  type EmbImageRef,
  EMB_IMAGE_UPLOAD_PATH,
  EMB_TYPE_OPTIONS,
  ARTWORK_TYPE_OPTIONS,
  FRACTION_OPTIONS,
  collectEmbDesignErrorMessages,
  createEmbDesignFormSchema,
  embDesignSectionsWithErrors,
  emptyBoota,
  emptyEmbDesignFormValues,
  emptyMaterialAttribute,
  emptyMaterialSample,
  emptyMonogram,
  getEmbFormPayload,
  getMonogramPositions,
  resetEmbFormPayload,
  showsBackBootaOnly,
  showsFrontAndBackBootas,
} from "@/lib/embroidery/design-form"
import {
  getMeasurementConfigByCategory,
  processMeasurementOptions,
  shouldFetchEmbMeasurements,
} from "@/lib/embroidery/emb-measurement-utils"
import { isWorkAreaMandatory } from "@/lib/embroidery/ops-form"
import { WORK_TYPE_OPTIONS } from "@/config/embroidery-status"
import { colorsForMaterial } from "@/config/emb-material-colors"
import { notify } from "@/lib/notify"
import { uploadUrlsFromResult } from "@/lib/uppy/config"
import { cn } from "@/lib/utils"

export type EmbroideryDesignFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catId: string
  userId?: string
  embId?: string | null
  embJsonString?: string | null
  fabColor?: string
  onDraftSaved: (jsonString: string) => void
}

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-3 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type UploadTarget = { fieldPath: string; append?: boolean }

function ImageTile({
  url,
  onRemove,
}: {
  url: string
  onRemove: () => void
}) {
  return (
    <div className="group relative size-20 shrink-0 overflow-hidden rounded-md border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="size-full object-cover"
        loading="lazy"
        draggable={false}
      />
      <button
        type="button"
        className="bg-background/80 absolute top-0.5 right-0.5 hidden size-5 items-center justify-center rounded-full group-hover:flex"
        onClick={onRemove}
      >
        <XIcon className="size-3" />
      </button>
    </div>
  )
}

function SectionCard({
  title,
  defaultOpen = true,
  forceOpen = false,
  hasError = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  forceOpen?: boolean
  hasError?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-lg border",
          hasError && "border-destructive/60 ring-destructive/20 ring-1"
        )}
      >
        <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium">
          <span className="flex min-w-0 items-center gap-2">
            {title}
            {hasError ? (
              <span className="bg-destructive/10 text-destructive rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                Fix required
              </span>
            ) : null}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform [[data-panel-open]_&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 border-t px-3 py-3">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      className="text-destructive text-xs"
      role="alert"
      data-emb-field-error=""
    >
      {message}
    </p>
  )
}

export function EmbroideryDesignFormDialog({
  open,
  onOpenChange,
  catId,
  userId,
  embId,
  embJsonString,
  fabColor = "",
  onDraftSaved,
}: EmbroideryDesignFormDialogProps) {
  const schema = useMemo(() => createEmbDesignFormSchema(catId), [catId])
  const form = useForm<EmbDesignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyEmbDesignFormValues(fabColor),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "all",
  })
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    setFocus,
    formState: { errors, isSubmitted },
  } = form

  const errorMessages = useMemo(
    () => collectEmbDesignErrorMessages(errors as Record<string, unknown>),
    [errors]
  )
  const sectionsWithErrors = useMemo(
    () => embDesignSectionsWithErrors(errors as Record<string, unknown>),
    [errors]
  )
  const showValidationSummary = isSubmitted && errorMessages.length > 0
  const scrollBodyRef = useRef<HTMLDivElement | null>(null)

  const designImages = useFieldArray({ control, name: "designReferenceImages" })
  const frontBootas = useFieldArray({ control, name: "front_bootas" })
  const backBootas = useFieldArray({ control, name: "bootas" })
  const monogramsArr = useFieldArray({ control, name: "monograms" })
  const samplesArr = useFieldArray({ control, name: "workMaterialSamples" })

  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null)
  const resetKeyRef = useRef("")

  const { colorByName } = useAllSecondaryColors()
  const {
    options: workAreaOptions,
    loading: areasLoading,
  } = useEmbroideryAreaMapping(catId, open)
  const workAreasRequired = isWorkAreaMandatory(catId)

  const hasFrontAndBack = showsFrontAndBackBootas(catId)
  const hasBackOnly = showsBackBootaOnly(catId)
  const showBootas = hasFrontAndBack || hasBackOnly
  const monogramPositions = useMemo(() => getMonogramPositions(catId), [catId])

  // --- data queries ---
  const { data: embData, loading: embLoading } = useQuery<
    GetEmbroideryByIdData,
    GetEmbroideryByIdVars
  >(GET_EMBROIDERY_BY_ID, {
    variables: { id: embId ?? "" },
    skip: !open || !embId,
    fetchPolicy: "network-only",
  })

  const { data: materialData } = useQuery<
    GetEmbroiderySampleMaterialMappingData,
    GetEmbroiderySampleMaterialMappingVars
  >(GET_EMBROIDERY_SAMPLE_MATERIAL_MAPPING, {
    variables: { catId },
    skip: !open || !catId,
    fetchPolicy: "cache-first",
  })

  const fetchMeasurements =
    open &&
    Boolean(userId?.trim()) &&
    shouldFetchEmbMeasurements(catId) &&
    !embJsonString?.trim() &&
    !embId?.trim()

  const { data: measurementsData, loading: measurementsLoading } = useQuery<
    GetUserMeasurementsData,
    GetUserMeasurementsVars
  >(GET_USER_MEASUREMENTS, {
    variables: {
      userId: userId?.trim() || "",
      catId,
      page: 1,
      limit: 1,
    },
    skip: !fetchMeasurements,
    fetchPolicy: "network-only",
  })

  const measurementStatus = useMemo(() => {
    if (!open) return null
    if (!userId?.trim()) {
      return {
        kind: "no_customer" as const,
        message:
          "Select a customer on the order to load Length / BBS from measurements.",
      }
    }
    if (!shouldFetchEmbMeasurements(catId)) {
      return null
    }
    // Draft already has values — don't nag
    if (embJsonString?.trim()) return null
    if (!fetchMeasurements) return null
    if (measurementsLoading) {
      return { kind: "loading" as const, message: "Loading length / BBS from measurements…" }
    }

    const record = measurementsData?.getUserMeasurements?.[0]
    const options = record?.options ?? []
    if (!record || options.length === 0) {
      return {
        kind: "missing" as const,
        message:
          "No measurements found for this customer and product. Enter Length and BBS manually.",
      }
    }

    const config = getMeasurementConfigByCategory(catId)
    const updateData = processMeasurementOptions(options, config)
    if (!updateData.length && !updateData.bbs) {
      return {
        kind: "incomplete" as const,
        message:
          "Measurements exist but Length / BBS fields are missing for this product. Enter them manually.",
      }
    }

    return {
      kind: "ready" as const,
      message:
        "Length / BBS prefilled from customer measurements (editable).",
    }
  }, [
    open,
    userId,
    catId,
    embJsonString,
    fetchMeasurements,
    measurementsLoading,
    measurementsData,
  ])

  const materialOptions = useMemo(() => {
    const mapping =
      materialData?.getEmbroiderySampleMaterialMapping?.[0]?.map
    if (!Array.isArray(mapping)) return []
    return mapping
      .filter((m) => m?.name?.trim())
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [materialData])

  const [saveEmbroidery, { loading: saving }] = useMutation<
    SaveEmbroideryData,
    SaveEmbroideryVars
  >(SAVE_EMBROIDERY)

  // --- hydrate form once data is ready (do not mark done before emb loads) ---
  useEffect(() => {
    if (!open) {
      resetKeyRef.current = ""
      return
    }

    const ensureBootas = (values: EmbDesignFormValues) => {
      if (hasFrontAndBack) {
        if (values.front_bootas.length === 0) {
          values.front_bootas = [emptyBoota()]
        }
        if (values.bootas.length === 0) values.bootas = [emptyBoota()]
      } else if (hasBackOnly) {
        if (values.bootas.length === 0) values.bootas = [emptyBoota()]
      }
    }

    // Edit path: wait for GET_EMBROIDERY_BY_ID before hydrating
    if (embId?.trim()) {
      if (embLoading) return
      const detail = embData?.getEmbroideryById
      const key = detail?._id
        ? `id:${detail._id}:${fabColor}`
        : `id-miss:${embId}:${fabColor}`
      if (resetKeyRef.current === key) return
      resetKeyRef.current = key

      if (detail) {
        const values = resetEmbFormPayload(
          detail as unknown as Record<string, unknown>,
          fabColor
        )
        ensureBootas(values)
        reset(values)
      } else {
        const empty = emptyEmbDesignFormValues(fabColor)
        ensureBootas(empty)
        reset(empty)
        notify.warning(
          "Could not load embroidery design",
          "Previous details were not returned. You can still edit and save."
        )
      }
      return
    }

    // Draft path (before order save creates embroideryId)
    if (embJsonString?.trim()) {
      const key = `draft:${embJsonString}:${fabColor}`
      if (resetKeyRef.current === key) return
      resetKeyRef.current = key
      try {
        const parsed = JSON.parse(embJsonString) as Record<string, unknown>
        const values = resetEmbFormPayload(parsed, fabColor)
        ensureBootas(values)
        reset(values)
      } catch {
        const empty = emptyEmbDesignFormValues(fabColor)
        ensureBootas(empty)
        reset(empty)
      }
      return
    }

    // New empty design
    const key = `new:${catId}:${fabColor}`
    if (resetKeyRef.current === key) return
    resetKeyRef.current = key
    const empty = emptyEmbDesignFormValues(fabColor)
    ensureBootas(empty)
    reset(empty)
  }, [
    open,
    embId,
    embJsonString,
    fabColor,
    embData,
    embLoading,
    catId,
    hasFrontAndBack,
    hasBackOnly,
    reset,
  ])

  // Autofill Length / BBS from customer measurements (create/draft only)
  useEffect(() => {
    if (!open || !fetchMeasurements || measurementsLoading) return
    if (embJsonString?.trim() || embId?.trim()) return

    const options =
      measurementsData?.getUserMeasurements?.[0]?.options ?? []
    if (!options.length) return

    const config = getMeasurementConfigByCategory(catId)
    const updateData = processMeasurementOptions(options, config)
    if (!updateData.length && !updateData.bbs) return

    if (updateData.length) {
      setValue("length", String(updateData.length), {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
    if (updateData.bbs) {
      setValue("bbs", String(updateData.bbs), {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [
    open,
    fetchMeasurements,
    measurementsLoading,
    measurementsData,
    embJsonString,
    embId,
    catId,
    setValue,
  ])

  const uploadPath = `${EMB_IMAGE_UPLOAD_PATH}/${userId || embId || "draft"}`

  const handleUploadComplete = useCallback(
    (result: { successful?: Array<{ uploadURL?: string | null; response?: { uploadURL?: string | null } | null }> }) => {
      if (!uploadTarget) return
      const urls = uploadUrlsFromResult(result.successful)
      if (!urls.length) return

      const { fieldPath } = uploadTarget
      const newImages: EmbImageRef[] = urls.map((url) => ({ url }))

      const parts = fieldPath.split(".")
      if (parts.length === 1) {
        const current = getValues(
          fieldPath as keyof EmbDesignFormValues
        ) as unknown as EmbImageRef[]
        setValue(
          fieldPath as keyof EmbDesignFormValues,
          [...(current ?? []), ...newImages] as never
        )
      } else {
        // nested field arrays e.g. "front_bootas.0.referenceImages"
        const currentVal = getValues(fieldPath as never) as unknown as
          | EmbImageRef[]
          | undefined
        setValue(
          fieldPath as never,
          [...(currentVal ?? []), ...newImages] as never
        )
      }

      setUploadTarget(null)
    },
    [uploadTarget, getValues, setValue]
  )

  const onSubmit = async (data: EmbDesignFormValues) => {
    if (embId) {
      try {
        const body = getEmbFormPayload(data, workAreaOptions)
        await saveEmbroidery({ variables: { body, id: embId } })
        notify.success("Embroidery design saved")
        onOpenChange(false)
      } catch (err) {
        notify.fromError(err, "Failed to save embroidery design")
      }
    } else {
      const payload = getEmbFormPayload(data, workAreaOptions)
      onDraftSaved(JSON.stringify(payload))
      notify.success("Embroidery design draft saved")
      onOpenChange(false)
    }
  }

  const onInvalid = useCallback(
    (errs: FieldErrors<EmbDesignFormValues>) => {
      const messages = collectEmbDesignErrorMessages(
        errs as Record<string, unknown>
      )
      const preview = messages.slice(0, 3).join(" · ")
      notify.warning(
        "Please fill the required embroidery fields",
        messages.length > 3
          ? `${preview} · +${messages.length - 3} more`
          : preview || "Check highlighted fields below"
      )

      requestAnimationFrame(() => {
        const firstKey = Object.keys(errs)[0] as
          | keyof EmbDesignFormValues
          | undefined
        if (firstKey) {
          try {
            setFocus(firstKey)
          } catch {
            // some fields are Controllers without native focus targets
          }
        }
        const target =
          scrollBodyRef.current?.querySelector("[data-emb-field-error]") ??
          scrollBodyRef.current?.querySelector("[aria-invalid='true']")
        target?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    },
    [setFocus]
  )

  const loading = embLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={false}
      >
        <DialogHeader className="border-border flex shrink-0 flex-row items-start justify-between gap-3 border-b px-4 py-3 text-left">
          <div className="min-w-0">
            <DialogTitle className="truncate text-base">
              {embId ? "Edit embroidery design" : "Embroidery design"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
              {embId
                ? "Update the design details for this embroidery order"
                : "Add embroidery design details for this order item"}
            </DialogDescription>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 shrink-0"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </DialogHeader>

        <div
          ref={scrollBodyRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [overflow-anchor:none]"
        >
          {loading ? (
            <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading embroidery data…
            </div>
          ) : (
            <form
              id="emb-design-form"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void handleSubmit(onSubmit, onInvalid)(e)
              }}
              className="space-y-4"
              noValidate
            >
              {showValidationSummary ? (
                <div
                  className="border-destructive/40 bg-destructive/5 text-destructive sticky top-0 z-10 rounded-lg border px-3 py-2.5 text-sm shadow-sm"
                  role="alert"
                  data-emb-field-error=""
                >
                  <p className="font-medium">
                    Fix {errorMessages.length} required field
                    {errorMessages.length === 1 ? "" : "s"} before submitting
                  </p>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs">
                    {errorMessages.slice(0, 6).map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                    {errorMessages.length > 6 ? (
                      <li>+{errorMessages.length - 6} more…</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {/* 1 ── Design Reference Images */}
              <SectionCard title="Design Reference Images">
                <div className="flex flex-wrap gap-2">
                  {designImages.fields.map((field, idx) => (
                    <ImageTile
                      key={field.id}
                      url={(field as unknown as EmbImageRef).url}
                      onRemove={() => designImages.remove(idx)}
                    />
                  ))}
                  {designImages.fields.length < 3 && (
                    <button
                      type="button"
                      className="border-border hover:bg-muted/50 flex size-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs"
                      onClick={() =>
                        setUploadTarget({ fieldPath: "designReferenceImages" })
                      }
                    >
                      <ImagePlusIcon className="text-muted-foreground size-5" />
                      <span className="text-muted-foreground">Add</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="designRefNote" className="text-xs">
                    Note
                  </Label>
                  <Textarea
                    id="designRefNote"
                    rows={2}
                    className="min-h-[3rem] resize-y"
                    {...register("designReferenceImageNote")}
                  />
                </div>
              </SectionCard>

              {/* 2 ── Basic Details */}
              <SectionCard
                title="Basic Details"
                forceOpen={sectionsWithErrors.has("basic")}
                hasError={sectionsWithErrors.has("basic")}
              >
                {measurementStatus ? (
                  <div
                    className={cn(
                      "mb-2 rounded-md border px-3 py-2 text-xs",
                      measurementStatus.kind === "loading" ||
                        measurementStatus.kind === "ready"
                        ? "border-border bg-muted/30 text-muted-foreground"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                    )}
                    role="status"
                  >
                    {measurementStatus.kind === "loading" ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2Icon className="size-3.5 animate-spin" />
                        {measurementStatus.message}
                      </span>
                    ) : (
                      measurementStatus.message
                    )}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="length" className="text-xs">
                      Length *
                    </Label>
                    <Input
                      id="length"
                      aria-invalid={Boolean(errors.length)}
                      className={cn(errors.length && "border-destructive")}
                      {...register("length")}
                    />
                    <FieldError message={errors.length?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bbs" className="text-xs">
                      BBS *
                    </Label>
                    <Input
                      id="bbs"
                      aria-invalid={Boolean(errors.bbs)}
                      className={cn(errors.bbs && "border-destructive")}
                      {...register("bbs")}
                    />
                    <FieldError message={errors.bbs?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fabricName" className="text-xs">
                      Fabric Name
                    </Label>
                    <Input id="fabricName" {...register("fabricName")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fabricColor" className="text-xs">
                      Fabric Color
                    </Label>
                    <Input
                      id="fabricColor"
                      readOnly
                      className="bg-muted/40"
                      {...register("fabricColor")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="embType" className="text-xs">
                      Emb Type
                    </Label>
                    <Controller
                      control={control}
                      name="embType"
                      render={({ field }) => (
                        <select
                          id="embType"
                          className={selectClass}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">Select…</option>
                          {EMB_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="artworkType" className="text-xs">
                      Artwork
                    </Label>
                    <Controller
                      control={control}
                      name="artworkType"
                      render={({ field }) => (
                        <select
                          id="artworkType"
                          className={selectClass}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">Select…</option>
                          {ARTWORK_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* 3 ── Work Type */}
              <SectionCard
                title="Work Type *"
                forceOpen={sectionsWithErrors.has("workType")}
                hasError={sectionsWithErrors.has("workType")}
              >
                <Controller
                  control={control}
                  name="workType"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {WORK_TYPE_OPTIONS.map((wt) => {
                        const checked = field.value.includes(wt.value)
                        return (
                          <label
                            key={wt.value}
                            className="flex items-center gap-1.5 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="accent-primary size-4"
                              checked={checked}
                              onChange={() => {
                                const next = checked
                                  ? field.value.filter(
                                      (v: string) => v !== wt.value
                                    )
                                  : [...field.value, wt.value]
                                field.onChange(next)
                              }}
                            />
                            {wt.label}
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
                <FieldError message={errors.workType?.message} />
              </SectionCard>

              {/* 4 ── Work Area */}
              {workAreasRequired && (
                <SectionCard
                  title="Work Area *"
                  forceOpen={sectionsWithErrors.has("workArea")}
                  hasError={sectionsWithErrors.has("workArea")}
                >
                  <Controller
                    control={control}
                    name="workAreaIds"
                    render={({ field }) => (
                      <WorkAreaGroupedAutocomplete
                        options={workAreaOptions}
                        value={field.value}
                        onChange={field.onChange}
                        loading={areasLoading}
                        error={errors.workAreaIds?.message}
                        required
                      />
                    )}
                  />
                </SectionCard>
              )}

              {/* 5 ── Distances */}
              <SectionCard title="Distances">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DistanceField
                    label="Cuff Distance"
                    intName="cuff_distance"
                    fracName="cuff_distance_fraction"
                    control={control}
                    register={register}
                  />
                  <DistanceField
                    label="Daman Distance"
                    intName="daman_distance"
                    fracName="daman_distance_fraction"
                    control={control}
                    register={register}
                  />
                  <DistanceField
                    label="Placket Distance"
                    intName="placket_distance"
                    fracName="placket_distance_fraction"
                    control={control}
                    register={register}
                  />
                </div>
              </SectionCard>

              {/* 6 ── Bootas */}
              {showBootas && hasFrontAndBack && (
                <SectionCard title="Front Bootas">
                  <BootaList
                    fields={frontBootas.fields}
                    fieldArrayName="front_bootas"
                    control={control}
                    register={register}
                    onAdd={() => frontBootas.append(emptyBoota())}
                    onRemove={(i) => {
                      if (frontBootas.fields.length > 1)
                        frontBootas.remove(i)
                    }}
                    onUpload={(fieldPath) =>
                      setUploadTarget({ fieldPath })
                    }
                    watch={watch}
                    setValue={setValue}
                  />
                </SectionCard>
              )}
              {showBootas && (
                <SectionCard
                  title={hasFrontAndBack ? "Back Bootas" : "Bootas"}
                >
                  <BootaList
                    fields={backBootas.fields}
                    fieldArrayName="bootas"
                    control={control}
                    register={register}
                    onAdd={() => backBootas.append(emptyBoota())}
                    onRemove={(i) => {
                      if (backBootas.fields.length > 1)
                        backBootas.remove(i)
                    }}
                    onUpload={(fieldPath) =>
                      setUploadTarget({ fieldPath })
                    }
                    watch={watch}
                    setValue={setValue}
                  />
                </SectionCard>
              )}

              {/* 7 ── Monograms */}
              <SectionCard title="Monograms" defaultOpen={false}>
                {monogramsArr.fields.map((field, idx) => (
                  <MonogramEntry
                    key={field.id}
                    index={idx}
                    control={control}
                    register={register}
                    positions={monogramPositions}
                    colorByName={colorByName}
                    onRemove={() => monogramsArr.remove(idx)}
                    onUpload={(fieldPath) =>
                      setUploadTarget({ fieldPath })
                    }
                    watch={watch}
                    setValue={setValue}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => monogramsArr.append(emptyMonogram())}
                >
                  <PlusIcon className="mr-1 size-3.5" />
                  Add monogram
                </Button>
              </SectionCard>

              {/* 8 ── Work Material Samples */}
              <SectionCard
                title="Work Material Samples *"
                forceOpen={sectionsWithErrors.has("materials")}
                hasError={sectionsWithErrors.has("materials")}
              >
                {samplesArr.fields.map((field, sampleIdx) => (
                  <SampleEntry
                    key={field.id}
                    sampleIdx={sampleIdx}
                    control={control}
                    register={register}
                    materialOptions={materialOptions}
                    errors={errors}
                    onRemoveSample={() => {
                      if (samplesArr.fields.length > 1)
                        samplesArr.remove(sampleIdx)
                    }}
                    watch={watch}
                    setValue={setValue}
                  />
                ))}
                <FieldError message={errors.workMaterialSamples?.message} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => samplesArr.append(emptyMaterialSample())}
                  >
                    <PlusIcon className="mr-1 size-3.5" />
                    Add sample
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const samples = getValues("workMaterialSamples") ?? []
                      if (!samples.length) return
                      const last = samples[samples.length - 1]
                      const cloned = JSON.parse(
                        JSON.stringify(last)
                      ) as (typeof samples)[number]
                      samplesArr.append({
                        note: cloned.note || "",
                        attributes:
                          cloned.attributes?.length > 0
                            ? cloned.attributes.map((a) => ({
                                name: a.name || "",
                                label: a.label || "",
                                color: a.color || "",
                                colorId: a.colorId || "",
                                customColor: a.customColor || "",
                                note: a.note || "",
                              }))
                            : [emptyMaterialAttribute()],
                      })
                    }}
                  >
                    Duplicate above sample
                  </Button>
                </div>
              </SectionCard>
            </form>
          )}
        </div>

        <DialogFooter className="border-border shrink-0 justify-end gap-2 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="emb-design-form"
            disabled={loading || saving}
          >
            {saving ? (
              <>
                <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <UppyFileUpload
        open={!!uploadTarget}
        uploadPath={uploadPath}
        maxNumberOfFiles={3}
        onClose={() => setUploadTarget(null)}
        onCompleted={handleUploadComplete}
      />
    </Dialog>
  )
}

// ─── Distance sub-component ───────────────────────────────────────────

function DistanceField({
  label,
  intName,
  fracName,
  control,
  register,
}: {
  label: string
  intName: "cuff_distance" | "daman_distance" | "placket_distance"
  fracName:
    | "cuff_distance_fraction"
    | "daman_distance_fraction"
    | "placket_distance_fraction"
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  register: ReturnType<typeof useForm<EmbDesignFormValues>>["register"]
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          className="flex-1"
          {...register(intName)}
        />
        <Controller
          control={control}
          name={fracName}
          render={({ field }) => (
            <select
              className={cn(selectClass, "w-24")}
              value={String(field.value)}
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {FRACTION_OPTIONS.map((f) => (
                <option key={f.name} value={String(f.value)}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
        />
      </div>
    </div>
  )
}

// ─── Boota sub-components ─────────────────────────────────────────────

function BootaList({
  fields,
  fieldArrayName,
  control,
  register,
  onAdd,
  onRemove,
  onUpload,
  watch,
  setValue,
}: {
  fields: Array<Record<string, unknown> & { id: string }>
  fieldArrayName: "front_bootas" | "bootas"
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  register: ReturnType<typeof useForm<EmbDesignFormValues>>["register"]
  onAdd: () => void
  onRemove: (i: number) => void
  onUpload: (fieldPath: string) => void
  watch: ReturnType<typeof useForm<EmbDesignFormValues>>["watch"]
  setValue: ReturnType<typeof useForm<EmbDesignFormValues>>["setValue"]
}) {
  return (
    <>
      {fields.map((field, idx) => (
        <BootaEntry
          key={field.id}
          index={idx}
          prefix={fieldArrayName}
          control={control}
          register={register}
          onRemove={() => onRemove(idx)}
          onUpload={onUpload}
          watch={watch}
          setValue={setValue}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <PlusIcon className="mr-1 size-3.5" />
        Add boota
      </Button>
    </>
  )
}

function BootaEntry({
  index,
  prefix,
  control,
  register,
  onRemove,
  onUpload,
  watch,
  setValue,
}: {
  index: number
  prefix: "front_bootas" | "bootas"
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  register: ReturnType<typeof useForm<EmbDesignFormValues>>["register"]
  onRemove: () => void
  onUpload: (fieldPath: string) => void
  watch: ReturnType<typeof useForm<EmbDesignFormValues>>["watch"]
  setValue: ReturnType<typeof useForm<EmbDesignFormValues>>["setValue"]
}) {
  const base = `${prefix}.${index}` as const
  const images = (watch(`${base}.referenceImages` as never) ?? []) as EmbImageRef[]

  return (
    <div className="bg-muted/30 space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Boota {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      {/* images */}
      <div className="flex flex-wrap gap-2">
        {images.map((img, imgIdx) => (
          <ImageTile
            key={imgIdx}
            url={img.url}
            onRemove={() => {
              const next = images.filter((_, i) => i !== imgIdx)
              setValue(`${base}.referenceImages` as never, next as never)
            }}
          />
        ))}
        <button
          type="button"
          className="border-border hover:bg-muted/50 flex size-16 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed text-xs"
          onClick={() => onUpload(`${base}.referenceImages`)}
        >
          <ImagePlusIcon className="text-muted-foreground size-4" />
        </button>
      </div>

      <Textarea
        rows={1}
        className="min-h-[2rem] resize-y"
        placeholder="Note"
        {...register(`${base}.note` as never)}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-[11px]">Size V</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="flex-1"
              {...register(`${base}.size1V` as never)}
            />
            <FractionSelect
              control={control}
              name={`${base}.fractionSize1V` as never}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Size H</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="flex-1"
              {...register(`${base}.size1H` as never)}
            />
            <FractionSelect
              control={control}
              name={`${base}.fractionSize1H` as never}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Dist C2C V</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="flex-1"
              {...register(`${base}.distance1C2CV` as never)}
            />
            <FractionSelect
              control={control}
              name={`${base}.fractionDistance1C2CV` as never}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Dist C2C H</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="flex-1"
              {...register(`${base}.distance1C2CH` as never)}
            />
            <FractionSelect
              control={control}
              name={`${base}.fractionDistance1C2CH` as never}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Back Size V</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="flex-1"
              {...register(`${base}.backSizeV` as never)}
            />
            <FractionSelect
              control={control}
              name={`${base}.fractionBackSizeV` as never}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Back Size H</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              className="flex-1"
              {...register(`${base}.backSizeH` as never)}
            />
            <FractionSelect
              control={control}
              name={`${base}.fractionBackSizeH` as never}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FractionSelect({
  control,
  name,
}: {
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  name: never
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <select
          className={cn(selectClass, "w-20 px-1.5 text-xs")}
          value={String(field.value ?? "ZERO")}
          onChange={field.onChange}
        >
          <option value="ZERO">0</option>
          <option value="ONE_FOURTH">1/4</option>
          <option value="ONE_HALF">1/2</option>
          <option value="THREE_FOURTH">3/4</option>
        </select>
      )}
    />
  )
}

// ─── Monogram sub-component ──────────────────────────────────────────

function MonogramEntry({
  index,
  control,
  register,
  positions,
  colorByName,
  onRemove,
  onUpload,
  watch,
  setValue,
}: {
  index: number
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  register: ReturnType<typeof useForm<EmbDesignFormValues>>["register"]
  positions: Array<{ name: string; value: string }>
  colorByName: Map<string, { _id?: string | null; colorname?: string | null }>
  onRemove: () => void
  onUpload: (fieldPath: string) => void
  watch: ReturnType<typeof useForm<EmbDesignFormValues>>["watch"]
  setValue: ReturnType<typeof useForm<EmbDesignFormValues>>["setValue"]
}) {
  const base = `monograms.${index}` as const
  const images = (watch(`${base}.referenceImages` as never) ?? []) as EmbImageRef[]

  return (
    <div className="bg-muted/30 space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Monogram {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      {/* images */}
      <div className="flex flex-wrap gap-2">
        {images.map((img, imgIdx) => (
          <ImageTile
            key={imgIdx}
            url={img.url}
            onRemove={() => {
              const next = images.filter((_, i) => i !== imgIdx)
              setValue(`${base}.referenceImages` as never, next as never)
            }}
          />
        ))}
        <button
          type="button"
          className="border-border hover:bg-muted/50 flex size-16 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed text-xs"
          onClick={() => onUpload(`${base}.referenceImages`)}
        >
          <ImagePlusIcon className="text-muted-foreground size-4" />
        </button>
      </div>

      <Textarea
        rows={1}
        className="min-h-[2rem] resize-y"
        placeholder="Note"
        {...register(`${base}.note` as never)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">V Size</Label>
          <Input
            type="number"
            {...register(`${base}.vsize` as never)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">H Size</Label>
          <Input
            type="number"
            {...register(`${base}.hsize` as never)}
          />
        </div>
        <div className="col-span-2 space-y-1 sm:col-span-1">
          <Controller
            control={control}
            name={`${base}.color` as never}
            render={({ field }) => (
              <ColorsAutocomplete
                label="Color"
                value={field.value as string}
                onChange={(colorname) => {
                  field.onChange(colorname)
                  const entry = colorByName.get(
                    colorname.trim().toLowerCase()
                  )
                  setValue(
                    `${base}.colorId` as never,
                    (entry?._id ?? "") as never
                  )
                }}
              />
            )}
          />
        </div>
      </div>

      {/* Positions multi-checkbox */}
      <div className="space-y-1.5">
        <Label className="text-xs">Positions</Label>
        <Controller
          control={control}
          name={`${base}.positions` as never}
          render={({ field }) => {
            const selected = (field.value ?? []) as string[]
            return (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {positions.map((pos) => {
                  const checked = selected.includes(pos.value)
                  return (
                    <label
                      key={pos.value}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-primary size-3.5"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? selected.filter((v) => v !== pos.value)
                            : [...selected, pos.value]
                          field.onChange(next)
                        }}
                      />
                      {pos.name}
                    </label>
                  )
                })}
              </div>
            )
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Shade Number</Label>
          <Input {...register(`${base}.shadeNumber` as never)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Shade Card</Label>
          <Input {...register(`${base}.shadeCard` as never)} />
        </div>
      </div>
    </div>
  )
}

// ─── Work Material Sample sub-component ──────────────────────────────

function SampleEntry({
  sampleIdx,
  control,
  register,
  materialOptions,
  errors,
  onRemoveSample,
  watch,
  setValue,
}: {
  sampleIdx: number
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  register: ReturnType<typeof useForm<EmbDesignFormValues>>["register"]
  materialOptions: Array<{
    name?: string | null
    label?: string | null
    sortOrder?: number | null
  }>
  errors: ReturnType<typeof useForm<EmbDesignFormValues>>["formState"]["errors"]
  onRemoveSample: () => void
  watch: ReturnType<typeof useForm<EmbDesignFormValues>>["watch"]
  setValue: ReturnType<typeof useForm<EmbDesignFormValues>>["setValue"]
}) {
  const base = `workMaterialSamples.${sampleIdx}` as const
  const attributes = (watch(`${base}.attributes` as never) ??
    []) as Array<{ name: string; label: string; color: string; colorId: string; customColor: string; note: string }>

  return (
    <div className="bg-muted/30 space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Sample {sampleIdx + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemoveSample}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Sample Note</Label>
        <Textarea
          rows={2}
          className="min-h-9 resize-y text-sm"
          {...register(`${base}.note` as never)}
        />
      </div>

      {attributes.map((_, attrIdx) => (
        <MaterialAttributeRow
          key={attrIdx}
          sampleIdx={sampleIdx}
          attrIdx={attrIdx}
          control={control}
          register={register}
          materialOptions={materialOptions}
          onRemove={() => {
            if (attributes.length > 1) {
              const next = attributes.filter((__, i) => i !== attrIdx)
              setValue(`${base}.attributes` as never, next as never)
            }
          }}
          watch={watch}
          setValue={setValue}
        />
      ))}

      <FieldError
        message={
          (
            errors.workMaterialSamples?.[sampleIdx] as
              | { attributes?: { message?: string } }
              | undefined
          )?.attributes?.message
        }
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const current = attributes
          setValue(`${base}.attributes` as never, [
            ...current,
            emptyMaterialAttribute(),
          ] as never)
        }}
      >
        <PlusIcon className="mr-1 size-3.5" />
        Add material
      </Button>
    </div>
  )
}

function MaterialAttributeRow({
  sampleIdx,
  attrIdx,
  control,
  register,
  materialOptions,
  onRemove,
  watch,
  setValue,
}: {
  sampleIdx: number
  attrIdx: number
  control: ReturnType<typeof useForm<EmbDesignFormValues>>["control"]
  register: ReturnType<typeof useForm<EmbDesignFormValues>>["register"]
  materialOptions: Array<{
    name?: string | null
    label?: string | null
    sortOrder?: number | null
  }>
  onRemove: () => void
  watch: ReturnType<typeof useForm<EmbDesignFormValues>>["watch"]
  setValue: ReturnType<typeof useForm<EmbDesignFormValues>>["setValue"]
}) {
  const base =
    `workMaterialSamples.${sampleIdx}.attributes.${attrIdx}` as const

  const selectedMaterialName =
    (watch(`${base}.name` as never) as unknown as string) || ""
  const availableColors = useMemo(
    () => colorsForMaterial(selectedMaterialName),
    [selectedMaterialName]
  )

  return (
    <div className="bg-background space-y-2 rounded border p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          Material {attrIdx + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7"
          onClick={onRemove}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Material Name</Label>
          <Controller
            control={control}
            name={`${base}.name` as never}
            render={({ field }) => (
              <select
                className={selectClass}
                value={field.value as string}
                onChange={(e) => {
                  const nextName = e.target.value
                  field.onChange(nextName)
                  const opt = materialOptions.find((m) => m.name === nextName)
                  setValue(
                    `${base}.label` as never,
                    (opt?.label || opt?.name || nextName) as never
                  )
                  // Legacy: clear color when material type changes
                  setValue(`${base}.color` as never, "" as never)
                  setValue(`${base}.colorId` as never, "" as never)
                }}
              >
                <option value="">Select…</option>
                {materialOptions.map((m) => (
                  <option key={m.name} value={m.name ?? ""}>
                    {m.label || m.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Color</Label>
          <Controller
            control={control}
            name={`${base}.colorId` as never}
            render={({ field }) => (
              <select
                className={selectClass}
                value={(field.value as string) || ""}
                disabled={!selectedMaterialName || availableColors.length === 0}
                onChange={(e) => {
                  const nextId = e.target.value
                  field.onChange(nextId)
                  const match = availableColors.find((c) => c._id === nextId)
                  setValue(
                    `${base}.color` as never,
                    (match?.colorname || "") as never
                  )
                }}
              >
                <option value="">
                  {!selectedMaterialName
                    ? "Select material first"
                    : availableColors.length === 0
                      ? "No colors for this material"
                      : "Select color…"}
                </option>
                {availableColors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.label || c.colorname}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Add Custom Colour Here</Label>
          <Input
            className="h-9 text-sm"
            placeholder="Custom colour"
            {...register(`${base}.customColor` as never)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Note</Label>
          <Input
            className="h-9 text-sm"
            {...register(`${base}.note` as never)}
          />
        </div>
      </div>
    </div>
  )
}
