"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserRoundSearchIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form"
import { isValidPhoneNumber } from "react-phone-number-input"

import { RegisterUserSheet } from "@/components/customers/register-user-sheet"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { LeadCrossSellSection } from "@/components/leads/lead-cross-sell-section"
import { LeadOccasionSection } from "@/components/leads/lead-occasion-section"
import { PersonaMultiSelect } from "@/components/leads/persona-multi-select"
import { CustomerSearchSelect } from "@/components/orders/customer-search-select"
import { OrderFormHeader } from "@/components/orders/order-form-chrome"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  LEAD_ESTIMATED_VALUE_OPTIONS,
} from "@/config/lead-form"
import { LEAD_RATING_OPTIONS } from "@/config/lead-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import {
  GET_BRAND_PARTNER_SUB_CATEGORIES,
  brandPartnerSubCategoryLabel,
  type GetBrandPartnerSubCategoriesByFilterData,
  type GetBrandPartnerSubCategoriesByFilterVars,
} from "@/lib/apollo/queries/brand-partners"
import {
  GET_USER,
  type GetUserData,
  type GetUserVars,
} from "@/lib/apollo/queries/get-user"
import {
  GET_LATEST_LEAD_ID,
  GET_SINGLE_LEAD,
  SAVE_LEAD,
  type GetLatestLeadIdData,
  type GetSingleLeadData,
  type GetSingleLeadVars,
  type LeadListRow,
  type SaveLeadData,
  type SaveLeadVars,
} from "@/lib/apollo/queries/leads"
import {
  GET_PERSONAS,
  PERSONA_MASTER_NAME,
  type GetUserAttributeMasterData,
  type GetUserAttributeMasterVars,
} from "@/lib/apollo/queries/personas"
import {
  GET_ALL_SOURCE_CATEGORIES,
  type GetAllSourceCategoriesData,
} from "@/lib/apollo/queries/sources"
import type { UserListItem } from "@/lib/apollo/queries/users"
import { authClient } from "@/lib/auth-client"
import { guessCreateCustomerPrefill } from "@/lib/customers/create-customer-schema"
import type { CreateCustomerFormValues } from "@/lib/customers/create-customer-schema"
import { timestampToDateInput } from "@/lib/leads/format"
import {
  buildLeadBody,
  leadFormSchema,
  newCrossSellRow,
  newOccasionRow,
  refImageFromLead,
  todayDateInput,
  type LeadCrossSellRow,
  type LeadFormValues,
  type LeadOccasionRow,
} from "@/lib/leads/lead-form-schema"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

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
  return `+${code}${national}`
}

function normalizeToArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function mapOccasionsFromLead(lead: LeadListRow): LeadOccasionRow[] {
  return normalizeToArray(lead.occasionDetails).map((item) =>
    newOccasionRow({
      occasion: item.occasion ?? "",
      budget: item.budget != null ? String(item.budget) : "",
      outfitsNote: item.outfitsNote ?? "",
      priceQuote: item.priceQuote != null ? String(item.priceQuote) : "",
      refImage: refImageFromLead(item.refImage),
    })
  )
}

function mapCrossSellsFromLead(lead: LeadListRow): LeadCrossSellRow[] {
  return normalizeToArray(lead.crossSellingDetails).map((item) =>
    newCrossSellRow({
      brandPartnerSubCatIds: item.brandPartnerSubCatIds ?? [],
      remarks: item.remarks ?? "",
    })
  )
}

function mapLeadToFormValues(lead: LeadListRow): LeadFormValues {
  return {
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
    generatedBySalesTeamId:
      lead.generatedBySalesTeamId || lead.generatedSalesTeam?.[0]?._id || "",
    studioId: lead.studioId || lead.studio?.[0]?._id || "",
    sourceCatId: lead.sourceCatId || lead.source?.[0]?._id || "",
    sourceSubCatId:
      lead.sourceSubCatId || lead.source?.[0]?.subCategory?.[0]?._id || "",
    personaIds:
      lead.persona
        ?.map((p) => p?._id)
        .filter((id): id is string => Boolean(id?.trim())) ?? [],
    leadDate: timestampToDateInput(lead.leadDate?.timestamp),
    followUpDate: timestampToDateInput(
      lead.followUpDate?.timestamp || lead.currentStatusDate?.timestamp
    ),
    eventDate: timestampToDateInput(lead.eventDate?.timestamp),
    expClosureDate: timestampToDateInput(lead.expClosureDate?.timestamp),
    estimatedValue:
      lead.estimatedValue != null ? String(lead.estimatedValue) : "",
    occasions: mapOccasionsFromLead(lead),
    crossSells: mapCrossSellsFromLead(lead),
  }
}

function customerDisplayLabel(user: UserListItem): string {
  const name =
    user.fullName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  const parts = [name, user.customerSrNo != null ? `#${user.customerSrNo}` : ""]
    .filter(Boolean)
  return parts.join(" · ") || user._id
}

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

const sectionClass =
  "bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs"

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
  required,
}: {
  id: string
  label: string
  children: ReactNode
  className?: string
  error?: string
  required?: boolean
}) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive ml-0.5" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function LeadFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadIdParam = searchParams.get("leadId")?.trim() || ""
  const userIdParam = searchParams.get("userId")?.trim() || ""
  const isEdit = Boolean(leadIdParam)

  const { data: session } = authClient.useSession()
  const sessionStylistId = useMemo(() => {
    const personal = personalStylistIdFromTeamsJson(session?.user?.teamsJson)
    if (personal) return personal
    if (!session?.user?.teamsJson) return ""
    try {
      const teams = JSON.parse(session.user.teamsJson) as Array<{
        _id?: string
      } | null>
      return teams?.[0]?._id ?? ""
    } catch {
      return ""
    }
  }, [session?.user?.teamsJson])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [customerLabel, setCustomerLabel] = useState("")
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false)
  const [createCustomerPrefill, setCreateCustomerPrefill] = useState<
    Partial<CreateCustomerFormValues>
  >({})

  const { stylists, loading: stylistsLoading } = useAllStylists(true)
  const { studios, loading: studiosLoading } = useAllStudios()

  const { data: sourcesData, loading: sourcesLoading } =
    useQuery<GetAllSourceCategoriesData>(GET_ALL_SOURCE_CATEGORIES)

  const { data: personasData, loading: personasLoading } = useQuery<
    GetUserAttributeMasterData,
    GetUserAttributeMasterVars
  >(GET_PERSONAS, {
    variables: { filter: { masterName: PERSONA_MASTER_NAME } },
  })

  const { data: brandPartnerData, loading: brandPartnerLoading } = useQuery<
    GetBrandPartnerSubCategoriesByFilterData,
    GetBrandPartnerSubCategoriesByFilterVars
  >(GET_BRAND_PARTNER_SUB_CATEGORIES, {
    variables: { filter: {} },
  })

  const [fetchLead, { data: leadData, loading: leadLoading, error: leadError }] =
    useLazyQuery<GetSingleLeadData, GetSingleLeadVars>(GET_SINGLE_LEAD, {
      fetchPolicy: "network-only",
    })

  const [fetchUser] = useLazyQuery<GetUserData, GetUserVars>(GET_USER, {
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
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as Resolver<LeadFormValues>,
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
      generatedBySalesTeamId: "",
      studioId: "",
      sourceCatId: "",
      sourceSubCatId: "",
      personaIds: [],
      leadDate: isEdit ? "" : todayDateInput(),
      followUpDate: "",
      eventDate: "",
      expClosureDate: "",
      estimatedValue: "",
      occasions: [],
      crossSells: [],
    },
  })

  const watchedUserId = useWatch({ control, name: "userId" })
  const watchedSourceCatId = useWatch({ control, name: "sourceCatId" })
  const watchedSourceSubCatId = useWatch({ control, name: "sourceSubCatId" })
  const occasions = useWatch({ control, name: "occasions" }) ?? []
  const crossSells = useWatch({ control, name: "crossSells" }) ?? []

  const customerLinked = Boolean(watchedUserId?.trim())
  const bootstrappedUserIdRef = useRef<string | null>(null)

  const sources = useMemo(
    () =>
      (sourcesData?.getAllSourceCategories ?? []).filter(
        (s) => s._id && s.isVisible !== false
      ),
    [sourcesData?.getAllSourceCategories]
  )

  const sourceSubOptions = useMemo(() => {
    const cat = sources.find((s) => s._id === watchedSourceCatId)
    return (cat?.subCategory ?? []).filter(
      (sub) => sub._id && sub.isVisible !== false
    )
  }, [sources, watchedSourceCatId])

  const personaOptions = useMemo(
    () =>
      (personasData?.getUserAttributeMaster ?? [])
        .filter((p) => p._id)
        .map((p) => ({
          id: p._id,
          label: p.name?.trim() || p._id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [personasData?.getUserAttributeMaster]
  )

  const brandPartnerOptions = useMemo(
    () =>
      (brandPartnerData?.getBrandPartnerSubCategoriesByFilter ?? [])
        .filter((s) => s.subCategoryId)
        .map((s) => ({
          id: s.subCategoryId,
          label: brandPartnerSubCategoryLabel(s),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [brandPartnerData?.getBrandPartnerSubCategoriesByFilter]
  )

  const brandPartnerLabelById = useMemo(
    () => new Map(brandPartnerOptions.map((opt) => [opt.id, opt.label])),
    [brandPartnerOptions]
  )

  const applyCustomer = useCallback(
    (user: UserListItem, label?: string) => {
      setValue("userId", user._id, { shouldValidate: true })
      setValue("firstName", user.firstName ?? "", { shouldValidate: true })
      setValue("lastName", user.lastName ?? "", { shouldValidate: true })
      setValue("phone", toE164Phone(user.countryCode, user.phone), {
        shouldValidate: true,
      })
      setValue("email", user.email ?? "")
      setCustomerLabel(label ?? customerDisplayLabel(user))

      const currentGeneratedBy = getValues("generatedBySalesTeamId")
      if (!currentGeneratedBy?.trim() && sessionStylistId) {
        setValue("generatedBySalesTeamId", sessionStylistId)
      }
    },
    [getValues, sessionStylistId, setValue]
  )

  useEffect(() => {
    if (isEdit || !userIdParam) return
    if (bootstrappedUserIdRef.current === userIdParam) return
    bootstrappedUserIdRef.current = userIdParam

    void (async () => {
      try {
        const result = await fetchUser({ variables: { userId: userIdParam } })
        const user = result.data?.user
        if (!user?._id) {
          setValue("userId", userIdParam, { shouldValidate: true })
          return
        }
        applyCustomer({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          countryCode: user.countryCode,
          email: user.email,
          customerSrNo: user.customerSrNo,
        })
      } catch {
        setValue("userId", userIdParam, { shouldValidate: true })
      }
    })()
  }, [applyCustomer, fetchUser, isEdit, setValue, userIdParam])

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
      leadDate: prev.leadDate || todayDateInput(),
    }))
  }, [isEdit, latestIdData, reset, userIdParam])

  useEffect(() => {
    const lead = leadData?.getSingleLead
    if (!lead || !leadIdParam) return
    reset(mapLeadToFormValues(lead))
    const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim()
    if (name) setCustomerLabel(name)
  }, [leadData, leadIdParam, reset])

  useEffect(() => {
    if (!watchedSourceCatId) {
      if (watchedSourceSubCatId) {
        setValue("sourceSubCatId", "")
      }
      return
    }
    if (
      watchedSourceSubCatId &&
      !sourceSubOptions.some((sub) => sub._id === watchedSourceSubCatId)
    ) {
      setValue("sourceSubCatId", "")
    }
  }, [
    watchedSourceCatId,
    watchedSourceSubCatId,
    sourceSubOptions,
    setValue,
  ])

  const handleUserCreated = async (userId: string) => {
    setCreateCustomerOpen(false)
    setCreateCustomerPrefill({})
    try {
      const result = await fetchUser({ variables: { userId } })
      const user = result.data?.user
      if (!user?._id) {
        setValue("userId", userId, { shouldValidate: true })
        return
      }
      applyCustomer({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        countryCode: user.countryCode,
        email: user.email,
        customerSrNo: user.customerSrNo,
      })
    } catch {
      setValue("userId", userId, { shouldValidate: true })
    }
  }

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
        const msg = "Save did not return a confirmation."
        setSubmitError(msg)
        notify.error(msg)
        return
      }
      notify.success(isEdit ? "Lead updated" : "Lead saved")
      router.push("/leads")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save lead"
      setSubmitError(msg)
      notify.fromError(err, "Failed to save lead")
    }
  })

  const busy = saving || isSubmitting
  const loadingExisting = isEdit && leadLoading
  const formReady = isEdit || customerLinked
  const showCustomerGate = !isEdit && !customerLinked && !loadingExisting

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <OrderFormHeader
        title={isEdit ? "Edit lead" : "Create lead"}
        subtitle={
          isEdit
            ? "Update contact, assignment, dates, occasions, and cross-sell details."
            : showCustomerGate
              ? "Choose a customer first. We’ll open the lead form next."
              : customerLabel
                ? customerLabel
                : "Set follow-up dates, then add occasion and cross-sell rows."
        }
        saving={busy}
        canSave={formReady && !loadingExisting}
        onCancelHref="/leads"
        formId="leads-form"
        saveLabel={isEdit ? "Save changes" : "Create lead"}
        backAriaLabel="Back to leads"
        showActions={!loadingExisting}
      />

      {loadingExisting ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : null}

      {leadError && isEdit ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load lead. {leadError.message}
        </p>
      ) : null}

      {showCustomerGate ? (
        <div className="mx-auto w-full max-w-xl">
          <section className={sectionClass}>
            <SectionTitle
              title="Choose a customer"
              description="Type a name, phone, or email to find an existing client. We’ll open the lead form next."
            />
            <div className="flex flex-col gap-4 py-1 sm:py-2">
              <div className="bg-muted/40 flex items-start gap-3 rounded-lg border px-3 py-3">
                <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-full border">
                  <UserRoundSearchIcon className="text-muted-foreground size-5" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium">Search customers</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Need at least 2 characters. Or register a new customer below.
                  </p>
                </div>
              </div>
              <CustomerSearchSelect
                label=""
                autoFocus
                valueLabel={customerLabel}
                onSelect={(row) => applyCustomer(row)}
                onCreateNew={(searchQuery) => {
                  setCreateCustomerPrefill(
                    guessCreateCustomerPrefill(searchQuery)
                  )
                  setCreateCustomerOpen(true)
                }}
              />
            </div>
          </section>
        </div>
      ) : null}

      {!loadingExisting && formReady ? (
        <form
          id="leads-form"
          onSubmit={onSubmit}
          className="flex w-full flex-col gap-4"
        >
          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          {!isEdit ? (
            <section className={sectionClass}>
              <SectionTitle
                title="1. Customer"
                description="Customer is locked for this lead. Start a new lead to pick someone else."
              />
              <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {customerLabel || "Selected customer"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    User {watchedUserId || "—"}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <div className="flex w-full flex-col gap-4">
              <section className={sectionClass}>
                <SectionTitle
                  title={isEdit ? "Contact" : "2. Contact"}
                  description="Lead serial and customer contact details."
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    required
                  >
                    <Input
                      id="userId"
                      readOnly
                      className="bg-muted/40"
                      disabled={busy}
                      {...register("userId")}
                    />
                  </Field>
                  <Field
                    id="firstName"
                    label="First name"
                    error={errors.firstName?.message}
                    required
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
                    required
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
                    required
                    className="space-y-1.5 sm:col-span-2 lg:col-span-1"
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
                  <Field
                    id="remarks"
                    label="Remarks"
                    className="space-y-1.5 sm:col-span-2 lg:col-span-3"
                  >
                    <Textarea
                      id="remarks"
                      rows={3}
                      disabled={busy}
                      {...register("remarks")}
                    />
                  </Field>
                </div>
              </section>

              <section className={sectionClass}>
                <SectionTitle
                  title={isEdit ? "Source & assignment" : "3. Source & assignment"}
                  description="Acquisition source, team, studio, and value."
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field id="sourceCatId" label="Source category">
                    <Controller
                      control={control}
                      name="sourceCatId"
                      render={({ field }) => (
                        <select
                          id="sourceCatId"
                          className={selectClass}
                          value={field.value || ""}
                          disabled={busy || sourcesLoading}
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            setValue("sourceSubCatId", "")
                          }}
                        >
                          <option value="">Select source</option>
                          {sources.map((source) => (
                            <option key={source._id} value={source._id}>
                              {source.name || source._id}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>
                  <Field id="sourceSubCatId" label="Source sub-category">
                    <Controller
                      control={control}
                      name="sourceSubCatId"
                      render={({ field }) => (
                        <select
                          id="sourceSubCatId"
                          className={selectClass}
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={
                            busy ||
                            sourcesLoading ||
                            !watchedSourceCatId ||
                            sourceSubOptions.length === 0
                          }
                        >
                          <option value="">Select sub-category</option>
                          {sourceSubOptions.map((sub) => (
                            <option key={sub._id} value={sub._id!}>
                              {sub.name || sub._id}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>
                  <Field
                    id="generatedBySalesTeamId"
                    label="Generated by"
                    className="space-y-1.5 sm:col-span-2 lg:col-span-1"
                  >
                    <Controller
                      control={control}
                      name="generatedBySalesTeamId"
                      render={({ field }) => (
                        <StylistSearchSelect
                          id="generatedBySalesTeamId"
                          stylists={stylists}
                          value={field.value || ""}
                          onChange={field.onChange}
                          loading={stylistsLoading}
                          disabled={busy}
                        />
                      )}
                    />
                  </Field>
                  <Field
                    id="creditToSalesTeamId"
                    label="Credit to"
                    className="space-y-1.5 sm:col-span-2 lg:col-span-1"
                  >
                    <Controller
                      control={control}
                      name="creditToSalesTeamId"
                      render={({ field }) => (
                        <StylistSearchSelect
                          id="creditToSalesTeamId"
                          stylists={stylists}
                          value={field.value || ""}
                          onChange={field.onChange}
                          loading={stylistsLoading}
                          disabled={busy}
                        />
                      )}
                    />
                  </Field>
                  <Field
                    id="personaIds"
                    label="Personas"
                    className="space-y-1.5 sm:col-span-2 lg:col-span-1"
                  >
                    <Controller
                      control={control}
                      name="personaIds"
                      render={({ field }) => (
                        <PersonaMultiSelect
                          id="personaIds"
                          label=""
                          options={personaOptions}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          loading={personasLoading}
                          disabled={busy}
                        />
                      )}
                    />
                  </Field>
                  <Field
                    id="studioId"
                    label="Studio"
                    required
                    error={errors.studioId?.message}
                  >
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
                  <Field
                    id="estimatedValue"
                    label="Estimated value"
                    required
                    error={errors.estimatedValue?.message}
                  >
                    <Controller
                      control={control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <select
                          id="estimatedValue"
                          className={selectClass}
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={busy}
                        >
                          <option value="">Select estimated value</option>
                          {LEAD_ESTIMATED_VALUE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                          {field.value &&
                          !LEAD_ESTIMATED_VALUE_OPTIONS.some(
                            (opt) => opt.value === field.value
                          ) ? (
                            <option value={field.value}>{field.value}</option>
                          ) : null}
                        </select>
                      )}
                    />
                  </Field>
                </div>
              </section>

              <section className={sectionClass}>
                <SectionTitle
                  title={isEdit ? "Dates" : "4. Dates"}
                  description="Follow-up must be before expected closure."
                />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field
                    id="leadDate"
                    label="Lead date"
                    required
                    error={errors.leadDate?.message}
                  >
                    <Input
                      id="leadDate"
                      type="date"
                      disabled={busy}
                      {...register("leadDate")}
                    />
                  </Field>
                  <Field
                    id="followUpDate"
                    label="Follow-up date"
                    required
                    error={errors.followUpDate?.message}
                  >
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
                  <Field
                    id="expClosureDate"
                    label="Expected closure"
                    required
                    error={errors.expClosureDate?.message}
                  >
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

          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground px-0.5 text-xs font-medium tracking-wide uppercase">
              {isEdit ? "Details grids" : "5. Occasion & cross selling"}
            </p>
            <LeadOccasionSection
              rows={occasions}
              userId={watchedUserId}
              disabled={busy}
              onChange={(next) =>
                setValue("occasions", next, { shouldDirty: true })
              }
            />
            <LeadCrossSellSection
              rows={crossSells}
              options={brandPartnerOptions}
              optionsLoading={brandPartnerLoading}
              labelById={brandPartnerLabelById}
              disabled={busy}
              onChange={(next) =>
                setValue("crossSells", next, { shouldDirty: true })
              }
            />
          </div>

          <div className="bg-background/90 sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t px-1 py-3 backdrop-blur-sm">
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

      <RegisterUserSheet
        endpoint="lead"
        open={createCustomerOpen}
        onOpenChange={(next) => {
          setCreateCustomerOpen(next)
          if (!next) setCreateCustomerPrefill({})
        }}
        initialValues={createCustomerPrefill}
        onCreated={(userId) => {
          void handleUserCreated(userId)
        }}
      />
    </div>
  )
}
