"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { CIF_STATUS_OPTIONS } from "@/config/cif-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import {
  GET_SINGLE_CIF,
  SAVE_CIF,
  type GetSingleCifData,
  type GetSingleCifVars,
  type SaveCifData,
  type SaveCifVars,
} from "@/lib/apollo/queries/cif"
import {
  GET_USER,
  type GetUserData,
  type GetUserVars,
} from "@/lib/apollo/queries/get-user"
import {
  buildCifSavePayload,
  cifRowToFormValues,
  emptyCifFormValues,
  type CifFormValues,
} from "@/lib/cif/form-payload"
import { cn } from "@/lib/utils"

const cifFormSchema = z.object({
  userId: z.string().optional(),
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
  gender: z.string().optional(),
  customerSerialNo: z.string().optional(),
  studioId: z.string().optional(),
  stylistId: z.string().optional(),
  lookingFor: z.string().optional(),
  customerInfoStatus: z.string().optional(),
  createdDate: z.string().optional(),
  eventDate: z.string().optional(),
  followUpDate: z.string().optional(),
  lastVisitedDate: z.string().optional(),
  note: z.string().optional(),
  crossSellingNote: z.string().optional(),
  salesTeamRemarksNote: z.string().optional(),
  rating: z.string().optional(),
  isLookBookShared: z.string().optional(),
  occasion: z.string().optional(),
  budget: z.string().optional(),
  outfitsNote: z.string().optional(),
  priceQuote: z.string().optional(),
})

type FormValues = z.infer<typeof cifFormSchema>

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

export function CifFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cifIdParam = searchParams.get("cifId")
  const userIdParam = searchParams.get("userId")
  const isEdit = Boolean(cifIdParam)

  const { studios, loading: studiosLoading } = useAllStudios()
  const { stylists, loading: stylistsLoading } = useAllStylists()

  const [existingCif, setExistingCif] = useState<
    GetSingleCifData["getSingleCustomerInformation"]
  >(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(cifFormSchema),
    defaultValues: emptyCifFormValues({
      userId: userIdParam ?? "",
    }),
  })

  const [fetchCif, { loading: loadingCif }] = useLazyQuery<
    GetSingleCifData,
    GetSingleCifVars
  >(GET_SINGLE_CIF, { fetchPolicy: "network-only" })

  const { data: userData, loading: loadingUser } = useQuery<
    GetUserData,
    GetUserVars
  >(GET_USER, {
    variables: { userId: userIdParam ?? "" },
    skip: !userIdParam || isEdit,
    fetchPolicy: "cache-first",
  })

  const [saveCif, { loading: saving }] = useMutation<SaveCifData, SaveCifVars>(
    SAVE_CIF
  )

  useEffect(() => {
    if (!cifIdParam) return
    void fetchCif({
      variables: { getSingleCustomerInformationId: cifIdParam },
    }).then((result) => {
      const row = result.data?.getSingleCustomerInformation
      if (!row) return
      setExistingCif(row)
      form.reset(cifRowToFormValues(row))
    })
  }, [cifIdParam, fetchCif, form])

  useEffect(() => {
    if (isEdit || !userData?.user) return
    const user = userData.user
    form.reset(
      emptyCifFormValues({
        userId: user._id,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: toE164Phone(user.countryCode, user.phone),
        email: user.email ?? "",
        gender: user.gender === "F" ? "F" : "M",
        customerSerialNo:
          user.customerSrNo != null ? String(user.customerSrNo) : "",
        studioId: user.studioId ?? user.studios?.[0]?._id ?? "",
        stylistId: user.stylistId ?? user.stylist?.[0]?._id ?? "",
      })
    )
  }, [userData, isEdit, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const payload = buildCifSavePayload(values as CifFormValues, {
        existing: existingCif,
      })
      const result = await saveCif({
        variables: {
          customerInfo: payload,
          customerInfoId: cifIdParam || null,
        },
      })
      const savedId = result.data?.saveCustomerInformationForm?._id
      if (savedId) {
        router.push(`/cif/form?cifId=${savedId}`)
        return
      }
      router.push("/cif")
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save CIF form"
      )
    }
  })

  const loading = (isEdit && loadingCif) || (!isEdit && !!userIdParam && loadingUser)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link
              href={
                userIdParam
                  ? `/customers/${userIdParam}/cif`
                  : "/cif"
              }
            />
          }
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit CIF" : "Create CIF"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Capture visit details, occasion, follow-up, and stylist notes.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <section className={sectionClass}>
            <SectionTitle title="Customer" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                id="firstName"
                label="First name"
                error={form.formState.errors.firstName?.message}
              >
                <Input id="firstName" {...form.register("firstName")} />
              </Field>
              <Field
                id="lastName"
                label="Last name"
                error={form.formState.errors.lastName?.message}
              >
                <Input id="lastName" {...form.register("lastName")} />
              </Field>
              <Field
                id="phone"
                label="Phone"
                error={form.formState.errors.phone?.message}
              >
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <PhoneInput
                      id="phone"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>
              <Field
                id="email"
                label="Email"
                error={form.formState.errors.email?.message}
              >
                <Input id="email" type="email" {...form.register("email")} />
              </Field>
              <Field id="gender" label="Gender">
                <select
                  id="gender"
                  className={selectClass}
                  {...form.register("gender")}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </Field>
              <Field id="customerSerialNo" label="Customer serial no">
                <Input
                  id="customerSerialNo"
                  {...form.register("customerSerialNo")}
                />
              </Field>
              <Field id="userId" label="User id">
                <Input id="userId" {...form.register("userId")} />
              </Field>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle title="Visit details" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="studioId" label="Studio">
                <select
                  id="studioId"
                  className={selectClass}
                  disabled={studiosLoading}
                  {...form.register("studioId")}
                >
                  <option value="">Select studio</option>
                  {studios.map((studio) => (
                    <option key={studio._id} value={studio._id}>
                      {studio.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="stylistId" label="Stylist">
                <Controller
                  control={form.control}
                  name="stylistId"
                  render={({ field }) => (
                    <StylistSearchSelect
                      label="Stylist"
                      stylists={stylists}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      loading={stylistsLoading}
                    />
                  )}
                />
              </Field>
              <Field id="customerInfoStatus" label="Status">
                <select
                  id="customerInfoStatus"
                  className={selectClass}
                  {...form.register("customerInfoStatus")}
                >
                  {CIF_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="lookingFor" label="Looking for">
                <Input id="lookingFor" {...form.register("lookingFor")} />
              </Field>
              <Field id="createdDate" label="Created date">
                <Input
                  id="createdDate"
                  type="date"
                  {...form.register("createdDate")}
                />
              </Field>
              <Field id="eventDate" label="Event date">
                <Input
                  id="eventDate"
                  type="date"
                  {...form.register("eventDate")}
                />
              </Field>
              <Field id="followUpDate" label="Follow-up date">
                <Input
                  id="followUpDate"
                  type="date"
                  {...form.register("followUpDate")}
                />
              </Field>
              <Field id="lastVisitedDate" label="Last visited">
                <Input
                  id="lastVisitedDate"
                  type="date"
                  {...form.register("lastVisitedDate")}
                />
              </Field>
              <Field id="rating" label="CIF rating">
                <Input
                  id="rating"
                  type="number"
                  min={0}
                  max={5}
                  {...form.register("rating")}
                />
              </Field>
              <Field id="isLookBookShared" label="Lookbook shared">
                <select
                  id="isLookBookShared"
                  className={selectClass}
                  {...form.register("isLookBookShared")}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle
              title="Occasion"
              description="Primary occasion captured on this visit."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="occasion" label="Occasion">
                <Input id="occasion" {...form.register("occasion")} />
              </Field>
              <Field id="budget" label="Budget">
                <Input id="budget" type="number" {...form.register("budget")} />
              </Field>
              <Field id="priceQuote" label="Price quote">
                <Input
                  id="priceQuote"
                  type="number"
                  {...form.register("priceQuote")}
                />
              </Field>
              <Field
                id="outfitsNote"
                label="Outfits note"
                className="space-y-1.5 sm:col-span-2"
              >
                <Textarea id="outfitsNote" {...form.register("outfitsNote")} />
              </Field>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle title="Notes" />
            <div className="grid gap-3">
              <Field id="note" label="Note">
                <Textarea id="note" {...form.register("note")} />
              </Field>
              <Field id="crossSellingNote" label="Cross-selling note">
                <Textarea
                  id="crossSellingNote"
                  {...form.register("crossSellingNote")}
                />
              </Field>
              <Field id="salesTeamRemarksNote" label="Sales team remark">
                <Textarea
                  id="salesTeamRemarksNote"
                  {...form.register("salesTeamRemarksNote")}
                />
              </Field>
            </div>
          </section>

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update CIF" : "Create CIF"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
