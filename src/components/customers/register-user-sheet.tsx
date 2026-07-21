"use client"

import { useMemo, useState } from "react"
import { useMutation } from "@apollo/client/react"

import { RegisterUserForm } from "@/components/customers/register-user-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import {
  CREATE_CUSTOMER_DEFAULTS,
  CREATE_USER_FOR_CIF,
  CREATE_USER_FOR_ORDER,
  type CreateUserForCifData,
  type CreateUserForCifVars,
  type CreateUserForOrderData,
  type CreateUserForOrderVars,
  type RegisterUserEndpoint,
} from "@/lib/apollo/queries/create-user"
import type { CreateCustomerFormValues } from "@/lib/customers/create-customer-schema"
import { notify } from "@/lib/notify"

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

const ENDPOINT_COPY: Record<
  RegisterUserEndpoint,
  { title: string; description: string; submitLabel: string; success: string }
> = {
  order: {
    title: "Create a new customer",
    description:
      "Registers a customer for this order (createUserForOrder). Password defaults to the shared onboarding password.",
    submitLabel: "Create customer",
    success: "Customer created",
  },
  cif: {
    title: "Create a new customer",
    description:
      "Registers a customer via createUserForCIF. Password defaults to the shared onboarding password.",
    submitLabel: "Create customer",
    success: "Customer created",
  },
}

export type RegisterUserSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Which GraphQL mutation to call.
   * - `order` → createUserForOrder (legacy OrderForm)
   * - `cif` → createUserForCIF (customers / CIF / client-connect)
   */
  endpoint?: RegisterUserEndpoint
  onCreated?: (userId: string) => void
  initialValues?: Partial<CreateCustomerFormValues>
  title?: string
  description?: string
  submitLabel?: string
}

/**
 * Sheet wrapper around {@link RegisterUserForm} with built-in create mutations.
 * Reuse across orders, customers, CIF, client-connect, etc.
 */
export function RegisterUserSheet({
  open,
  onOpenChange,
  endpoint = "cif",
  onCreated,
  initialValues,
  title,
  description,
  submitLabel,
}: RegisterUserSheetProps) {
  const { data: session } = authClient.useSession()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const stylistId = useMemo(
    () => stylistIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const copy = ENDPOINT_COPY[endpoint]

  const [createForCif, cifState] = useMutation<
    CreateUserForCifData,
    CreateUserForCifVars
  >(CREATE_USER_FOR_CIF)

  const [createForOrder, orderState] = useMutation<
    CreateUserForOrderData,
    CreateUserForOrderVars
  >(CREATE_USER_FOR_ORDER)

  const loading = endpoint === "order" ? orderState.loading : cifState.loading
  const mutationError =
    endpoint === "order" ? orderState.error : cifState.error
  const resetMutation =
    endpoint === "order" ? orderState.reset : cifState.reset

  const handleClose = () => {
    setSubmitError(null)
    resetMutation()
    onOpenChange(false)
  }

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
          <SheetTitle>{title ?? copy.title}</SheetTitle>
          <SheetDescription>
            {description ?? copy.description}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4">
          {open ? (
            <RegisterUserForm
              formKey={`register-${endpoint}-${initialValues?.phone || "new"}`}
              initialValues={initialValues}
              stylistId={stylistId}
              disabled={loading}
              submitLabel={submitLabel ?? copy.submitLabel}
              errorMessage={submitError || mutationError?.message || null}
              onCancel={handleClose}
              onSubmit={async (userData) => {
                setSubmitError(null)
                try {
                  if (endpoint === "order") {
                    const result = await createForOrder({
                      variables: { userData },
                    })
                    const userId = result.data?.createUserForOrder?.userId
                    if (!userId) {
                      const msg =
                        "Email/mobile may already exist, or no user id was returned."
                      setSubmitError(msg)
                      notify.error(msg)
                      return
                    }
                    notify.success(copy.success)
                    onCreated?.(userId)
                    handleClose()
                    return
                  }

                  const result = await createForCif({
                    variables: { userData },
                  })
                  const userId = result.data?.createUserForCIF?.userId
                  if (!userId) {
                    const msg =
                      "User was created but no user id was returned."
                    setSubmitError(msg)
                    notify.error(msg)
                    return
                  }
                  notify.success(copy.success)
                  onCreated?.(userId)
                  handleClose()
                } catch {
                  const msg = "Failed to create customer. Please try again."
                  setSubmitError(msg)
                  notify.error(msg)
                }
              }}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
