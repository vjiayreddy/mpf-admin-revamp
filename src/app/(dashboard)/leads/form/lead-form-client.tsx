"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { LEAD_RATING_OPTIONS } from "@/config/lead-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { extractDateFormat } from "@/lib/appointments/date-payload"
import {
  GET_LATEST_LEAD_ID,
  GET_SINGLE_LEAD,
  SAVE_LEAD,
  type GetLatestLeadIdData,
  type GetSingleLeadData,
  type GetSingleLeadVars,
  type LeadInput,
  type SaveLeadData,
  type SaveLeadVars,
} from "@/lib/apollo/queries/leads"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"
import { timestampToDateInput } from "@/lib/leads/format"
import { cn } from "@/lib/utils"
import { isValidPhoneNumber } from "react-phone-number-input"

const leadFormSchema = z.object({
  leadId: z.string().optional(),
  userId: z.string().min(1, "User id is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    }),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  cityName: z.string().optional(),
  remarks: z.string().optional(),
  rating: z.string().optional(),
  creditToSalesTeamId: z.string().optional(),
  studioId: z.string().optional(),
  leadDate: z.string().optional(),
  followUpDate: z.string().optional(),
  eventDate: z.string().optional(),
  expClosureDate: z.string().optional(),
  occasion: z.string().optional(),
  budget: z.string().optional(),
  estimatedValue: z.string().optional(),
  crossSellRemarks: z.string().optional(),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

/** Build E.164 from legacy countryCode + national phone for the PhoneInput. */
function toE164Phone(
  countryCode?: string | null,
  phone?: string | null
): string {
  if (!phone?.trim()) return ""
  const raw = phone.trim()
  if (raw.startsWith("+") && isValidPhoneNumber(raw)) return raw
  const code = (countryCode || "91").replace(/^\+/, "").replace(/\D/g, "")
  const national = raw.replace(/\D/g, "")
  const e164 = `+${code}${national}`
  return e164
}

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

const sectionClass = "bg-card flex flex-col gap-3 rounded-lg border p-4"

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  )
}

function Field({
  id,
  label,
  children,
  className,
  error,
}: {
  id: string
  label: string
  children: ReactNode
  className?: string
  error?: string
}) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function dateInputToFilter(value?: string) {
  if (!value?.trim()) return undefined
  return extractDateFormat(new Date(`${value}T00:00:00`).toISOString())
}

function buildLeadBody(
  values: LeadFormValues,
  opts: { mongoId?: string; leadIdNumber?: number }
): LeadInput {
  const { countryCode, phone } = splitPhoneForApi(values.phone.trim())
  const body: LeadInput = {
    userId: values.userId.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone,
    countryCode,
    email: values.email?.trim() || undefined,
    cityName: values.cityName?.trim() || undefined,
    remarks: values.remarks?.trim() || undefined,
    creditToSalesTeamId: values.creditToSalesTeamId || undefined,
    studioId: values.studioId || undefined,
  }

  if (opts.mongoId) {
    body._id = opts.mongoId
  }

  const leadIdNum =
    opts.leadIdNumber ??
    (values.leadId?.trim() ? Number(values.leadId.trim()) : undefined)
  if (leadIdNum != null && !Number.isNaN(leadIdNum)) {
    body.leadId = leadIdNum
  }

  if (values.rating != null && values.rating !== "") {
    body.rating = Number(values.rating)
  }

  if (values.estimatedValue?.trim()) {
    const n = Number(values.estimatedValue)
    if (!Number.isNaN(n)) body.estimatedValue = n
  }

  const leadDate = dateInputToFilter(values.leadDate)
  if (leadDate) body.leadDate = leadDate

  const followUpDate = dateInputToFilter(values.followUpDate)
  if (followUpDate) {
    body.followUpDate = followUpDate
    body.currentStatusDate = followUpDate
  }

  const eventDate = dateInputToFilter(values.eventDate)
  if (eventDate) body.eventDate = eventDate

  const expClosureDate = dateInputToFilter(values.expClosureDate)
  if (expClosureDate) body.expClosureDate = expClosureDate

  if (values.crossSellRemarks?.trim()) {
    body.crossSellingDetails = [
      { remarks: values.crossSellRemarks.trim() },
    ]
  }

  if (values.occasion?.trim() || values.budget?.trim()) {
    const occasionDetails: Record<string, unknown> = {}
    if (values.occasion?.trim()) {
      occasionDetails.occasion = values.occasion.trim()
    }
    if (values.budget?.trim()) {
      const budget = Number(values.budget)
      if (!Number.isNaN(budget)) occasionDetails.budget = budget
    }
    body.occasionDetails = [occasionDetails]
  }

  return body
}

export function LeadFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadIdParam = searchParams.get("leadId")
  const userIdParam = searchParams.get("userId")
  const isEdit = Boolean(leadIdParam)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const { stylists, loading: stylistsLoading } = useAllStylists(true)
  const { studios, loading: studiosLoading } = useAllStudios()

  const [fetchLead, { data: leadData, loading: leadLoading, error: leadError }] =
    useLazyQuery<GetSingleLeadData, GetSingleLeadVars>(GET_SINGLE_LEAD, {
      fetchPolicy: "network-only",
    })

  const { data: latestIdData, loading: latestIdLoading } =
    useQuery<GetLatestLeadIdData>(GET_LATEST_LEAD_ID, {
      skip: isEdit,
      fetchPolicy: "network-only",
    })

  const [saveLead, { loading: saving }] = useMutation<
    SaveLeadData,
    SaveLeadVars
  >(SAVE_LEAD)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      leadId: "",
      userId: userIdParam || "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      cityName: "",
      remarks: "",
      rating: "",
      creditToSalesTeamId: "",
      studioId: "",
      leadDate: "",
      followUpDate: "",
      eventDate: "",
      expClosureDate: "",
      occasion: "",
      budget: "",
      estimatedValue: "",
      crossSellRemarks: "",
    },
  })

  useEffect(() => {
    if (!leadIdParam) return
    void fetchLead({ variables: { leadId: leadIdParam } })
  }, [leadIdParam, fetchLead])

  useEffect(() => {
    if (isEdit) return
    const latest = latestIdData?.getLatestLeadId
    if (latest == null) return
    reset((prev) => ({
      ...prev,
      leadId: String(latest),
      userId: userIdParam || prev.userId,
    }))
  }, [isEdit, latestIdData, reset, userIdParam])

  useEffect(() => {
    const lead = leadData?.getSingleLead
    if (!lead || !leadIdParam) return

    reset({
      leadId: lead.leadId != null ? String(lead.leadId) : "",
      userId: lead.userId || "",
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      phone: toE164Phone(lead.countryCode, lead.phone),
      email: lead.email || "",
      cityName: lead.cityName || "",
      remarks: lead.remarks || "",
      rating: lead.rating != null ? String(lead.rating) : "",
      creditToSalesTeamId:
        lead.creditToSalesTeamId || lead.creditedSalesTeam?.[0]?._id || "",
      studioId: lead.studioId || lead.studio?.[0]?._id || "",
      leadDate: timestampToDateInput(lead.leadDate?.timestamp),
      followUpDate: timestampToDateInput(
        lead.followUpDate?.timestamp || lead.currentStatusDate?.timestamp
      ),
      eventDate: timestampToDateInput(lead.eventDate?.timestamp),
      expClosureDate: timestampToDateInput(lead.expClosureDate?.timestamp),
      occasion: lead.occasionDetails?.occasion || "",
      budget:
        lead.occasionDetails?.budget != null
          ? String(lead.occasionDetails.budget)
          : "",
      estimatedValue:
        lead.estimatedValue != null ? String(lead.estimatedValue) : "",
      crossSellRemarks: lead.crossSellingDetails?.remarks || "",
    })
  }, [leadData, leadIdParam, reset])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const existing = leadData?.getSingleLead
    const latestNum = latestIdData?.getLatestLeadId
    const body = buildLeadBody(values, {
      mongoId: existing?._id,
      leadIdNumber:
        !isEdit && latestNum != null ? Number(latestNum) : undefined,
    })

    try {
      const result = await saveLead({ variables: { body } })
      if (!result.data?.saveLead?._id) {
        setSubmitError("Save did not return a confirmation.")
        return
      }
      router.push("/leads")
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save lead"
      )
    }
  })

  const busy = saving || isSubmitting
  const loadingExisting = isEdit && leadLoading

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href="/leads"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeftIcon className="size-4" />
          Back to leads
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit lead" : "Create lead"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isEdit
            ? "Update lead contact and follow-up details."
            : "Create a new lead for an existing customer."}
        </p>
      </div>

      {loadingExisting ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : null}

      {leadError && isEdit ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load lead. {leadError.message}
        </p>
      ) : null}

      {!loadingExisting ? (
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: Customer & notes */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              <section className={sectionClass}>
                <SectionTitle
                  title="Identity"
                  description="Lead serial, customer link, and contact details."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="leadId" label="Lead ID">
                    <Input
                      id="leadId"
                      readOnly
                      disabled
                      {...register("leadId")}
                    />
                    {!isEdit && latestIdLoading ? (
                      <p className="text-muted-foreground text-xs">
                        Loading latest lead id…
                      </p>
                    ) : null}
                  </Field>
                  <Field
                    id="userId"
                    label="User ID"
                    error={errors.userId?.message}
                  >
                    <Input
                      id="userId"
                      readOnly={Boolean(userIdParam) || isEdit}
                      disabled={Boolean(userIdParam) || isEdit || busy}
                      {...register("userId")}
                    />
                  </Field>
                  <Field
                    id="firstName"
                    label="First name"
                    error={errors.firstName?.message}
                  >
                    <Input
                      id="firstName"
                      disabled={busy}
                      {...register("firstName")}
                    />
                  </Field>
                  <Field
                    id="lastName"
                    label="Last name"
                    error={errors.lastName?.message}
                  >
                    <Input
                      id="lastName"
                      disabled={busy}
                      {...register("lastName")}
                    />
                  </Field>
                  <Field
                    id="phone"
                    label="Phone"
                    error={errors.phone?.message}
                    className="space-y-1.5 sm:col-span-2"
                  >
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          id="phone"
                          international
                          defaultCountry="IN"
                          placeholder="Phone number"
                          disabled={busy}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          aria-invalid={!!errors.phone}
                          className={cn(
                            errors.phone && "[&_input]:border-destructive"
                          )}
                        />
                      )}
                    />
                  </Field>
                  <Field id="email" label="Email" error={errors.email?.message}>
                    <Input
                      id="email"
                      type="email"
                      disabled={busy}
                      {...register("email")}
                    />
                  </Field>
                  <Field id="cityName" label="City">
                    <Input
                      id="cityName"
                      disabled={busy}
                      {...register("cityName")}
                    />
                  </Field>
                </div>
              </section>

              <section className={sectionClass}>
                <SectionTitle
                  title="Notes & occasion"
                  description="Remarks, cross-sell notes, and occasion budget."
                />
                <Field id="remarks" label="Remarks">
                  <Textarea
                    id="remarks"
                    rows={3}
                    disabled={busy}
                    {...register("remarks")}
                  />
                </Field>
                <Field id="crossSellRemarks" label="Cross-sell remarks">
                  <Textarea
                    id="crossSellRemarks"
                    rows={2}
                    disabled={busy}
                    {...register("crossSellRemarks")}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="occasion" label="Occasion">
                    <Input
                      id="occasion"
                      disabled={busy}
                      {...register("occasion")}
                    />
                  </Field>
                  <Field id="budget" label="Budget">
                    <Input
                      id="budget"
                      type="number"
                      disabled={busy}
                      {...register("budget")}
                    />
                  </Field>
                </div>
              </section>
            </div>

            {/* Right: Assignment & dates */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <section className={sectionClass}>
                <SectionTitle
                  title="Assignment & rating"
                  description="Credit, studio, rating, and estimated value."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Controller
                      control={control}
                      name="creditToSalesTeamId"
                      render={({ field }) => (
                        <StylistSearchSelect
                          label="Credit to"
                          stylists={stylists}
                          value={field.value || ""}
                          onChange={field.onChange}
                          loading={stylistsLoading}
                          disabled={busy}
                        />
                      )}
                    />
                  </div>
                  <Field id="studioId" label="Studio" className="space-y-1.5 sm:col-span-2">
                    <Controller
                      control={control}
                      name="studioId"
                      render={({ field }) => (
                        <select
                          id="studioId"
                          className={selectClass}
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={busy || studiosLoading}
                        >
                          <option value="">Select studio</option>
                          {studios.map((studio) => (
                            <option key={studio._id} value={studio._id}>
                              {studio.name || studio.code || studio._id}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>
                  <Field id="rating" label="Rating">
                    <Controller
                      control={control}
                      name="rating"
                      render={({ field }) => (
                        <select
                          id="rating"
                          className={selectClass}
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={busy}
                        >
                          <option value="">Select rating</option>
                          {LEAD_RATING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>
                  <Field id="estimatedValue" label="Estimated value">
                    <Input
                      id="estimatedValue"
                      type="number"
                      disabled={busy}
                      {...register("estimatedValue")}
                    />
                  </Field>
                </div>
              </section>

              <section className={sectionClass}>
                <SectionTitle
                  title="Dates"
                  description="Lead, follow-up, event, and expected closure."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="leadDate" label="Lead date">
                    <Input
                      id="leadDate"
                      type="date"
                      disabled={busy}
                      {...register("leadDate")}
                    />
                  </Field>
                  <Field id="followUpDate" label="Follow-up date">
                    <Input
                      id="followUpDate"
                      type="date"
                      disabled={busy}
                      {...register("followUpDate")}
                    />
                  </Field>
                  <Field id="eventDate" label="Event date">
                    <Input
                      id="eventDate"
                      type="date"
                      disabled={busy}
                      {...register("eventDate")}
                    />
                  </Field>
                  <Field id="expClosureDate" label="Expected closure">
                    <Input
                      id="expClosureDate"
                      type="date"
                      disabled={busy}
                      {...register("expClosureDate")}
                    />
                  </Field>
                </div>
              </section>
            </div>
          </div>

          <div className="bg-background/80 sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => router.push("/leads")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create lead"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
