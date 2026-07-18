"use client"

import type { ReactNode } from "react"
import { useQuery } from "@apollo/client/react"
import { MessageCircleIcon, PhoneIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_USER,
  type GetUserData,
  type GetUserVars,
  type QuickCustomerUser,
} from "@/lib/apollo/queries/get-user"

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

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2 text-sm">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
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

type QuickCustomerViewProps = {
  open: boolean
  userId: string | null
  onOpenChange: (open: boolean) => void
}

export function QuickCustomerView({
  open,
  userId,
  onOpenChange,
}: QuickCustomerViewProps) {
  const { data, loading, error } = useQuery<GetUserData, GetUserVars>(GET_USER, {
    variables: { userId: userId ?? "" },
    skip: !open || !userId,
    fetchPolicy: "network-only",
  })

  const user = data?.user

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Customer</SheetTitle>
          <SheetDescription>
            Quick view of basic customer details (legacy parity).
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Skeleton className="size-28 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2 pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error.message || "Failed to load customer details."}
            </p>
          ) : null}

          {!loading && !error && user ? (
            <>
              <div className="flex gap-4">
                <Avatar className="size-28 rounded-lg after:rounded-lg">
                  {user.images?.profile ? (
                    <AvatarImage
                      src={user.images.profile}
                      alt={displayName(user)}
                      className="rounded-lg"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg text-lg">
                    {initials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Badge variant="secondary" className="w-fit capitalize">
                    Customer
                  </Badge>
                  <h2 className="text-lg leading-snug font-semibold">
                    {displayName(user)}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() =>
                        openWhatsApp(user.countryCode, user.phone)
                      }
                      disabled={!user.phone}
                      aria-label="Open WhatsApp"
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
                      aria-label="Call customer"
                    >
                      <PhoneIcon />
                      Call
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Basic details</h3>
                <dl className="flex flex-col gap-2.5">
                  <DetailRow label="Cus. ID">
                    {user.customerSrNo ?? "NA"}
                  </DetailRow>
                  <DetailRow label="First name">
                    {user.firstName || "NA"}
                  </DetailRow>
                  <DetailRow label="Last name">
                    {user.lastName || "NA"}
                  </DetailRow>
                  <DetailRow label="Primary studio">
                    {user.studios?.[0]?.name ?? "NA"}
                  </DetailRow>
                  <DetailRow label="Secondary studio">
                    {user.secondaryStudios?.length
                      ? user.secondaryStudios
                          .map((s) => s?.name)
                          .filter(Boolean)
                          .join(", ")
                      : "NA"}
                  </DetailRow>
                  <DetailRow label="Date of birth">
                    {formatDate(user.dateOfBirth?.timestamp)}
                  </DetailRow>
                  <DetailRow label="Mobile">
                    {user.phone
                      ? `+${user.countryCode ?? ""} ${user.phone}`.trim()
                      : "NA"}
                  </DetailRow>
                  <DetailRow label="Email">{user.email || "NA"}</DetailRow>
                  <DetailRow label="Stylist">
                    {user.stylist?.[0]?.name || "NA"}
                  </DetailRow>
                  <DetailRow label="Secondary stylist">
                    {user.secondaryStylists?.[0]?.name || "NA"}
                  </DetailRow>
                  <DetailRow label="City">{user.cityName || "NA"}</DetailRow>
                  <DetailRow label="State">{user.stateName || "NA"}</DetailRow>
                  <DetailRow label="Country">
                    {user.countryName || "NA"}
                  </DetailRow>
                  <DetailRow label="CC due">
                    {formatDate(user.ccDueDate?.timestamp)}
                  </DetailRow>
                  <DetailRow label="Status">
                    {user.userStatus ? (
                      <Badge variant="outline" className="capitalize">
                        {user.userStatus}
                      </Badge>
                    ) : (
                      "NA"
                    )}
                  </DetailRow>
                  <DetailRow label="Type">
                    {user.customerType ? (
                      <Badge variant="secondary" className="capitalize">
                        {user.customerType}
                      </Badge>
                    ) : (
                      "Not found"
                    )}
                  </DetailRow>
                  <DetailRow label="Segment">
                    {user.customerSegment ? (
                      <Badge variant="secondary" className="capitalize">
                        {user.customerSegment}
                      </Badge>
                    ) : (
                      "Not found"
                    )}
                  </DetailRow>
                </dl>
              </section>
            </>
          ) : null}

          {!loading && !error && !user && userId ? (
            <p className="text-muted-foreground text-sm">
              Customer not found.
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
