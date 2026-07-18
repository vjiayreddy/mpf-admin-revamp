"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { MessageCircleIcon, PhoneIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  CUSTOMER_SEGMENT_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  USER_STATUS_OPTIONS,
  YES_NO_OPTIONS,
} from "@/config/customer-filters"
import { useAllStylists } from "@/hooks/use-all-stylists"
import {
  GET_USER,
  type GetUserData,
  type GetUserVars,
  type QuickCustomerUser,
} from "@/lib/apollo/queries/get-user"
import {
  UPDATE_USER_PROFILE,
  type UpdateUserProfileData,
  type UpdateUserProfileVars,
} from "@/lib/apollo/queries/update-user-profile"
import {
  quickCustomerEditSchema,
  type QuickCustomerEditFormValues,
} from "@/lib/customers/quick-customer-edit-schema"
import { buildQuickUpdatePayload } from "@/lib/customers/quick-update-payload"
import { isoToDateInput } from "@/lib/customers/date-filter"
import type { CustomerListRow } from "@/lib/apollo/queries/users"
import type { StylistOption } from "@/lib/apollo/queries/stylists"
import { cn } from "@/lib/utils"

function formatDate(value?: string | null) {
  if (!value) return "NA"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "NA"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function displayName(user?: QuickCustomerUser | null) {
  if (!user) return "—"
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.fullName ||
    "—"
  )
}

function initials(user?: QuickCustomerUser | null) {
  const name = displayName(user)
  if (name === "—") return "?"
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function defaultCcDueInput(user: QuickCustomerUser): string {
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
  user: QuickCustomerUser
): QuickCustomerEditFormValues {
  return {
    stylistId: user.stylist?.[0]?._id ?? "",
    ccDueDate: defaultCcDueInput(user),
    userStatus: user.userStatus ?? "",
    customerSegment: user.customerSegment ?? "",
    customerType: user.customerType ?? "",
    isStyleClubMember: user.isStyleClubMember ? "YES" : "NO",
    remarks: user.remarks ?? "",
  }
}

function openWhatsApp(countryCode?: string | null, phone?: string | null) {
  const digits = `${countryCode ?? ""}${phone ?? ""}`.replace(/\D/g, "")
  if (!digits) return
  window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer")
}

function callPhone(countryCode?: string | null, phone?: string | null) {
  const digits = `${countryCode ?? ""}${phone ?? ""}`.replace(/\D/g, "")
  if (!digits) return
  window.location.href = `tel:+${digits}`
}

function DetailItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm break-words">{children}</dd>
    </div>
  )
}

const selectClassName = cn(
  "border-input bg-transparent h-8 w-full min-w-0 rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

function buildListRowPatch(
  values: QuickCustomerEditFormValues,
  stylists: StylistOption[],
  current?: QuickCustomerUser | null
): Partial<CustomerListRow> {
  const stylist =
    stylists.find((s) => s._id === values.stylistId) ??
    (current?.stylist?.[0]?._id === values.stylistId
      ? current.stylist[0]
      : null)

  const ccIso = values.ccDueDate
    ? new Date(`${values.ccDueDate}T00:00:00`).toISOString()
    : null

  return {
    userStatus: values.userStatus || null,
    customerType: values.customerType || null,
    ccDueDate: ccIso ? { timestamp: ccIso } : null,
    stylist: values.stylistId
      ? [
          {
            _id: values.stylistId,
            name: stylist?.name ?? null,
          },
        ]
      : [],
    lastUpdatedAt: { timestamp: new Date().toISOString() },
  }
}

type QuickCustomerViewProps = {
  open: boolean
  userId: string | null
  onOpenChange: (open: boolean) => void
  onUpdated?: (userId: string, patch: Partial<CustomerListRow>) => void
}

export function QuickCustomerView({
  open,
  userId,
  onOpenChange,
  onUpdated,
}: QuickCustomerViewProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data, loading, error } = useQuery<GetUserData, GetUserVars>(GET_USER, {
    variables: { userId: userId ?? "" },
    skip: !open || !userId,
    fetchPolicy: "network-only",
  })

  const { stylists, loading: stylistsLoading } = useAllStylists(open)

  const [updateProfile, { loading: saving }] = useMutation<
    UpdateUserProfileData,
    UpdateUserProfileVars
  >(UPDATE_USER_PROFILE)

  const user = data?.user

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<QuickCustomerEditFormValues>({
    resolver: zodResolver(quickCustomerEditSchema),
    defaultValues: {
      stylistId: "",
      ccDueDate: "",
      userStatus: "",
      customerSegment: "",
      customerType: "",
      isStyleClubMember: "NO",
      remarks: "",
    },
  })

  useEffect(() => {
    if (user) {
      reset(formDefaultsFromUser(user))
      setSubmitError(null)
    }
  }, [user, reset])

  const locationLine = useMemo(() => {
    if (!user) return "NA"
    const parts = [user.cityName, user.stateName, user.countryName].filter(
      Boolean
    )
    return parts.length ? parts.join(", ") : "NA"
  }, [user])

  const busy = saving || isSubmitting

  const onSubmit = handleSubmit(async (values) => {
    if (!userId) return
    setSubmitError(null)
    try {
      await updateProfile({
        variables: {
          userId,
          updateData: buildQuickUpdatePayload(values),
        },
      })
      onUpdated?.(userId, buildListRowPatch(values, stylists, user))
      onOpenChange(false)
    } catch {
      setSubmitError("Failed to update customer. Please try again.")
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <SheetHeader className="shrink-0 border-b px-4 py-4 text-left">
          <SheetTitle className="sr-only">Customer quick view</SheetTitle>
          <SheetDescription className="sr-only">
            View and quickly update customer profile fields.
          </SheetDescription>

          {loading ? (
            <div className="flex gap-3">
              <Skeleton className="size-16 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-36" />
              </div>
            </div>
          ) : null}

          {!loading && user ? (
            <div className="flex gap-3">
              <Avatar className="size-16 rounded-lg after:rounded-lg">
                {user.images?.profile ? (
                  <AvatarImage
                    src={user.images.profile}
                    alt={displayName(user)}
                    className="rounded-lg"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg text-base">
                  {initials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="capitalize">
                    Customer
                  </Badge>
                  {user.customerSrNo != null ? (
                    <Badge variant="outline">#{user.customerSrNo}</Badge>
                  ) : null}
                </div>
                <h2 className="truncate text-base font-semibold leading-tight">
                  {displayName(user)}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {user.userStatus ? (
                    <Badge variant="outline" className="capitalize">
                      {user.userStatus}
                    </Badge>
                  ) : null}
                  {user.customerType ? (
                    <Badge variant="secondary" className="capitalize">
                      {user.customerType.replaceAll("_", " ").toLowerCase()}
                    </Badge>
                  ) : null}
                  {user.customerSegment ? (
                    <Badge variant="secondary" className="capitalize">
                      {user.customerSegment.replaceAll("_", " ").toLowerCase()}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-1 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => openWhatsApp(user.countryCode, user.phone)}
                    disabled={!user.phone}
                  >
                    <MessageCircleIcon />
                    WhatsApp
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => callPhone(user.countryCode, user.phone)}
                    disabled={!user.phone}
                  >
                    <PhoneIcon />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error.message || "Failed to load customer details."}
            </p>
          ) : null}

          {!loading && !error && !user && userId ? (
            <p className="text-muted-foreground text-sm">Customer not found.</p>
          ) : null}

          {!loading && user ? (
            <form id="quick-customer-edit" onSubmit={onSubmit} className="flex flex-col gap-5">
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Overview</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <DetailItem label="Mobile">
                    {user.phone
                      ? `+${user.countryCode ?? ""} ${user.phone}`.trim()
                      : "NA"}
                  </DetailItem>
                  <DetailItem label="Email">{user.email || "NA"}</DetailItem>
                  <DetailItem label="Primary studio">
                    {user.studios?.[0]?.name ?? "NA"}
                  </DetailItem>
                  <DetailItem label="Secondary studio">
                    {user.secondaryStudios?.length
                      ? user.secondaryStudios
                          .map((s) => s?.name)
                          .filter(Boolean)
                          .join(", ")
                      : "NA"}
                  </DetailItem>
                  <DetailItem label="Stylist">
                    {user.stylist?.[0]?.name || "NA"}
                  </DetailItem>
                  <DetailItem label="Secondary stylist">
                    {user.secondaryStylists?.[0]?.name || "NA"}
                  </DetailItem>
                  <DetailItem label="Date of birth">
                    {formatDate(user.dateOfBirth?.timestamp)}
                  </DetailItem>
                  <DetailItem label="CC due">
                    {formatDate(user.ccDueDate?.timestamp)}
                  </DetailItem>
                  <DetailItem label="Location">{locationLine}</DetailItem>
                </dl>
              </section>

              <Separator />

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Quick edit</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Controller
                      name="stylistId"
                      control={control}
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
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                    <Label
                      htmlFor="quick-cc-due"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      CC due date
                    </Label>
                    <input
                      id="quick-cc-due"
                      type="date"
                      className={selectClassName}
                      disabled={busy}
                      {...register("ccDueDate")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="quick-status"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      Status
                    </Label>
                    <select
                      id="quick-status"
                      className={selectClassName}
                      disabled={busy}
                      {...register("userStatus")}
                    >
                      <option value="">Select</option>
                      {USER_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="quick-segment"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      Segment
                    </Label>
                    <select
                      id="quick-segment"
                      className={selectClassName}
                      disabled={busy}
                      {...register("customerSegment")}
                    >
                      <option value="">Select</option>
                      {CUSTOMER_SEGMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="quick-type"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      Customer type
                    </Label>
                    <select
                      id="quick-type"
                      className={selectClassName}
                      disabled={busy}
                      {...register("customerType")}
                    >
                      <option value="">Select</option>
                      {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="quick-style-club"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      Style club member
                    </Label>
                    <select
                      id="quick-style-club"
                      className={selectClassName}
                      disabled={busy}
                      {...register("isStyleClubMember")}
                    >
                      {YES_NO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label
                      htmlFor="quick-remarks"
                      className="text-muted-foreground text-xs font-normal"
                    >
                      Remarks
                    </Label>
                    <Textarea
                      id="quick-remarks"
                      rows={4}
                      disabled={busy}
                      placeholder="Notes…"
                      {...register("remarks")}
                    />
                  </div>
                </div>
              </section>

              {submitError ? (
                <p className="text-destructive text-sm" role="alert">
                  {submitError}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>

        {!loading && user ? (
          <SheetFooter className="shrink-0 flex-row gap-2 border-t px-4 py-3 sm:flex-row">
            <Button
              type="submit"
              form="quick-customer-edit"
              className="flex-1"
              disabled={busy || !isDirty}
            >
              {busy ? "Updating…" : "Update"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
