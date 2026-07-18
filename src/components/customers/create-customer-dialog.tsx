"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useMutation } from "@apollo/client/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type FormState = {
  firstName: string
  lastName: string
  countryCode: string
  phone: string
  email: string
}

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  countryCode: "91",
  phone: "",
  email: "",
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCustomerDialogProps) {
  const { data: session } = authClient.useSession()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const stylistId = useMemo(
    () => stylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const [createUser, { loading, error, reset }] = useMutation<
    CreateUserForCifData,
    CreateUserForCifVars
  >(CREATE_USER_FOR_CIF)

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    setForm(emptyForm)
    setFieldError(null)
    reset()
    onOpenChange(false)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFieldError(null)

    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const countryCode = form.countryCode.replace(/\D/g, "")
    const phone = form.phone.replace(/\D/g, "")
    const emailInput = form.email.trim()

    if (!firstName) {
      setFieldError("First name is required.")
      return
    }
    if (!lastName) {
      setFieldError("Last name is required.")
      return
    }
    if (!countryCode) {
      setFieldError("Country code is required.")
      return
    }
    if (phone.length < 8) {
      setFieldError("Enter a valid phone number.")
      return
    }

    const email =
      emailInput ||
      `+${countryCode}${phone}@${CREATE_CUSTOMER_DEFAULTS.emailDomain}`

    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setFieldError("Enter a valid email address.")
      return
    }

    try {
      const result = await createUser({
        variables: {
          userData: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
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
        setFieldError("User was created but no user id was returned.")
        return
      }

      onCreated?.(userId)
      handleClose()
    } catch {
      // Apollo surfaces via `error`; keep a local fallback message too
      setFieldError("Failed to create customer. Please try again.")
    }
  }

  const apolloMessage =
    error?.message && error.message !== "Failed to create customer. Please try again."
      ? error.message
      : null

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-first-name">First name</Label>
              <Input
                id="create-first-name"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="First name"
                disabled={loading}
                autoComplete="given-name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-last-name">Last name</Label>
              <Input
                id="create-last-name"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Last name"
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-[5.5rem_1fr] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-country">Code</Label>
              <Input
                id="create-country"
                inputMode="numeric"
                value={form.countryCode}
                onChange={(e) => setField("countryCode", e.target.value)}
                placeholder="91"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-phone">Mobile</Label>
              <Input
                id="create-phone"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="Phone number"
                disabled={loading}
                autoComplete="tel-national"
              />
            </div>
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
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Leave blank to auto-generate"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {fieldError || apolloMessage ? (
            <p className="text-destructive text-sm" role="alert">
              {fieldError || apolloMessage}
            </p>
          ) : null}

          <SheetFooter className="border-t px-0 pt-4 sm:flex-row">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating…" : "Create customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
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
