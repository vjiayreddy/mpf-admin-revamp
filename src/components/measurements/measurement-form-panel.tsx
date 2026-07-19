"use client"

import {
  MEASUREMENT_APPROVAL_OPTIONS,
  MEASUREMENT_FRACTION_OPTIONS,
  MEASUREMENT_METERS_DIGIT_OPTIONS,
  MEASUREMENT_PANNA_SIZE_OPTIONS,
  MEASUREMENT_REMARK_OPTIONS,
  MEASUREMENT_TAILORED_BY,
} from "@/config/measurement-hub"
import { MEASUREMENT_CATEGORY_LIST, MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { MeasurementLoadStatusDialog } from "@/components/measurements/measurement-load-status-dialog"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAllStylists } from "@/hooks/use-all-stylists"
import {
  GET_USER_MEASUREMENTS,
  SAVE_USER_MEASUREMENT,
  type GetUserMeasurementsData,
  type GetUserMeasurementsVars,
  type SaveUserMeasurementData,
  type SaveUserMeasurementVars,
} from "@/lib/apollo/queries/measurements"
import { isoToDateInput, startDateFilter } from "@/lib/customers/date-filter"
import { buildSavePayload } from "@/lib/measurements/build-save-payload"
import {
  applyCommonMeasurements,
  needsShirtCommon,
  needsTrouserCommon,
} from "@/lib/measurements/common-measurements"
import {
  measurementAttributeOptionsChanged,
  toOptionNameValues,
  type OptionNameValue,
} from "@/lib/measurements/options-changed"
import { getFabricBodyMetrics } from "@/lib/measurements/fabric-body-metrics"
import {
  applyFieldChange,
  loadCombinedValue,
} from "@/lib/measurements/formula-engine"
import { snapToQuarterFraction } from "@/lib/measurements/format-measurement-value"
import {
  applyFormulasOnLoad,
  fieldHasFormulaBadge,
} from "@/lib/measurements/legacy-formula-engine"
import {
  defaultLoadSteps,
  markAll,
  markStep,
  shirtCommonLoadSteps,
  suitCommonLoadSteps,
  trouserCommonLoadSteps,
  type MeasurementLoadStep,
} from "@/lib/measurements/load-status"
import { getMeasurementSchema } from "@/lib/measurements/schemas"
import type { MeasurementFieldDef } from "@/lib/measurements/field-types"
import { validateMeasurementFormValues } from "@/lib/measurements/validate-measurement-form"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, InfoIcon, SigmaIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"

const sectionClass = "bg-card flex flex-col gap-3 rounded-lg border p-4"
const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type MeasurementFormPanelProps = {
  userId: string
  initialCatId?: string | null
}

function valuesFromOptions(
  options: { name?: string | null; value?: string | number | null; isUpdateManually?: boolean | null }[] | null | undefined
): Record<string, number | boolean> {
  const values: Record<string, number | boolean> = {}
  for (const opt of options ?? []) {
    if (!opt.name) continue
    // Prefer original value so legacy digit codes (e.g. "38.3" / 38.3) decode correctly
    loadCombinedValue(values as Record<string, number>, opt.name, opt.value)
    if (typeof opt.isUpdateManually === "boolean") {
      values[`${opt.name}_isUpdateManually`] = opt.isUpdateManually
    }
  }
  return values
}

export function MeasurementFormPanel({
  userId,
  initialCatId,
}: MeasurementFormPanelProps) {
  const [catId, setCatId] = useState(
    initialCatId || MEASUREMENT_CATEGORY_LIST[0]?.value || ""
  )
  const [values, setValues] = useState<Record<string, number | boolean | string>>(
    {}
  )
  const [measuredBy, setMeasuredBy] = useState("self")
  const [remarks, setRemarks] = useState("")
  const [isDyable, setIsDyable] = useState(false)
  const [note, setNote] = useState("")
  const [pannaSize, setPannaSize] = useState("")
  const [mtr1, setMtr1] = useState("0")
  const [mtr2, setMtr2] = useState("0")
  const [approvedStatus, setApprovedStatus] = useState("PENDING")
  const [approvedBy, setApprovedBy] = useState("")
  const [approvedDate, setApprovedDate] = useState("")
  const [fabricOpen, setFabricOpen] = useState(true)
  const [existingId, setExistingId] = useState<string | undefined>()
  /** Loaded attribute options; used to decide create vs update on save. */
  const [savedOptionsBaseline, setSavedOptionsBaseline] = useState<
    OptionNameValue[] | null
  >(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loadOpen, setLoadOpen] = useState(false)
  const [loadBusy, setLoadBusy] = useState(false)
  const [loadSteps, setLoadSteps] = useState<MeasurementLoadStep[]>(
    defaultLoadSteps()
  )

  const { stylists, loading: stylistsLoading } = useAllStylists()
  const schema = useMemo(() => getMeasurementSchema(catId), [catId])
  const fabricMetrics = useMemo(() => getFabricBodyMetrics(values), [values])

  const [fetchMeasurement, { loading: loadingMeas }] = useLazyQuery<
    GetUserMeasurementsData,
    GetUserMeasurementsVars
  >(GET_USER_MEASUREMENTS, { fetchPolicy: "network-only" })

  const [saveMeasurement, { loading: saving }] = useMutation<
    SaveUserMeasurementData,
    SaveUserMeasurementVars
  >(SAVE_USER_MEASUREMENT)

  useEffect(() => {
    if (initialCatId) setCatId(initialCatId)
  }, [initialCatId])

  useEffect(() => {
    let cancelled = false

    async function loadForm() {
      const schemaForCat = getMeasurementSchema(catId)
      const wantShirt = needsShirtCommon(catId)
      const wantTrouser = needsTrouserCommon(catId)
      const isSuit = catId === MEASUREMENT_CATEGORIES.SUIT

      let steps = defaultLoadSteps()
      if (isSuit) steps = suitCommonLoadSteps()
      else if (wantShirt && !wantTrouser) steps = shirtCommonLoadSteps()
      else if (wantTrouser && !wantShirt) steps = trouserCommonLoadSteps()

      // Clear previous category immediately so old field values don't flash
      setValues({})
      setExistingId(undefined)
      setSavedOptionsBaseline(null)
      setMeasuredBy("self")
      setRemarks("")
      setIsDyable(false)
      setNote("")
      setPannaSize("")
      setMtr1("0")
      setMtr2("0")
      setApprovedStatus("PENDING")
      setApprovedBy("")
      setApprovedDate("")
      setSubmitError(null)
      setFieldErrors({})

      setLoadSteps(steps)
      setLoadOpen(true)
      setLoadBusy(true)

      try {
        const result = await fetchMeasurement({
          variables: { userId, catId, page: 1, limit: 1 },
        })
        if (cancelled) return

        const row = result.data?.getUserMeasurements?.[0]

        if (row) {
          setLoadSteps((s) =>
            markStep(markStep(s, "fetch", "done"), "defaults", "done")
          )
          setExistingId(row._id ?? undefined)
          setMeasuredBy(row.measuredBy || "self")
          setRemarks(row.remarks || "")
          setIsDyable(Boolean(row.isDyable))
          setNote(row.note || "")
          setPannaSize(row.pannaSize != null ? String(row.pannaSize) : "")
          setApprovedStatus(row.approvedStatus || "PENDING")
          setApprovedBy(
            row.approvedByStylist?._id || row.approvedBy || ""
          )
          setApprovedDate(
            isoToDateInput(row.approvedDate?.timestamp ?? null)
          )
          const meters = String(row.noOfMeters ?? "0")
          const [a, b] = meters.split(".")
          setMtr1(a || "0")
          setMtr2(b || "0")
          const hydrated = valuesFromOptions(row.options)
          setLoadSteps((s) =>
            markStep(markStep(s, "defaults", "done"), "formulas", "pending")
          )
          const withFormulas = schemaForCat
            ? applyFormulasOnLoad(schemaForCat.options, hydrated)
            : hydrated
          setValues(withFormulas)
          // Baseline from hydrated form (not raw API) so formula fill doesn't
          // look like an attribute change on the next save.
          if (schemaForCat) {
            const baselinePayload = buildSavePayload({
              schema: schemaForCat,
              formValues: withFormulas,
              userId,
            })
            setSavedOptionsBaseline(
              toOptionNameValues(baselinePayload.updatedOptions)
            )
          } else {
            setSavedOptionsBaseline(toOptionNameValues(row.options))
          }
          setLoadSteps((s) => markStep(s, "formulas", "done"))
        } else {
          setSavedOptionsBaseline(null)
          let seeded: Record<string, number | boolean> = {}

          if (isSuit) {
            setLoadSteps((s) => markStep(s, "fetch-shirt", "pending"))
            const [shirtRes, trouserRes] = await Promise.all([
              fetchMeasurement({
                variables: {
                  userId,
                  catId: MEASUREMENT_CATEGORIES.SHIRT,
                  page: 1,
                  limit: 1,
                },
              }),
              fetchMeasurement({
                variables: {
                  userId,
                  catId: MEASUREMENT_CATEGORIES.TROUSER,
                  page: 1,
                  limit: 1,
                },
              }),
            ])
            if (cancelled) return
            setLoadSteps((s) =>
              markStep(markStep(s, "fetch-shirt", "done"), "fetch-trouser", "done")
            )
            const shirtOpts = shirtRes.data?.getUserMeasurements?.[0]?.options
            const trouserOpts =
              trouserRes.data?.getUserMeasurements?.[0]?.options
            seeded = applyCommonMeasurements(shirtOpts, "shirt", seeded)
            seeded = applyCommonMeasurements(trouserOpts, "trouser", seeded)
            setLoadSteps((s) => markStep(s, "apply-common", "done"))
          } else if (wantShirt) {
            setLoadSteps((s) => markStep(s, "fetch-shirt", "pending"))
            const shirtRes = await fetchMeasurement({
              variables: {
                userId,
                catId: MEASUREMENT_CATEGORIES.SHIRT,
                page: 1,
                limit: 1,
              },
            })
            if (cancelled) return
            setLoadSteps((s) => markStep(s, "fetch-shirt", "done"))
            const shirtOpts = shirtRes.data?.getUserMeasurements?.[0]?.options
            if (shirtOpts?.length) {
              seeded = applyCommonMeasurements(shirtOpts, "shirt", seeded)
              setLoadSteps((s) => markStep(s, "apply-shirt", "done"))
            } else {
              setLoadSteps((s) => markStep(s, "apply-shirt", "none"))
            }
          } else if (wantTrouser) {
            setLoadSteps((s) => markStep(s, "fetch-trouser", "pending"))
            const trouserRes = await fetchMeasurement({
              variables: {
                userId,
                catId: MEASUREMENT_CATEGORIES.TROUSER,
                page: 1,
                limit: 1,
              },
            })
            if (cancelled) return
            setLoadSteps((s) => markStep(s, "fetch-trouser", "done"))
            const trouserOpts =
              trouserRes.data?.getUserMeasurements?.[0]?.options
            if (trouserOpts?.length) {
              seeded = applyCommonMeasurements(trouserOpts, "trouser", seeded)
              setLoadSteps((s) => markStep(s, "apply-trouser", "done"))
            } else {
              setLoadSteps((s) => markStep(s, "apply-trouser", "none"))
            }
          } else {
            setLoadSteps((s) =>
              markStep(markStep(s, "fetch", "none"), "defaults", "done")
            )
          }

          setValues(
            schemaForCat
              ? applyFormulasOnLoad(schemaForCat.options, seeded)
              : seeded
          )
          setLoadSteps((s) => markStep(s, "formulas", "done"))
        }
      } catch {
        if (!cancelled) {
          setLoadSteps((s) => markAll(s, "error"))
          setValues(
            schemaForCat ? applyFormulasOnLoad(schemaForCat.options, {}) : {}
          )
        }
      } finally {
        if (!cancelled) {
          setLoadBusy(false)
          // Brief pause so user can see completed checklist, then auto-close
          window.setTimeout(() => {
            if (!cancelled) setLoadOpen(false)
          }, 900)
        }
      }
    }

    void loadForm()
    return () => {
      cancelled = true
    }
  }, [userId, catId, fetchMeasurement])

  const onFieldChange = useCallback(
    (field: MeasurementFieldDef, inchOrSize: "inch" | "size", raw: string) => {
      if (!schema) return
      const key = inchOrSize === "inch" ? field.name : `${field.name}_size`
      const next: Record<string, number | boolean> = {}
      for (const [k, v] of Object.entries(values)) {
        if (typeof v === "number" || typeof v === "boolean") next[k] = v
      }
      next[key] = Number(raw) || 0
      const computed = applyFieldChange(schema.options, next, key)
      setValues((prev) => ({ ...prev, ...computed }))
      setFieldErrors((prev) => {
        if (!prev[field.name]) return prev
        const { [field.name]: _, ...rest } = prev
        return rest
      })
    },
    [schema, values]
  )

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!schema) {
      const msg = "No field schema for this category."
      setSubmitError(msg)
      notify.error(msg)
      return
    }

    const validationErrors = validateMeasurementFormValues(
      schema.options,
      values
    )
    if (validationErrors.length) {
      const map: Record<string, string> = {}
      for (const err of validationErrors) {
        if (!map[err.name]) map[err.name] = err.message
      }
      setFieldErrors(map)
      const msg = `Please fix ${validationErrors.length} invalid field${
        validationErrors.length === 1 ? "" : "s"
      } before saving.`
      setSubmitError(msg)
      notify.warning(msg)
      // Scroll to first invalid measurement field
      const first = validationErrors[0]?.name
      if (first) {
        document
          .getElementById(`meas-field-${first}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setFieldErrors({})
    setSubmitError(null)
    try {
      // Build without _id first; attach only when options are unchanged (legacy NewForm).
      const payload = buildSavePayload({
        schema,
        formValues: {
          ...values,
          mtr_1: mtr1,
          mtr_2: mtr2,
          pannaSize,
          note,
          approvedStatus,
          approvedBy,
          approvedDate: approvedDate
            ? startDateFilter(approvedDate)
            : null,
        },
        userId,
        measuredBy,
        isDyable,
        remarks: remarks || null,
      })

      const optionsChanged = measurementAttributeOptionsChanged(
        toOptionNameValues(payload.updatedOptions),
        savedOptionsBaseline
      )
      // Attribute change → create new record. Meta-only → update existing.
      const isUpdate = Boolean(existingId && !optionsChanged)
      if (isUpdate) {
        payload._id = existingId
      }

      await saveMeasurement({ variables: { userMeasurements: payload } })

      // Keep baseline aligned with what we just saved (form-derived values).
      setSavedOptionsBaseline(toOptionNameValues(payload.updatedOptions))

      if (!isUpdate) {
        // Created a new row — pick up its _id for subsequent meta-only updates.
        const result = await fetchMeasurement({
          variables: { userId, catId, page: 1, limit: 1 },
        })
        setExistingId(result.data?.getUserMeasurements?.[0]?._id ?? undefined)
      }

      notify.success(
        isUpdate ? "Measurement updated" : "Measurement saved",
        isUpdate
          ? "Existing record was updated."
          : "A new measurement record was created."
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save measurement"
      setSubmitError(msg)
      notify.fromError(err, "Failed to save measurement")
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <MeasurementLoadStatusDialog
        open={loadOpen}
        loading={loadBusy}
        steps={loadSteps}
        onClose={() => setLoadOpen(false)}
      />
      <section className={sectionClass}>
        <h2 className="text-sm font-semibold tracking-tight">Category</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="catId">Garment</Label>
            <select
              id="catId"
              className={selectClass}
              value={catId}
              onChange={(e) => setCatId(e.target.value)}
            >
              {MEASUREMENT_CATEGORY_LIST.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="measuredBy">Measured by</Label>
            <select
              id="measuredBy"
              className={selectClass}
              value={measuredBy}
              onChange={(e) => setMeasuredBy(e.target.value)}
            >
              {MEASUREMENT_TAILORED_BY.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <select
              id="remarks"
              className={selectClass}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            >
              <option value="">Select</option>
              {MEASUREMENT_REMARK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loadingMeas ? <Skeleton className="h-40 w-full" /> : null}

      {schema ? (
        <section className={sectionClass}>
          <h2 className="text-sm font-semibold tracking-tight">
            Measurement fields
          </h2>
          {/* Legacy: each options[] group is one worksheet row; md=2 → 6 cols */}
          <div className="flex flex-col gap-3">
            {schema.options.map((group, gi) => (
              <div
                key={`group-${gi}`}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              >
                {group.map((field) => {
                  const inch = Number(values[field.name]) || 0
                  const size = snapToQuarterFraction(
                    Number(values[`${field.name}_size`]) || 0
                  )
                  const hasFormula = fieldHasFormulaBadge(field)
                  const errorMsg = fieldErrors[field.name]
                  return (
                    <div
                      id={`meas-field-${field.name}`}
                      key={field.name}
                      className={cn(
                        "flex h-full flex-col gap-1.5 rounded-md border p-2.5",
                        field.isRequired && !errorMsg && "border-sky-200 bg-sky-50",
                        errorMsg && "border-destructive bg-destructive/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <Label className="text-[11px] leading-tight font-semibold">
                          {field.label}
                          {field.isRequired ? (
                            <span className="text-destructive ml-0.5">*</span>
                          ) : null}
                        </Label>
                        <span
                          className="text-muted-foreground shrink-0"
                          title={hasFormula ? "Formula field" : "Field info"}
                        >
                          {hasFormula ? (
                            <SigmaIcon className="size-3.5" aria-hidden />
                          ) : (
                            <InfoIcon className="size-3.5" aria-hidden />
                          )}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <Input
                          type="number"
                          step="1"
                          placeholder="Inch"
                          className={cn(
                            "h-8 px-1.5 text-sm",
                            errorMsg && "border-destructive"
                          )}
                          value={inch || ""}
                          disabled={field.canBeEdited === false}
                          aria-invalid={Boolean(errorMsg)}
                          onChange={(e) =>
                            onFieldChange(field, "inch", e.target.value)
                          }
                        />
                        <select
                          className={cn(selectClass, "h-8 w-[4.5rem] shrink-0")}
                          aria-label={`${field.label} fraction`}
                          value={String(size)}
                          disabled={field.canBeEdited === false}
                          onChange={(e) =>
                            onFieldChange(field, "size", e.target.value)
                          }
                        >
                          {MEASUREMENT_FRACTION_OPTIONS.map((opt) => (
                            <option key={opt.label} value={String(opt.value)}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errorMsg ? (
                        <p className="text-destructive text-[10px] leading-tight">
                          {errorMsg}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="bg-card rounded-lg border p-4 text-sm">
          <p className="font-medium">No schema for this category</p>
          <p className="text-muted-foreground mt-1">
            Choose another garment category to edit measurements.
          </p>
        </div>
      )}

      <Collapsible open={fabricOpen} onOpenChange={setFabricOpen}>
        <section className={cn(sectionClass, "gap-0 overflow-hidden p-0")}>
          <CollapsibleTrigger
            type="button"
            className="bg-teal-50 hover:bg-teal-100/80 flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors"
          >
            <h2 className="text-sm font-semibold tracking-tight">
              Fabric Requirement
            </h2>
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                fabricOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 border-t">
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="pannaSize">Panna size</Label>
                <select
                  id="pannaSize"
                  className={selectClass}
                  value={pannaSize}
                  onChange={(e) => setPannaSize(e.target.value)}
                >
                  {MEASUREMENT_PANNA_SIZE_OPTIONS.map((o) => (
                    <option key={o.label} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bodyMax">Body max</Label>
                <Input
                  id="bodyMax"
                  type="number"
                  readOnly
                  className="bg-muted/40"
                  value={fabricMetrics.bodyMax || ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bodyLength">Length</Label>
                <Input
                  id="bodyLength"
                  type="number"
                  readOnly
                  className="bg-muted/40"
                  value={fabricMetrics.bodyLength || ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sleeveLength">Sleeve length</Label>
                <Input
                  id="sleeveLength"
                  type="number"
                  readOnly
                  className="bg-muted/40"
                  value={fabricMetrics.sleeveLength || ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mtr1">Meters</Label>
                <select
                  id="mtr1"
                  className={selectClass}
                  value={mtr1}
                  onChange={(e) => setMtr1(e.target.value)}
                >
                  {MEASUREMENT_METERS_DIGIT_OPTIONS.map((o) => (
                    <option key={`m1-${o.value}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mtr2">Meters fraction</Label>
                <select
                  id="mtr2"
                  className={selectClass}
                  value={mtr2}
                  onChange={(e) => setMtr2(e.target.value)}
                >
                  {MEASUREMENT_METERS_DIGIT_OPTIONS.map((o) => (
                    <option key={`m2-${o.value}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={isDyable}
                  onChange={(e) => setIsDyable(e.target.checked)}
                  className="accent-primary"
                />
                Dyeable
              </label>
              <p className="text-muted-foreground self-end pb-2 text-sm sm:col-span-2 lg:col-span-1">
                {pannaSize ? `(${pannaSize} Inches)` : "(— Inches)"} — {mtr1}.
                {mtr2} Meters
              </p>
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      <section className={sectionClass}>
        <h2 className="text-sm font-semibold tracking-tight">
          Approval & notes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="approvedStatus">Approved status</Label>
            <select
              id="approvedStatus"
              className={selectClass}
              value={approvedStatus}
              onChange={(e) => setApprovedStatus(e.target.value)}
            >
              {MEASUREMENT_APPROVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Approved by</Label>
            <StylistSearchSelect
              stylists={stylists}
              value={approvedBy}
              onChange={setApprovedBy}
              loading={stylistsLoading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="approvedDate">Approved date</Label>
            <Input
              id="approvedDate"
              type="date"
              value={approvedDate}
              onChange={(e) => setApprovedDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </section>

      {submitError ? (
        <p className="text-destructive text-sm" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="bg-background/80 sticky bottom-0 z-10 flex justify-end gap-2 border-t pt-4">
        <Button type="submit" disabled={saving || loadingMeas || !schema}>
          {saving ? "Saving…" : "Save measurement"}
        </Button>
      </div>
    </form>
  )
}
