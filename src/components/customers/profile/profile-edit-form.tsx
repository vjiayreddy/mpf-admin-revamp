"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { CitySearchSelect } from "@/components/customers/city-search-select"
import { SecondaryStylistSelect } from "@/components/customers/secondary-stylist-select"
import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import {
  CUSTOMER_SEGMENT_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  USER_STATUS_OPTIONS,
  YES_NO_OPTIONS,
} from "@/config/customer-filters"
import { useAllStylists } from "@/hooks/use-all-stylists"
import type { CustomerProfileUser } from "@/lib/apollo/queries/get-user"
import { notify } from "@/lib/notify"
import {
  UPDATE_USER_PROFILE,
  type UpdateUserProfileData,
  type UpdateUserProfileVars,
} from "@/lib/apollo/queries/update-user-profile"
import { isoToDateInput } from "@/lib/customers/date-filter"
import {
  GENDER_OPTIONS,
  fullCustomerProfileSchema,
  type FullCustomerProfileFormValues,
} from "@/lib/customers/full-profile-schema"
import { buildFullUpdatePayload } from "@/lib/customers/full-update-payload"
import { e164FromParts } from "@/lib/customers/profile-display"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "border-input bg-transparent h-8 w-full min-w-0 rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  )
}

function defaultCcDueInput(user: CustomerProfileUser): string {
  if (user.ccDueDate?.timestamp) {
    return isoToDateInput(user.ccDueDate.timestamp)
  }
  if (user.lastUpdatedAt?.timestamp) {
    const d = new Date(user.lastUpdatedAt.timestamp)
    if (!Number.isNaN(d.getTime())) {
      d.setMonth(d.getMonth() + 1)
      return isoToDateInput(d.toISOString())
    }
  }
  return ""
}

function formDefaultsFromUser(
  user: CustomerProfileUser
): FullCustomerProfileFormValues {
  const secondaryIds =
    user.secondaryStylistIds?.filter(Boolean) ??
    user.secondaryStylists
      ?.map((s) => s?._id)
      .filter((id): id is string => Boolean(id)) ??
    []

  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: e164FromParts(user.countryCode, user.phone),
    dateOfBirth: isoToDateInput(user.dateOfBirth?.timestamp ?? null),
    customerSrNo: user.customerSrNo != null ? String(user.customerSrNo) : "",
    gender: user.gender === "F" ? "F" : "M",
    stylistId: user.stylist?.[0]?._id ?? user.stylistId ?? "",
    secondaryStylistIds: secondaryIds,
    userStatus: user.userStatus ?? "",
    customerType: user.customerType ?? "",
    customerSegment: user.customerSegment ?? "",
    isStyleClubMember: user.isStyleClubMember ? "YES" : "NO",
    cityId: user.cityId ?? "",
    cityName: user.cityName ?? "",
    stateName: user.stateName ?? "",
    countryName: user.countryName ?? "",
    ccDueDate: defaultCcDueInput(user),
    remarks: user.remarks ?? "",
  }
}

type ProfileEditFormProps = {
  user: CustomerProfileUser
  onSaved?: () => void
}

export function ProfileEditForm({ user, onSaved }: ProfileEditFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { stylists, loading: stylistsLoading } = useAllStylists(true)

  const [updateProfile, { loading: saving }] = useMutation<
    UpdateUserProfileData,
    UpdateUserProfileVars
  >(UPDATE_USER_PROFILE)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FullCustomerProfileFormValues>({
    resolver: zodResolver(fullCustomerProfileSchema),
    defaultValues: formDefaultsFromUser(user),
  })

  useEffect(() => {
    reset(formDefaultsFromUser(user))
    setSubmitError(null)
  }, [user, reset])

  const cityName = watch("cityName")
  const busy = saving || isSubmitting

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await updateProfile({
        variables: {
          userId: user._id,
          updateData: buildFullUpdatePayload(values),
        },
      })
      notify.success("Profile updated")
      onSaved?.()
    } catch {
      const msg = "Failed to update profile. Please try again."
      setSubmitError(msg)
      notify.error(msg)
    }
  })

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Edit profile</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              First name
            </Label>
            <Input className="h-8" {...register("firstName")} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Last name
            </Label>
            <Input className="h-8" {...register("lastName")} />
            <FieldError message={errors.lastName?.message} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Email
            </Label>
            <Input className="h-8" type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Phone
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Date of birth
            </Label>
            <Input className="h-8" type="date" {...register("dateOfBirth")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Customer No
            </Label>
            <Input className="h-8" {...register("customerSrNo")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Gender
            </Label>
            <select className={selectClassName} {...register("gender")}>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Controller
              control={control}
              name="stylistId"
              render={({ field }) => (
                <StylistSearchSelect
                  label="Stylist"
                  stylists={stylists}
                  value={field.value}
                  onChange={field.onChange}
                  loading={stylistsLoading}
                  disabled={busy}
                />
              )}
            />
            <FieldError message={errors.stylistId?.message} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Controller
              control={control}
              name="secondaryStylistIds"
              render={({ field }) => (
                <SecondaryStylistSelect
                  stylists={stylists}
                  value={field.value}
                  onChange={field.onChange}
                  loading={stylistsLoading}
                  disabled={busy}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Status
            </Label>
            <select className={selectClassName} {...register("userStatus")}>
              <option value="">Select…</option>
              {USER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Customer type
            </Label>
            <select className={selectClassName} {...register("customerType")}>
              <option value="">Select…</option>
              {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Segment
            </Label>
            <select
              className={selectClassName}
              {...register("customerSegment")}
            >
              <option value="">Select…</option>
              {CUSTOMER_SEGMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Style Club
            </Label>
            <select
              className={selectClassName}
              {...register("isStyleClubMember")}
            >
              {YES_NO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <CitySearchSelect
              valueLabel={cityName || undefined}
              disabled={busy}
              onSelect={(city) => {
                setValue("cityId", city.id, { shouldDirty: true })
                setValue("cityName", city.name ?? "", { shouldDirty: true })
                setValue("stateName", city.stateTitle ?? "", {
                  shouldDirty: true,
                })
                setValue("countryName", city.countryTitle ?? "", {
                  shouldDirty: true,
                })
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              City
            </Label>
            <Input className="h-8" readOnly {...register("cityName")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              State
            </Label>
            <Input className="h-8" readOnly {...register("stateName")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              Country
            </Label>
            <Input className="h-8" readOnly {...register("countryName")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-normal">
              CC due date
            </Label>
            <Input className="h-8" type="date" {...register("ccDueDate")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-muted-foreground text-xs font-normal">
              Remarks
            </Label>
            <Textarea rows={3} {...register("remarks")} />
          </div>
          {submitError ? (
            <p className="text-destructive text-sm sm:col-span-2" role="alert">
              {submitError}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy || !isDirty}
            onClick={() => reset(formDefaultsFromUser(user))}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !isDirty}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
