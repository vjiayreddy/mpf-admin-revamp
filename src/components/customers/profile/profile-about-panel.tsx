"use client"

import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CustomerProfileUser } from "@/lib/apollo/queries/get-user"
import {
  formatProfileDate,
  labelize,
} from "@/lib/customers/profile-display"

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
      <dd className="mt-0.5 text-sm break-words capitalize">{children}</dd>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {title}
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>
    </div>
  )
}

type ProfileAboutPanelProps = {
  user: CustomerProfileUser
}

export function ProfileAboutPanel({ user }: ProfileAboutPanelProps) {
  const secondary =
    user.secondaryStylists
      ?.map((s) => s?.name)
      .filter(Boolean)
      .join(", ") || "—"

  const phone =
    user.phone != null
      ? `${user.countryCode ? `+${user.countryCode} ` : ""}${user.phone}`
      : "—"

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <Section title="Contact">
          <DetailItem label="Customer No">
            {user.customerSrNo ?? "—"}
          </DetailItem>
          <DetailItem label="Full name">
            {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"}
          </DetailItem>
          <DetailItem label="Email">{user.email || "—"}</DetailItem>
          <DetailItem label="Phone">{phone}</DetailItem>
          <DetailItem label="Date of birth">
            {formatProfileDate(user.dateOfBirth?.timestamp)}
          </DetailItem>
          <DetailItem label="Gender">
            {user.gender === "F" ? "Female" : user.gender === "M" ? "Male" : "—"}
          </DetailItem>
        </Section>

        <Separator />

        <Section title="Verification">
          <DetailItem label="Email verified">
            <Badge variant={user.isEmailVerified ? "default" : "outline"}>
              {user.isEmailVerified ? "Yes" : "No"}
            </Badge>
          </DetailItem>
          <DetailItem label="Mobile verified">
            <Badge variant={user.isMobileVerified ? "default" : "outline"}>
              {user.isMobileVerified ? "Yes" : "No"}
            </Badge>
          </DetailItem>
          <DetailItem label="Style Club">
            <Badge variant={user.isStyleClubMember ? "default" : "outline"}>
              {user.isStyleClubMember ? "Member" : "No"}
            </Badge>
          </DetailItem>
        </Section>

        <Separator />

        <Section title="Classification">
          <DetailItem label="Status">{labelize(user.userStatus)}</DetailItem>
          <DetailItem label="Customer type">
            {labelize(user.customerType)}
          </DetailItem>
          <DetailItem label="Segment">
            {labelize(user.customerSegment)}
          </DetailItem>
          <DetailItem label="CC due">
            {formatProfileDate(user.ccDueDate?.timestamp)}
          </DetailItem>
        </Section>

        <Separator />

        <Section title="Assignment">
          <DetailItem label="Stylist">
            {user.stylist?.[0]?.name || "—"}
          </DetailItem>
          <DetailItem label="Secondary stylists">{secondary}</DetailItem>
          <DetailItem label="Studio">
            {user.studios?.[0]?.name || "—"}
          </DetailItem>
        </Section>

        <Separator />

        <Section title="Location">
          <DetailItem label="City">{user.cityName || "—"}</DetailItem>
          <DetailItem label="State">{user.stateName || "—"}</DetailItem>
          <DetailItem label="Country">{user.countryName || "—"}</DetailItem>
        </Section>

        {user.remarks ? (
          <>
            <Separator />
            <Section title="Remarks">
              <div className="sm:col-span-2">
                <p className="text-sm whitespace-pre-wrap">{user.remarks}</p>
              </div>
            </Section>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
