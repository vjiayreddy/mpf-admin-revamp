"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BODY_PROFILE_ATTRIBUTES,
  type BodyProfileAttributeOption,
} from "@/config/body-profile-attributes"
import {
  GET_BODY_PROFILE,
  SAVE_BODY_PROFILE,
  firstBodyProfile,
  type GetBodyProfileData,
  type GetBodyProfileVars,
  type SaveBodyProfileData,
  type SaveBodyProfileVars,
} from "@/lib/apollo/queries/body-profile"
import type { CustomerProfileUser } from "@/lib/apollo/queries/get-user"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"
import {
  cmToFeetInches,
  feetInchesToCm,
} from "@/lib/measurements/height"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const bodyProfileSchema = z.object({
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
  heightUnit: z.enum(["feet", "cm"]),
  feet: z.string().optional(),
  inch: z.string().optional(),
  heightCm: z.string().optional(),
  weight: z.string().optional(),
  age: z.string().optional(),
  shoulderTypeId: z.string().optional(),
  bodyPostureId: z.string().optional(),
  bodyShapeId: z.string().optional(),
  fitPreferenceId: z.string().optional(),
})

type BodyProfileFormValues = z.infer<typeof bodyProfileSchema>

function toE164(
  countryCode?: string | null,
  phone?: string | null
): string {
  if (!phone?.trim()) return ""
  const raw = phone.trim()
  if (raw.startsWith("+") && isValidPhoneNumber(raw)) return raw
  const code = (countryCode || "91").replace(/^\+/, "").replace(/\D/g, "")
  return `+${code}${raw.replace(/\D/g, "")}`
}

const sectionClass = "bg-card flex flex-col gap-3 rounded-lg border p-4"

function Field({
  id,
  label,
  children,
  error,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  error?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
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

function ImageRadioGroup({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label: string
  options: readonly BodyProfileAttributeOption[]
  value?: string
  onChange: (id: string) => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const selected = value === opt._id
          return (
            <label
              key={opt._id}
              className={cn(
                "bg-background flex w-[6.5rem] cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-1.5 transition-colors sm:w-[7rem]",
                selected
                  ? "border-primary ring-primary/30 ring-2"
                  : "border-border hover:border-muted-foreground/40"
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt._id}
                checked={selected}
                // Legacy: second click clears selection
                onClick={() => {
                  if (selected) onChange("")
                }}
                onChange={() => onChange(opt._id)}
                className="sr-only"
              />
              <span className="bg-muted/40 relative flex h-20 w-full items-center justify-center overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={opt.image}
                  alt={opt.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </span>
              <span
                className={cn(
                  "text-center text-xs font-medium",
                  selected ? "text-primary" : "text-foreground"
                )}
              >
                {opt.name}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

type BodyProfilePanelProps = {
  userId: string
  user: CustomerProfileUser | null
}

export function BodyProfilePanel({ userId, user }: BodyProfilePanelProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery<
    GetBodyProfileData,
    GetBodyProfileVars
  >(GET_BODY_PROFILE, {
    variables: { userId },
    fetchPolicy: "cache-first",
  })

  const [saveBodyProfile, { loading: saving }] = useMutation<
    SaveBodyProfileData,
    SaveBodyProfileVars
  >(SAVE_BODY_PROFILE)

  const form = useForm<BodyProfileFormValues>({
    resolver: zodResolver(bodyProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      heightUnit: "feet",
      feet: "",
      inch: "",
      heightCm: "",
      weight: "",
      age: "",
      shoulderTypeId: "",
      bodyPostureId: "",
      bodyShapeId: "",
      fitPreferenceId: "",
    },
  })

  const heightUnit = form.watch("heightUnit")
  const profile = firstBodyProfile(data)

  useEffect(() => {
    if (profile) {
      const { feet, inches } = cmToFeetInches(Number(profile.height) || 0)
      form.reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phone: toE164(profile.countryCode, profile.phone),
        email: profile.email ?? "",
        heightUnit: "feet",
        feet: feet ? String(feet) : "",
        inch: inches ? String(inches) : "",
        heightCm: profile.height != null ? String(profile.height) : "",
        weight: profile.weight != null ? String(profile.weight) : "",
        age: profile.age != null ? String(profile.age) : "",
        shoulderTypeId: profile.shoulderTypeId ?? "",
        bodyPostureId: profile.bodyPostureId ?? "",
        bodyShapeId: profile.bodyShapeId ?? "",
        fitPreferenceId: profile.fitPreferenceId ?? "",
      })
      return
    }
    if (user) {
      form.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: toE164(user.countryCode, user.phone),
        email: user.email ?? "",
        heightUnit: "feet",
        feet: "",
        inch: "",
        heightCm: "",
        weight: "",
        age: "",
        shoulderTypeId: "",
        bodyPostureId: "",
        bodyShapeId: "",
        fitPreferenceId: "",
      })
    }
  }, [profile, user, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const { countryCode, phone } = splitPhoneForApi(values.phone)
      const height =
        values.heightUnit === "cm"
          ? Math.round(Number(values.heightCm) || 0)
          : feetInchesToCm(Number(values.feet) || 0, Number(values.inch) || 0)

      await saveBodyProfile({
        variables: {
          basicInfo: {
            userId,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email || undefined,
            phone,
            countryCode,
            height,
            weight: Math.round(Number(values.weight) || 0),
            age: Math.round(Number(values.age) || 0),
            shoulderTypeId: values.shoulderTypeId || undefined,
            bodyPostureId: values.bodyPostureId || undefined,
            bodyShapeId: values.bodyShapeId || undefined,
            fitPreferenceId: values.fitPreferenceId || undefined,
          },
        },
      })
      notify.success("Body profile saved")
      await refetch()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save body profile"
      setSubmitError(msg)
      notify.fromError(err, "Failed to save body profile")
    }
  })

  if (loading && !profile && !user) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <section className={sectionClass}>
        <h2 className="text-sm font-semibold tracking-tight">Contact</h2>
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
            className="sm:col-span-2"
          >
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  international
                  defaultCountry="IN"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
          <Field id="email" label="Email" className="sm:col-span-2">
            <Input id="email" type="email" {...form.register("email")} />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-semibold tracking-tight">Body metrics</h2>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={heightUnit === "feet"}
              onChange={() => form.setValue("heightUnit", "feet")}
              className="accent-primary"
            />
            Feet / inches
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={heightUnit === "cm"}
              onChange={() => form.setValue("heightUnit", "cm")}
              className="accent-primary"
            />
            Centimeters
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {heightUnit === "feet" ? (
            <>
              <Field id="feet" label="Feet">
                <Input id="feet" type="number" {...form.register("feet")} />
              </Field>
              <Field id="inch" label="Inches">
                <Input id="inch" type="number" {...form.register("inch")} />
              </Field>
            </>
          ) : (
            <Field id="heightCm" label="Height (cm)">
              <Input
                id="heightCm"
                type="number"
                {...form.register("heightCm")}
              />
            </Field>
          )}
          <Field id="weight" label="Weight (kg)">
            <Input id="weight" type="number" {...form.register("weight")} />
          </Field>
          <Field id="age" label="Age">
            <Input id="age" type="number" {...form.register("age")} />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-sm font-semibold tracking-tight">Attributes</h2>
        <div className="grid gap-4">
          <Controller
            control={form.control}
            name="shoulderTypeId"
            render={({ field }) => (
              <ImageRadioGroup
                name="shoulderTypeId"
                label="Shoulder type"
                options={BODY_PROFILE_ATTRIBUTES.shoulderType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="bodyPostureId"
            render={({ field }) => (
              <ImageRadioGroup
                name="bodyPostureId"
                label="Posture"
                options={BODY_PROFILE_ATTRIBUTES.postureType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="bodyShapeId"
            render={({ field }) => (
              <ImageRadioGroup
                name="bodyShapeId"
                label="Body shape"
                options={BODY_PROFILE_ATTRIBUTES.shapeType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="fitPreferenceId"
            render={({ field }) => (
              <ImageRadioGroup
                name="fitPreferenceId"
                label="Fit preference"
                options={BODY_PROFILE_ATTRIBUTES.preferenceType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      {submitError ? (
        <p className="text-destructive text-sm" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save body profile"}
        </Button>
      </div>
    </form>
  )
}
