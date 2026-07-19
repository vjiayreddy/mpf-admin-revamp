"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
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
import { PhoneInput } from "@/components/ui/phone-input"
import {
  SAVE_USER_ADDRESS,
  type CustomerAddress,
  type SaveAddressData,
  type SaveAddressVars,
} from "@/lib/apollo/queries/customer-addresses"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"
import { notify } from "@/lib/notify"
import {
  addressFormDefaults,
  addressFormSchema,
  type AddressFormValues,
} from "@/lib/customers/full-profile-schema"
import { e164FromParts } from "@/lib/customers/profile-display"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  )
}

function defaultsFromAddress(address: CustomerAddress | null): AddressFormValues {
  if (!address) return addressFormDefaults
  return {
    firstName: address.firstName ?? "",
    lastName: address.lastName ?? "",
    email: address.email ?? "",
    phone: e164FromParts(address.countryCode, address.phone),
    address1: address.address1 ?? "",
    address2: address.address2 ?? "",
    landmark: address.landmark ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    country: address.country ?? "",
    postalCode: address.postalCode ?? "",
  }
}

type AddressFormDialogProps = {
  open: boolean
  userId: string
  address: CustomerAddress | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AddressFormDialog({
  open,
  userId,
  address,
  onOpenChange,
  onSaved,
}: AddressFormDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEdit = Boolean(address?._id)

  const [saveAddress, { loading }] = useMutation<
    SaveAddressData,
    SaveAddressVars
  >(SAVE_USER_ADDRESS)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: addressFormDefaults,
  })

  useEffect(() => {
    if (open) {
      reset(defaultsFromAddress(address))
      setSubmitError(null)
    }
  }, [open, address, reset])

  const busy = loading || isSubmitting

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const { countryCode, phone } = splitPhoneForApi(values.phone)
    try {
      await saveAddress({
        variables: {
          address: {
            ...(address?._id ? { _id: address._id } : {}),
            userId,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone,
            countryCode,
            address1: values.address1,
            address2: values.address2 || null,
            landmark: values.landmark || null,
            city: values.city,
            state: values.state,
            country: values.country,
            postalCode: values.postalCode,
          },
        },
      })
      onSaved()
      onOpenChange(false)
      notify.success(isEdit ? "Address updated" : "Address saved")
    } catch {
      const msg = "Failed to save address. Please try again."
      setSubmitError(msg)
      notify.error(msg)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit address" : "Add address"}</DialogTitle>
          <DialogDescription>
            Shipping and contact details for this customer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-muted-foreground text-xs font-normal">
                Address line 1
              </Label>
              <Input className="h-8" {...register("address1")} />
              <FieldError message={errors.address1?.message} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-muted-foreground text-xs font-normal">
                Address line 2
              </Label>
              <Input className="h-8" {...register("address2")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-muted-foreground text-xs font-normal">
                Landmark
              </Label>
              <Input className="h-8" {...register("landmark")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-normal">
                City
              </Label>
              <Input className="h-8" {...register("city")} />
              <FieldError message={errors.city?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-normal">
                State
              </Label>
              <Input className="h-8" {...register("state")} />
              <FieldError message={errors.state?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-normal">
                Country
              </Label>
              <Input className="h-8" {...register("country")} />
              <FieldError message={errors.country?.message} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-normal">
                Postal code
              </Label>
              <Input className="h-8" {...register("postalCode")} />
              <FieldError message={errors.postalCode?.message} />
            </div>
            {submitError ? (
              <p className="text-destructive text-sm sm:col-span-2" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Update address" : "Add address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
