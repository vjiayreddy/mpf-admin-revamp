"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import {
  ExternalLinkIcon,
  Loader2Icon,
  MessageCircleIcon,
  PhoneIcon,
  XIcon,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
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

function MetaCell({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-snug font-medium break-words">
        {value?.trim() || "—"}
      </dd>
    </div>
  )
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: ReactNode
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase"
    >
      {children}
    </Label>
  )
}

const selectClassName = cn(
  "border-input bg-background h-9 w-full min-w-0 rounded-lg border px-2.5 text-sm outline-none",
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
    if (!user) return "—"
    const parts = [user.cityName, user.stateName, user.countryName].filter(
      Boolean
    )
    return parts.length ? parts.join(", ") : "—"
  }, [user])

  const busy = saving || isSubmitting
  const showContent = !loading && !error && Boolean(user)

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
      notify.success("Customer updated")
      onOpenChange(false)
    } catch {
      const msg = "Failed to update customer. Please try again."
      setSubmitError(msg)
      notify.error(msg)
    }
  })

  const mobileLine = user?.phone
    ? `+${user.countryCode ?? ""} ${user.phone}`.trim()
    : "—"

  const secondaryStudio = user?.secondaryStudios?.length
    ? user.secondaryStudios
        .map((s) => s?.name)
        .filter(Boolean)
        .join(", ")
    : "—"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(92vh,52rem)] w-[calc(100%-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="bg-background/95 supports-backdrop-filter:bg-background/85 shrink-0 border-b px-3 py-2.5 backdrop-blur sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold tracking-tight">
                Customer details
              </DialogTitle>
              <DialogDescription className="sr-only">
                View and quickly update customer profile fields.
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {user ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => openWhatsApp(user.countryCode, user.phone)}
                    disabled={!user.phone}
                  >
                    <MessageCircleIcon className="size-3.5" />
                    WhatsApp
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8"
                    onClick={() => callPhone(user.countryCode, user.phone)}
                    disabled={!user.phone}
                  >
                    <PhoneIcon className="size-3.5" />
                    Call
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    nativeButton={false}
                    render={<Link href={`/customers/${user._id}`} />}
                    onClick={() => onOpenChange(false)}
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    Profile
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-8"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="from-muted/40 via-muted/20 to-background min-h-0 flex-1 overflow-y-auto bg-gradient-to-b">
          {loading ? (
            <div className="flex flex-col gap-3 p-3 sm:p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading customer…
              </div>
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : null}

          {error ? (
            <div className="p-3 sm:p-4" role="alert">
              <div className="border-destructive/30 bg-destructive/5 rounded-xl border px-3 py-2.5 text-sm">
                {error.message || "Failed to load customer details."}
              </div>
            </div>
          ) : null}

          {!loading && !error && !user && userId ? (
            <div className="p-3 sm:p-4">
              <div className="bg-card rounded-xl border px-3 py-2.5 text-sm">
                Customer not found.
              </div>
            </div>
          ) : null}

          {showContent && user ? (
            <form
              id="quick-customer-edit"
              onSubmit={onSubmit}
              className="flex flex-col gap-3 p-3 pb-6 sm:p-4"
            >
              <section className="bg-card overflow-hidden rounded-xl border">
                <div className="from-muted/50 via-background to-background border-b bg-gradient-to-br px-3 py-3.5 sm:px-4">
                  <div className="mb-3.5 flex gap-3.5">
                    <Avatar className="size-20 shrink-0 rounded-2xl after:rounded-2xl sm:size-24">
                      {user.images?.profile ? (
                        <AvatarImage
                          src={user.images.profile}
                          alt={displayName(user)}
                          className="rounded-2xl"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-2xl text-xl sm:text-2xl">
                        {initials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1.5 self-center">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {user.customerSrNo != null ? (
                          <Badge variant="outline">#{user.customerSrNo}</Badge>
                        ) : null}
                        {user.userStatus ? (
                          <Badge variant="secondary" className="capitalize">
                            {user.userStatus}
                          </Badge>
                        ) : null}
                        {user.customerType ? (
                          <Badge variant="outline" className="capitalize">
                            {user.customerType
                              .replaceAll("_", " ")
                              .toLowerCase()}
                          </Badge>
                        ) : null}
                        {user.customerSegment ? (
                          <Badge variant="outline" className="capitalize">
                            {user.customerSegment
                              .replaceAll("_", " ")
                              .toLowerCase()}
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                        {displayName(user)}
                      </h2>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2.5 text-[10px] font-medium tracking-[0.12em] uppercase">
                    Overview
                  </p>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MetaCell label="Mobile" value={mobileLine} />
                    <MetaCell label="Email" value={user.email} />
                    <MetaCell
                      label="Primary studio"
                      value={user.studios?.[0]?.name}
                    />
                    <MetaCell
                      label="Secondary studio"
                      value={secondaryStudio}
                    />
                    <MetaCell
                      label="Stylist"
                      value={user.stylist?.[0]?.name}
                    />
                    <MetaCell
                      label="Secondary stylist"
                      value={user.secondaryStylists?.[0]?.name}
                    />
                    <MetaCell
                      label="Date of birth"
                      value={formatDate(user.dateOfBirth?.timestamp)}
                    />
                    <MetaCell
                      label="CC due"
                      value={formatDate(user.ccDueDate?.timestamp)}
                    />
                    <MetaCell label="Location" value={locationLine} />
                  </dl>
                </div>
              </section>

              <section className="bg-card rounded-xl border px-3 py-3.5 sm:px-4">
                <p className="text-muted-foreground mb-3 text-[10px] font-medium tracking-[0.12em] uppercase">
                  Quick edit
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
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
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="quick-cc-due">CC due date</FieldLabel>
                    <input
                      id="quick-cc-due"
                      type="date"
                      className={selectClassName}
                      disabled={busy}
                      {...register("ccDueDate")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="quick-status">Status</FieldLabel>
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
                    <FieldLabel htmlFor="quick-segment">Segment</FieldLabel>
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
                    <FieldLabel htmlFor="quick-type">Customer type</FieldLabel>
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
                    <FieldLabel htmlFor="quick-style-club">
                      Style club member
                    </FieldLabel>
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

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <FieldLabel htmlFor="quick-remarks">Remarks</FieldLabel>
                    <Textarea
                      id="quick-remarks"
                      rows={4}
                      disabled={busy}
                      placeholder="Notes…"
                      className="min-h-24 resize-y"
                      {...register("remarks")}
                    />
                  </div>
                </div>

                {submitError ? (
                  <p className="text-destructive mt-4 text-sm" role="alert">
                    {submitError}
                  </p>
                ) : null}
              </section>
            </form>
          ) : null}
        </div>

        {showContent && user ? (
          <DialogFooter className="bg-background/95 supports-backdrop-filter:bg-background/85 shrink-0 flex-row gap-2 border-t px-3 py-2.5 backdrop-blur sm:justify-end sm:px-4">
            <Button
              type="button"
              variant="outline"
              className="min-w-24"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              form="quick-customer-edit"
              className="min-w-28"
              disabled={busy || !isDirty}
            >
              {busy ? "Updating…" : "Update"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
