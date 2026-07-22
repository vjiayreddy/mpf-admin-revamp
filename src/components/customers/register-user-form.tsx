"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  CREATE_CUSTOMER_DEFAULTS,
  type CreateUserInput,
} from "@/lib/apollo/queries/create-user"
import {
  createCustomerDefaultValues,
  createCustomerSchema,
  guessCreateCustomerPrefill,
  resolveCreateCustomerEmail,
  splitPhoneForApi,
  type CreateCustomerFormValues,
} from "@/lib/customers/create-customer-schema"
import { cn } from "@/lib/utils"

export type RegisterUserFormValues = CreateCustomerFormValues

export type RegisterUserApiPayload = CreateUserInput

type RegisterUserFormProps = {
  /** Prefill when the form mounts / key changes. */
  initialValues?: Partial<RegisterUserFormValues>
  /** Session stylist id (teams[0]). */
  stylistId: string
  disabled?: boolean
  submitLabel?: string
  cancelLabel?: string
  errorMessage?: string | null
  onCancel?: () => void
  /**
   * Called with API-ready userData (phone split, email resolved, defaults applied).
   * Legacy OrderForm `getFormData` equivalent.
   */
  onSubmit: (payload: RegisterUserApiPayload) => void | Promise<void>
  className?: string
  /** Remount key — change when opening a sheet so PhoneInput resets cleanly. */
  formKey?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  )
}

/**
 * Reusable register-user fields (first/last/mobile/email).
 * Parents choose the GraphQL endpoint (createUserForOrder / createUserForCIF / …).
 */
export function RegisterUserForm({
  initialValues,
  stylistId,
  disabled = false,
  submitLabel = "Create customer",
  cancelLabel = "Cancel",
  errorMessage,
  onCancel,
  onSubmit,
  className,
  formKey = "register-user",
}: RegisterUserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserFormValues>({
    resolver: zodResolver(createCustomerSchema),
    mode: "onChange",
    defaultValues: createCustomerDefaultValues,
  })

  const prefillPhone = initialValues?.phone?.trim() || ""
  const prefillEmail = initialValues?.email?.trim() || ""
  const prefillFirstName = initialValues?.firstName?.trim() || ""
  const prefillLastName = initialValues?.lastName?.trim() || ""
  const phoneFieldKey = `${formKey}-phone-${prefillPhone || "empty"}`

  useEffect(() => {
    const next: RegisterUserFormValues = {
      ...createCustomerDefaultValues,
      firstName: prefillFirstName,
      lastName: prefillLastName,
      phone: prefillPhone,
      email: prefillEmail,
    }
    reset(next)
    if (prefillPhone) {
      setValue("phone", prefillPhone, {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [
    formKey,
    prefillPhone,
    prefillEmail,
    prefillFirstName,
    prefillLastName,
    reset,
    setValue,
  ])

  const busy = disabled || isSubmitting

  const submit = handleSubmit(async (values) => {
    const { countryCode, phone } = splitPhoneForApi(values.phone)
    const email = resolveCreateCustomerEmail(values.email, values.phone)
    const payload: RegisterUserApiPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone,
      countryCode,
      email,
      password: CREATE_CUSTOMER_DEFAULTS.password,
      height: 0,
      weight: 0,
      customerPersonaIds: [CREATE_CUSTOMER_DEFAULTS.personaId],
      stylistId,
    }
    await onSubmit(payload)
  })

  return (
    <form
      key={formKey}
      onSubmit={submit}
      className={cn("flex flex-col gap-4", className)}
      noValidate
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formKey}-first-name`}>First name</Label>
          <Input
            id={`${formKey}-first-name`}
            placeholder="First name"
            disabled={busy}
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            className={cn(errors.firstName && "border-destructive")}
            {...register("firstName")}
          />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formKey}-last-name`}>Last name</Label>
          <Input
            id={`${formKey}-last-name`}
            placeholder="Last name"
            disabled={busy}
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            className={cn(errors.lastName && "border-destructive")}
            {...register("lastName")}
          />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formKey}-phone`}>Mobile</Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              key={phoneFieldKey}
              id={`${formKey}-phone`}
              defaultCountry="IN"
              placeholder="Phone number"
              disabled={busy}
              autoComplete="off"
              value={field.value || undefined}
              onChange={(next) => field.onChange(next || "")}
              onBlur={field.onBlur}
              aria-invalid={!!errors.phone}
              className={cn(errors.phone && "[&_input]:border-destructive")}
            />
          )}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formKey}-email`}>
          Email{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id={`${formKey}-email`}
          type="email"
          placeholder="Leave blank to auto-generate"
          disabled={busy}
          autoComplete="email"
          aria-invalid={!!errors.email}
          className={cn(errors.email && "border-destructive")}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {errorMessage ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" className="flex-1" disabled={busy}>
          {busy ? "Creating…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  )
}

/** Build API payload helpers re-exported for callers that submit manually. */
export {
  createCustomerDefaultValues as registerUserDefaultValues,
  createCustomerSchema as registerUserSchema,
  guessCreateCustomerPrefill as guessRegisterUserPrefill,
  type CreateCustomerFormValues,
}
