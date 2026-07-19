"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import {
  CREATE_CUSTOMER_DEFAULTS,
  CREATE_USER_FOR_CIF,
  type CreateUserForCifData,
  type CreateUserForCifVars,
} from "@/lib/apollo/queries/create-user"
import {
  createCustomerDefaultValues,
  createCustomerSchema,
  resolveCreateCustomerEmail,
  splitPhoneForApi,
  type CreateCustomerFormValues,
} from "@/lib/customers/create-customer-schema"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

function stylistIdFromTeamsJson(teamsJson: string | null | undefined): string {
  if (!teamsJson) return CREATE_CUSTOMER_DEFAULTS.fallbackStylistId
  try {
    const teams = JSON.parse(teamsJson) as Array<{ _id?: string } | null>
    const id = teams?.[0]?._id
    if (id) return id
  } catch {
    // ignore
  }
  return CREATE_CUSTOMER_DEFAULTS.fallbackStylistId
}

type CreateCustomerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (userId: string) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  )
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCustomerDialogProps) {
  const { data: session } = authClient.useSession()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const stylistId = useMemo(
    () => stylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const [createUser, { loading, error: mutationError, reset: resetMutation }] =
    useMutation<CreateUserForCifData, CreateUserForCifVars>(CREATE_USER_FOR_CIF)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    mode: "onChange",
    defaultValues: createCustomerDefaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(createCustomerDefaultValues)
      setSubmitError(null)
      resetMutation()
    }
  }, [open, reset, resetMutation])

  const handleClose = () => {
    reset(createCustomerDefaultValues)
    setSubmitError(null)
    resetMutation()
    onOpenChange(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const { countryCode, phone } = splitPhoneForApi(values.phone)
    const email = resolveCreateCustomerEmail(values.email, values.phone)

    try {
      const result = await createUser({
        variables: {
          userData: {
            firstName: values.firstName,
            lastName: values.lastName,
            fullName: `${values.firstName} ${values.lastName}`.trim(),
            phone,
            countryCode,
            email,
            password: CREATE_CUSTOMER_DEFAULTS.password,
            height: 0,
            weight: 0,
            customerPersonaIds: [CREATE_CUSTOMER_DEFAULTS.personaId],
            stylistId,
          },
        },
      })

      const userId = result.data?.createUserForCIF?.userId
      if (!userId) {
        const msg = "User was created but no user id was returned."
        setSubmitError(msg)
        notify.error(msg)
        return
      }

      notify.success("Customer created")
      onCreated?.(userId)
      handleClose()
    } catch {
      const msg = "Failed to create customer. Please try again."
      setSubmitError(msg)
      notify.error(msg)
    }
  })

  const busy = loading || isSubmitting
  const apolloMessage = mutationError?.message ?? null

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
        else onOpenChange(true)
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Create a new customer</SheetTitle>
          <SheetDescription>
            Registers a customer via createUserForCIF (same as legacy admin).
            Password defaults to the shared onboarding password.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-first-name">First name</Label>
              <Input
                id="create-first-name"
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
              <Label htmlFor="create-last-name">Last name</Label>
              <Input
                id="create-last-name"
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
            <Label htmlFor="create-phone">Mobile</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="create-phone"
                  international
                  defaultCountry="IN"
                  placeholder="Phone number"
                  disabled={busy}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.phone}
                  className={cn(errors.phone && "[&_input]:border-destructive")}
                />
              )}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-email">
              Email{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="create-email"
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

          {submitError || apolloMessage ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError || apolloMessage}
            </p>
          ) : null}

          <SheetFooter className="border-t px-0 pt-4 sm:flex-row">
            <Button type="submit" className="flex-1" disabled={busy}>
              {busy ? "Creating…" : "Create customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
