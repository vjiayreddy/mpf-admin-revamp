"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  crossSellLabels,
  studioName,
  stylistName,
  type CifListRow,
} from "@/lib/apollo/queries/cif"

function formatDate(value?: string | null) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <p className="text-sm">
      <span className="font-medium">{label}: </span>
      <span className="text-muted-foreground">{value ?? "N/A"}</span>
    </p>
  )
}

type QuickCifViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CifListRow | null
}

export function QuickCifView({ open, onOpenChange, data }: QuickCifViewProps) {
  const name =
    `${data?.firstName ?? ""} ${data?.lastName ?? ""}`.trim() || "N/A"
  const phone = data?.phone
    ? `+${data.countryCode ?? ""} ${data.phone}`.trim()
    : "N/A"
  const lead = data?.leads?.[0]
  const profileUserId = data?.userId

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>CIF details</SheetTitle>
          <SheetDescription>
            {data?.cifSerialNumber
              ? `Form #${data.cifSerialNumber}`
              : "Read-only customer information summary"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
          <fieldset className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Customer</legend>
            <Detail label="Name" value={name} />
            <Detail label="Phone" value={phone} />
            <Detail label="Email" value={data?.email ?? "N/A"} />
            <Detail label="Gender" value={data?.gender ?? "N/A"} />
            <Detail
              label="Customer #"
              value={data?.customerSerialNo ?? "N/A"}
            />
            <Detail label="Status" value={data?.customerInfoStatus ?? "N/A"} />
            <Detail label="Rating" value={data?.rating ?? "N/A"} />
          </fieldset>

          <fieldset className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Visit</legend>
            <Detail
              label="Created"
              value={formatDate(data?.createdDate?.timestamp)}
            />
            <Detail
              label="Event date"
              value={formatDate(data?.eventDate?.timestamp)}
            />
            <Detail
              label="Follow-up"
              value={formatDate(data?.followUpDate?.timestamp)}
            />
            <Detail
              label="Last visited"
              value={formatDate(data?.lastVisitedDate?.timestamp)}
            />
            <Detail label="Studio" value={data ? studioName(data) : "N/A"} />
            <Detail label="Stylist" value={data ? stylistName(data) : "N/A"} />
            <Detail label="Looking for" value={data?.lookingFor ?? "N/A"} />
            <Detail
              label="Lookbook shared"
              value={data?.isLookBookShared ? "Yes" : "No"}
            />
          </fieldset>

          <fieldset className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Notes</legend>
            <Detail label="Note" value={data?.note ?? "N/A"} />
            <Detail
              label="Cross-sell note"
              value={data?.crossSellingNote ?? "N/A"}
            />
            <Detail
              label="Sales remark"
              value={data?.salesTeamRemarksNote ?? "N/A"}
            />
            <Detail
              label="Cross-sell categories"
              value={data ? crossSellLabels(data) : "N/A"}
            />
          </fieldset>

          {lead ? (
            <fieldset className="space-y-2 rounded-lg border p-3">
              <legend className="px-1 text-sm font-semibold">Linked lead</legend>
              <Detail label="Lead Id" value={lead.leadId ?? lead._id} />
              <Detail
                label="Name"
                value={
                  `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() ||
                  "N/A"
                }
              />
            </fieldset>
          ) : null}

          {(data?.occasionDetails?.length ?? 0) > 0 ? (
            <fieldset className="space-y-2 rounded-lg border p-3">
              <legend className="px-1 text-sm font-semibold">Occasions</legend>
              {data?.occasionDetails?.map((occ, index) => (
                <div
                  key={`${occ.occasion ?? "occ"}-${index}`}
                  className="border-b pb-2 last:border-0 last:pb-0"
                >
                  <Detail label="Occasion" value={occ.occasion ?? "N/A"} />
                  <Detail label="Budget" value={occ.budget ?? "N/A"} />
                  <Detail label="Quote" value={occ.priceQuote ?? "N/A"} />
                  <Detail label="Note" value={occ.outfitsNote ?? "N/A"} />
                </div>
              ))}
            </fieldset>
          ) : null}
        </div>

        <SheetFooter className="gap-2 sm:flex-row">
          {profileUserId ? (
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/customers/${profileUserId}`} />}
            >
              Open profile
            </Button>
          ) : null}
          {data?._id ? (
            <Button
              type="button"
              nativeButton={false}
              render={<Link href={`/cif/form?cifId=${data._id}`} />}
            >
              Edit CIF
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
